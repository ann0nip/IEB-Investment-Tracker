'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, PlusCircle, DollarSign, PieChart } from 'lucide-react'

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
  { id: 1, category: 'Equities Growth (CEDEARs)', ticker: 'AMZN', percent: 13.29, months: {} },
  { id: 2, category: 'Equities Growth (CEDEARs)', ticker: 'MSFT', percent: 12.98, months: {} },
  { id: 3, category: 'Equities Growth (CEDEARs)', ticker: 'JPM', percent: 8.40, months: {} },
  { id: 4, category: 'Equities Growth (CEDEARs)', ticker: 'XLF', percent: 8.22, months: {} },
  { id: 5, category: 'Equities Growth (CEDEARs)', ticker: 'GS', percent: 0, months: {} },
  { id: 6, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'UNH', percent: 8.58, months: {} },
  { id: 7, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'XLV', percent: 8.64, months: {} },
  { id: 8, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'CAT', percent: 0, months: {} },
  { id: 9, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'PFE', percent: 0, months: {} },
  { id: 10, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'BIIB', percent: 0, months: {} },
  { id: 11, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'MMM', percent: 0, months: {} },
  { id: 12, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'DIA', percent: 0, months: {} },
  { id: 13, category: 'Equities Value/Defensivos (CEDEARs)', ticker: 'JNJ', percent: 6.73, months: {} },
  { id: 14, category: 'FCI Líquido', ticker: 'Ciclo Nova II Clase A', percent: 6.28, months: {} },
  { id: 15, category: 'Fixed Income Corporativo', ticker: 'YPFD', percent: 12.17, months: {} },
  { id: 16, category: 'Fixed Income Corporativo', ticker: 'PAMPD', percent: 9.10, months: {} },
  { id: 17, category: 'Fixed Income Corporativo', ticker: 'TXARD', percent: 0, months: {} },
  { id: 18, category: 'Fixed Income Corporativo', ticker: 'ONs YM39D & YMCID', percent: 0, months: {} },
  { id: 19, category: 'Soberanos', ticker: 'GD30D', percent: 5.62, months: {} },
  { id: 20, category: 'Soberanos', ticker: 'GD35D', percent: 0, months: {} },
]

export default function InvestmentTracker() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [operations, setOperations] = useState<Operation[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<number>(1)
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [qty, setQty] = useState('')
  const [currentValue, setCurrentValue] = useState<Record<string, number>>({})

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('investmentAssets')
    const savedOperations = localStorage.getItem('investmentOperations')
    const savedCurrentValues = localStorage.getItem('investmentCurrentValues')

    if (savedAssets) setAssets(JSON.parse(savedAssets))
    if (savedOperations) setOperations(JSON.parse(savedOperations))
    if (savedCurrentValues) setCurrentValue(JSON.parse(savedCurrentValues))

    // Set default date to today
    const today = new Date()
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    setDate(formattedDate)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('investmentAssets', JSON.stringify(assets))
  }, [assets])

  useEffect(() => {
    localStorage.setItem('investmentOperations', JSON.stringify(operations))
  }, [operations])

  useEffect(() => {
    localStorage.setItem('investmentCurrentValues', JSON.stringify(currentValue))
  }, [currentValue])

  const addMonthlyData = () => {
    const asset = assets.find(a => a.id === selectedAssetId)
    if (!asset || (!amount && !qty)) return

    const newOp: Operation = {
      date,
      ticker: asset.ticker,
      amount: parseFloat(amount) || 0,
      qty: parseFloat(qty) || 0
    }

    setOperations(prev => [...prev, newOp])

    const key = date.replace(/\//g, '-')
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

  const updateCurrentValue = (ticker: string, value: string) => {
    setCurrentValue(prev => ({ ...prev, [ticker]: parseFloat(value) || 0 }))
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

  const calculateGainLoss = (ticker: string) => {
    const asset = assets.find(a => a.ticker === ticker)
    if (!asset) return { value: '0.00', isPositive: true }
    
    const cumul = calculateCumulative(asset.months)
    const curr = currentValue[ticker] || 0
    const gainLoss = cumul > 0 ? ((curr - cumul) / cumul * 100) : 0
    
    return {
      value: Math.abs(gainLoss).toFixed(2),
      isPositive: gainLoss >= 0
    }
  }

  const totalInvested = assets.reduce((sum, a) => sum + calculateCumulative(a.months), 0)
  const totalCurrentValue = assets.reduce((sum, a) => sum + (currentValue[a.ticker] || 0), 0)
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
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Ticker</label>
                <Select value={selectedAssetId.toString()} onValueChange={(v) => setSelectedAssetId(parseInt(v))}>
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
                <Input
                  placeholder="DD/MM/YYYY"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Monto ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>

              <div className="md:col-span-5 flex justify-end">
                <Button onClick={addMonthlyData} className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Table */}
        <Card>
          <CardHeader>
            <CardTitle>Portafolio de Inversiones</CardTitle>
            <CardDescription>Vista detallada de todos tus activos</CardDescription>
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
                    <TableHead className="text-right">Valor Actual</TableHead>
                    <TableHead className="text-right">Gan/Perd %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(asset => {
                    const cumul = calculateCumulative(asset.months)
                    const dynPercent = calculateDynamicPercent(cumul, totalInvested)
                    const gainLoss = calculateGainLoss(asset.ticker)

                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium text-sm">
                          <Badge variant="outline" className="text-xs">
                            {asset.category.split(' ')[0]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">{asset.ticker}</TableCell>
                        <TableCell className="text-right">{dynPercent}%</TableCell>
                        <TableCell className="text-right font-medium">${cumul.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{calculateCumulQty(asset.months).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${calculateAvgPrice(asset.months).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="w-28 h-8 text-right"
                            onChange={(e) => updateCurrentValue(asset.ticker, e.target.value)}
                            value={currentValue[asset.ticker] || ''}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={gainLoss.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
                            {gainLoss.isPositive ? '+' : '-'}{gainLoss.value}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
