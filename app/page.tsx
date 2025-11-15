'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import currency from 'currency.js'
import {
  DollarSign,
  PieChart,
  PlusCircle,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PortfolioChart } from '@/components/PortfolioChart'
import { PortfolioRow } from '@/components/PortfolioRow'
import { PortfolioSummary } from '@/components/PortfolioSummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketPrices } from '@/lib/hooks/useMarketPrices'
import { generateMonthlyChartData } from '@/lib/portfolio-utils'
import { type OperationFormData, operationSchema } from '@/lib/schemas/operation'
import { formatDate } from '@/lib/utils'

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
  { id: 3, category: 'Equities Growth (CEDEARs)', ticker: 'JPMD', percent: 8.4, months: {} },
  { id: 4, category: 'Equities Growth (CEDEARs)', ticker: 'XLFD', percent: 8.22, months: {} },
  { id: 5, category: 'Equities Growth (CEDEARs)', ticker: 'GSD', percent: 0, months: {} },
  {
    id: 6,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'UNHD',
    percent: 8.58,
    months: {},
  },
  {
    id: 7,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'XLVD',
    percent: 8.64,
    months: {},
  },
  {
    id: 8,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'CATD',
    percent: 0,
    months: {},
  },
  {
    id: 9,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'PFED',
    percent: 0,
    months: {},
  },
  {
    id: 10,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'BIIBD',
    percent: 0,
    months: {},
  },
  {
    id: 11,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'MMMD',
    percent: 0,
    months: {},
  },
  {
    id: 12,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'DIAD',
    percent: 0,
    months: {},
  },
  {
    id: 13,
    category: 'Equities Value/Defensivos (CEDEARs)',
    ticker: 'JNJD',
    percent: 6.73,
    months: {},
  },
  { id: 14, category: 'FCI Líquido', ticker: 'Ciclo Nova II Clase A', percent: 6.28, months: {} },
  { id: 15, category: 'Fixed Income Acciones', ticker: 'YPFDD', percent: 12.17, months: {} },
  { id: 16, category: 'Fixed Income Acciones', ticker: 'PAMPD', percent: 9.1, months: {} },
  { id: 17, category: 'Fixed Income Acciones', ticker: 'TXARD', percent: 0, months: {} },
  { id: 18, category: 'Fixed Income Corporativo (ONs)', ticker: 'YM39D', percent: 0, months: {} },
  { id: 19, category: 'Fixed Income Corporativo (ONs)', ticker: 'YMCID', percent: 0, months: {} },
  { id: 20, category: 'Soberanos', ticker: 'GD30D', percent: 5.62, months: {} },
  { id: 21, category: 'Soberanos', ticker: 'GD35D', percent: 0, months: {} },
]

export default function InvestmentTracker() {
  // Single source of truth: operations
  const [operations, setOperations] = useState<Operation[]>([])

  // React Hook Form with Zod validation
  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      assetId: 1,
      date: new Date(),
      amount: 0,
      qty: undefined,
    },
  })

  const selectedAssetId = form.watch('assetId')

  // Helper to check if asset category requires fixed quantity = 1
  const isFixedQuantityCategory = useCallback((category: string) => {
    return category === 'Soberanos' || category === 'FCI Líquido'
  }, [])

  // Get selected asset
  const selectedAsset = useMemo(
    () => initialAssets.find(a => a.id === selectedAssetId),
    [selectedAssetId]
  )

  // Derive assets from operations (single source of truth)
  // This prevents state synchronization bugs
  const assets = useMemo(() => {
    return initialAssets.map(asset => {
      // Get all operations for this asset
      const assetOps = operations.filter(op => op.ticker === asset.ticker)

      // Group operations by date into months
      const months = assetOps.reduce(
        (acc, op) => {
          const key = op.date.replace(/\//g, '-')
          if (!acc[key]) {
            acc[key] = { amount: 0, qty: 0 }
          }
          acc[key].amount += op.amount
          acc[key].qty += op.qty
          return acc
        },
        {} as Record<string, { amount: number; qty: number }>
      )

      return { ...asset, months }
    })
  }, [operations])

  const onSubmit = (data: OperationFormData) => {
    const asset = initialAssets.find(a => a.id === data.assetId)
    if (!asset) return

    const dateStr = formatDate(data.date)
    // For Soberanos and FCI, quantity is always 1
    const qty = isFixedQuantityCategory(asset.category) ? 1 : data.qty || 0

    const newOp: Operation = {
      date: dateStr,
      ticker: asset.ticker,
      amount: data.amount,
      qty,
    }

    // Simply add to operations - assets will be derived automatically
    setOperations(prev => [...prev, newOp])

    // Reset form
    form.reset({
      assetId: data.assetId,
      date: new Date(),
      amount: 0,
      qty: undefined,
    })

    toast.success('Operación agregada')
  }

  const deleteOperation = (index: number) => {
    // Simply remove from operations - assets will be re-derived automatically
    setOperations(prev => prev.filter((_, i) => i !== index))
    toast.success('Operación eliminada')
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

  // Helper function to truncate decimals instead of rounding
  const truncate = (value: number, decimals: number = 3): number => {
    const multiplier = 10 ** decimals
    return Math.floor(value * multiplier) / multiplier
  }

  const calculateCumulative = useCallback(
    (months: Record<string, { amount: number; qty: number }>) =>
      Object.values(months).reduce((sum, m) => currency(sum).add(m.amount || 0).value, 0),
    []
  )

  const calculateCumulQty = useCallback(
    (months: Record<string, { amount: number; qty: number }>) =>
      Object.values(months).reduce((sum, m) => currency(sum).add(m.qty || 0).value, 0),
    []
  )

  const calculateAvgPrice = (months: Record<string, { amount: number; qty: number }>) => {
    const totalAmt = calculateCumulative(months)
    const totalQty = calculateCumulQty(months)
    // Force higher precision during division to avoid rounding
    if (totalQty === 0) return 0
    const rawResult = totalAmt / totalQty
    return truncate(rawResult, 3)
  }

  const calculateDynamicPercent = (cumul: number, total: number) =>
    total > 0
      ? currency(truncate((cumul / total) * 100, 2), { precision: 2, symbol: '' }).format()
      : '0.00'

  // Get ALL tickers for price fetching (not filtered by quantity)
  // This ensures we fetch all prices once on mount, not on every operation add
  const tickers = useMemo(() => {
    return initialAssets.map(a => a.ticker)
  }, []) // Empty deps - only compute once

  // Market prices hook - will fetch once on mount
  const { prices, loading, refreshPrices, getPrice, isLoadingTicker } = useMarketPrices(tickers)

  // Filter assets that have quantity > 0 (for display only, not for fetching)
  const assetsWithQuantity = useMemo(() => {
    return assets.filter(a => {
      const qty = calculateCumulQty(a.months)
      return qty > 0
    })
  }, [assets, calculateCumulQty])

  const calculateGainLoss = (ticker: string) => {
    const asset = assets.find(a => a.ticker === ticker)
    if (!asset) return { value: '0.00', isPositive: true }

    // For Soberanos and FCI, always return 0%
    if (isFixedQuantityCategory(asset.category)) {
      return { value: '0.00', isPositive: true }
    }

    const cumul = calculateCumulative(asset.months)
    const qty = calculateCumulQty(asset.months)
    const price = getPrice(ticker) || 0
    const curr = qty * price // Use native JS multiplication
    // Use native JS arithmetic to avoid currency.js rounding
    const gainLoss = cumul > 0 ? truncate(((curr - cumul) / cumul) * 100, 2) : 0

    return {
      value: currency(Math.abs(gainLoss), { precision: 2, symbol: '' }).format(),
      isPositive: gainLoss >= 0,
    }
  }

  const totalInvested = useMemo(() => {
    return assetsWithQuantity.reduce(
      (sum, a) => currency(sum).add(calculateCumulative(a.months)).value,
      0
    )
  }, [assetsWithQuantity, calculateCumulative])

  const totalCurrentValue = useMemo(() => {
    return assetsWithQuantity.reduce((sum, a) => {
      const qty = calculateCumulQty(a.months)
      const price = prices[a.ticker.toUpperCase()] ?? null
      return sum + qty * (price || 0) // Use native JS arithmetic
    }, 0)
  }, [assetsWithQuantity, prices, calculateCumulQty])

  const totalGainLoss =
    totalInvested > 0 ? truncate(((totalCurrentValue - totalInvested) / totalInvested) * 100, 2) : 0

  const absoluteGainLoss = useMemo(() => {
    return totalCurrentValue - totalInvested
  }, [totalCurrentValue, totalInvested])

  const monthlyChartData = useMemo(() => {
    return generateMonthlyChartData(assetsWithQuantity, prices)
  }, [assetsWithQuantity, prices])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">IEB+ Investment Tracker</h1>
          <p className="text-muted-foreground">
            Seguimiento completo de tu portafolio de inversiones
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invertido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency(totalInvested).format()}</div>
              <p className="text-xs text-muted-foreground">Capital acumulado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Actual</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency(totalCurrentValue).format()}</div>
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
              <div
                className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                {totalGainLoss >= 0 ? '+' : ''}
                {currency(totalGainLoss, { precision: 2, symbol: '' }).format()}%
              </div>
              <p className="text-xs text-muted-foreground">Rendimiento total</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary
          totalInvested={totalInvested}
          currentValue={totalCurrentValue}
          gainLoss={absoluteGainLoss}
          gainLossPercent={totalGainLoss}
        />

        {/* Portfolio Chart */}
        <PortfolioChart data={monthlyChartData} />

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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ticker</label>
                  <Select
                    value={form.watch('assetId').toString()}
                    onValueChange={v => form.setValue('assetId', parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar ticker..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {initialAssets.map(a => (
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
                    selected={form.watch('date')}
                    onSelect={date => form.setValue('date', date || new Date())}
                  />
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Monto ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Cantidad
                    {selectedAsset && isFixedQuantityCategory(selectedAsset.category) && (
                      <span className="text-xs text-muted-foreground ml-2">(fijo en 1)</span>
                    )}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={
                      selectedAsset && isFixedQuantityCategory(selectedAsset.category)
                        ? '1'
                        : form.watch('qty') || ''
                    }
                    {...form.register('qty', { valueAsNumber: true })}
                    disabled={selectedAsset && isFixedQuantityCategory(selectedAsset.category)}
                    className={
                      selectedAsset && isFixedQuantityCategory(selectedAsset.category)
                        ? 'bg-muted cursor-not-allowed'
                        : ''
                    }
                  />
                  {form.formState.errors.qty && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.qty.message}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Operación
              </Button>
            </form>
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
                Actualizar precios
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
                        No hay instrumentos con cantidad registrada. Agrega una operación para
                        comenzar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assetsWithQuantity.map(asset => {
                      const cumul = calculateCumulative(asset.months)
                      const qty = calculateCumulQty(asset.months)
                      const avgPrice = calculateAvgPrice(asset.months)
                      const dynPercent = calculateDynamicPercent(cumul, totalInvested)
                      const gainLoss = calculateGainLoss(asset.ticker)
                      const isLoading = isLoadingTicker(asset.ticker)
                      const price = getPrice(asset.ticker)

                      return (
                        <PortfolioRow
                          key={asset.id}
                          asset={asset}
                          cumul={cumul}
                          qty={qty}
                          avgPrice={avgPrice}
                          dynPercent={dynPercent}
                          price={price}
                          gainLoss={gainLoss}
                          isLoading={isLoading}
                        />
                      )
                    })
                  )}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">{currency(totalInvested).format()}</TableCell>
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
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay operaciones registradas aún
                      </TableCell>
                    </TableRow>
                  ) : (
                    operations.map((op, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{op.date}</TableCell>
                        <TableCell className="font-mono font-semibold">{op.ticker}</TableCell>
                        <TableCell className="text-right">{currency(op.amount).format()}</TableCell>
                        <TableCell className="text-right">
                          {currency(op.qty, { precision: 2, symbol: '' }).format()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOperation(idx)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
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
