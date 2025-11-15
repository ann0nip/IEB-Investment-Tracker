'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DateInput } from '@/components/ui/date-input'
import { TrendingUp, TrendingDown, PlusCircle, DollarSign, PieChart, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useMarketPrices } from '@/lib/hooks/useMarketPrices'
import { toast } from 'sonner'

type Asset = {
  id: number
  category: string
  ticker: string
  percent: number
  months: Record<string, { amount: number; qty: number }>
}

type Operation = {
  date: string
  ticker: string
  amount: number
  qty: number
}

const initialAssets: Asset[] = [
  { id: 1, category: 'Equities Growth (CEDEARs)', ticker: 'AMZND', percent: 13.29, months: {} },
  { id: 2, category: 'Equities Growth (CEDEARs)', ticker: 'MSFTD', percent: 12.98, months: {} },
  { id: 3, category: 'Equities Growth (CEDEARs)', ticker: 'JPMD', percent: 8.40, months: {} },
  { id: 4, category: 'Equities Growth (CEDEARs)', ticker: 'XLFD', percent: 8.22, months: {} },
  { id: 5, category: 'Equities Growth (CEDEARs)', ticker: 'GSD', percent: 0, months: {} },
  { id: 6, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'UNHD', percent: 8.58, months: {} },
  { id: 7, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'XLVD', percent: 8.64, months: {} },
  { id: 8, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'CATD', percent: 0, months: {} },
  { id: 9, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'PFED', percent: 0, months: {} },
  { id: 10, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'BIIBD', percent: 0, months: {} },
  { id: 11, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'MMMD', percent: 0, months: {} },
  { id: 12, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'DIAD', percent: 0, months: {} },
  { id: 13, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'JNJD', percent: 6.73, months: {} },
  { id: 14, category: 'FCI Líquido', ticker: 'Ciclo Nova II Clase A', percent: 6.28, months: {} },
  { id: 15, category: 'Fixed Income Acciones', ticker: 'YPFDD', percent: 12.17, months: {} },
  { id: 16, category: 'Fixed Income Acciones', ticker: 'PAMPD', percent: 9.10, months: {} },
  { id: 17, category: 'Fixed Income Acciones', ticker: 'TXARD', percent: 0, months: {} },
  { id: 18, category: 'Fixed Income Corporativo (ONs)', ticker: 'YM39D', percent: 0, months: {} },
  { id: 19, category: 'Fixed Income Corporativo (ONs)', ticker: 'YMCID', percent: 0, months: {} },
  { id: 20, category: 'Soberanos', ticker: 'GD30D', percent: 5.62, months: {} },
  { id: 21, category: 'Soberanos', ticker: 'GD35D', percent: 0, months: {} },
]

export default function InvestmentTracker() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [operations, setOperations] = useState<Operation[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<number>(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState('')
  const [qty, setQty] = useState('')

  const addMonthlyData = () => {
    const asset = assets.find(a => a.id === selectedAssetId)
    if (!asset || (!amount && !qty) || !date) return

    const dateStr = formatDate(date)
    const newOp: Operation = {
      date: dateStr,
      ticker: asset.ticker,
      amount: parseFloat(amount) || 0,
      qty: parseFloat(qty) || 0
    }

    setOperations(prev => [...prev, newOp])

    const key = dateStr.replace(/\//g, '-')
    setAssets(assets.map(a =>
      a.id === selectedAssetId
        ? {
            ...a,
            months: {
              ...a.months,
              [key]: {
                amount: (a.months[key]?.amount || 0) + (parseFloat(amount) || 0),
                qty: (a.months[key]?.qty || 0) + (parseFloat(qty) || 0)
              }
            }
          }
        : a
    ))

    setAmount('')
    setQty('')
  }

  // Update all prices from API
  const handleUpdateAllPrices = async () => {
    toast.loading('Actualizando precios...', { id: 'update-all' })

    try {
      await refreshPrices()
      const priceCount = Object.values(prices).filter(p => p !== null).length
      toast.success(`${priceCount} precios actualizados`, { id: 'update-all' })
    } catch (_error) {
      toast.error('Error al actualizar precios', { id: 'update-all' })
    }
  }

  const calculateCumulative = (months: Record<string, { amount: number; qty: number }>) =>
    Object.values(months).reduce((sum, m) => sum + (m.amount || 0), 0)

  const calculateCumulQty = (months: Record<string, { amount: number; qty: number }>) =>
    Object.values(months).reduce((sum, m) => sum + (m.qty || 0), 0)

  const calculateAvgPrice = (months: Record<string, { amount: number; qty: number }>) => {
    const totalAmt = calculateCumulative(months)
    const totalQty = calculateCumulQty(months)
    return totalQty > 0 ? totalAmt / totalQty : 0
  }

  const calculateDynamicPercent = (cumul: number, total: number) =>
    total > 0 ? (cumul / total * 100).toFixed(2) : '0.00'

  // Filter assets that have quantity > 0
  const assetsWithQuantity = useMemo(() => {
    return assets.filter(a => {
      const qty = calculateCumulQty(a.months)
      return qty > 0
    })
  }, [assets])

  // Get tickers only from assets with quantity
  const tickers = useMemo(() => {
    return assetsWithQuantity.map(a => a.ticker)
  }, [assetsWithQuantity])

  // Market prices hook with SWR
  const {
    prices,
    loading,
    refreshPrices,
    getPrice,
    isLoadingTicker,
  } = useMarketPrices(tickers)

  const calculateGainLoss = (ticker: string) => {
    const asset = assets.find(a => a.ticker === ticker)
    if (!asset) return { value: '0.00', isPositive: true }

    const cumul = calculateCumulative(asset.months)
    const qty = calculateCumulQty(asset.months)
    const price = getPrice(ticker) || 0
    const curr = qty * price
    const gainLoss = cumul > 0 ? ((curr - cumul) / cumul * 100) : 0

    return {
      value: Math.abs(gainLoss).toFixed(2),
      isPositive: gainLoss >= 0
    }
  }

  const totalInvested = useMemo(() => {
    return assetsWithQuantity.reduce((sum, a) => sum + calculateCumulative(a.months), 0)
  }, [assetsWithQuantity])

  const totalCurrentValue = useMemo(() => {
    return assetsWithQuantity.reduce((sum, a) => {
      const qty = calculateCumulQty(a.months)
      const price = prices[a.ticker.toUpperCase()] ?? null
      return sum + (qty * (price || 0))
    }, 0)
  }, [assetsWithQuantity, prices])

  const totalGainLoss = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100) : 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">IEB+ Investment Tracker</h1>
          <p className="text-muted-foreground">Seguimiento completo de tu portafolio de inversiones</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invertido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvested.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Capital acumulado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Actual</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCurrentValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Valorización total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancia/Pérdida</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Rendimiento total</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Operation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Agregar Operación
            </CardTitle>
            <CardDescription>Registra nuevas compras o aportes a tus activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ticker</label>
                <Select value={selectedAssetId.toString()} onValueChange={(v) => setSelectedAssetId(parseInt(v, 10))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.ticker} - {a.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fecha</label>
                <DateInput
                  selected={date}
                  onSelect={setDate}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Monto ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad</label>
                <Input
                  type="number"
                  placeholder="0"
                  step="0.01"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={addMonthlyData} className="w-full mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Operación
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portafolio de Inversiones</CardTitle>
                <CardDescription>Vista detallada de todos tus activos</CardDescription>
              </div>
              <Button
                onClick={handleUpdateAllPrices}
                variant="outline"
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar todos los precios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">% Dinámico</TableHead>
                    <TableHead className="text-right">Monto Acum.</TableHead>
                    <TableHead className="text-right">Cant. Acum.</TableHead>
                    <TableHead className="text-right">Precio Prom.</TableHead>
                    <TableHead className="text-right">Cotización</TableHead>
                    <TableHead className="text-right">Gan/Perd %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsWithQuantity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No hay instrumentos con cantidad registrada. Agrega una operación para comenzar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assetsWithQuantity.map(asset => {
                      const cumul = calculateCumulative(asset.months)
                      const dynPercent = calculateDynamicPercent(cumul, totalInvested)
                      const gainLoss = calculateGainLoss(asset.ticker)
                      const isLoading = isLoadingTicker(asset.ticker)
                      const price = getPrice(asset.ticker)
                      const qty = calculateCumulQty(asset.months)

                      return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium text-sm">
                            <Badge variant="outline" className="text-xs">
                              {asset.category.split(' ')[0]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono font-semibold">
                            {asset.ticker}
                          </TableCell>
                          <TableCell className="text-right">{dynPercent}%</TableCell>
                          <TableCell className="text-right font-medium">${cumul.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{qty.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${calculateAvgPrice(asset.months).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {price !== null && price > 0 ? (
                              <span className={isLoading ? 'text-muted-foreground' : ''}>
                                ${price.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={gainLoss.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
                              {gainLoss.isPositive ? '+' : '-'}{gainLoss.value}%
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">${totalInvested.toFixed(2)}</TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Operations History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Operaciones</CardTitle>
            <CardDescription>Todas las transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay operaciones registradas aún
                      </TableCell>
                    </TableRow>
                  ) : (
                    operations.map((op, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{op.date}</TableCell>
                        <TableCell className="font-mono font-semibold">{op.ticker}</TableCell>
                        <TableCell className="text-right">${op.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{op.qty.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
