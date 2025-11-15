import currency from 'currency.js'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'

type Asset = {
  id: number
  category: string
  ticker: string
  percent: number
  months: Record<string, { amount: number; qty: number }>
}

type PortfolioRowProps = {
  asset: Asset
  cumul: number
  qty: number
  avgPrice: number
  dynPercent: string
  price: number | null
  gainLoss: { value: string; isPositive: boolean }
  isLoading: boolean
}

export const PortfolioRow = memo(function PortfolioRow({
  asset,
  cumul,
  qty,
  avgPrice,
  dynPercent,
  price,
  gainLoss,
  isLoading,
}: PortfolioRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium text-sm">
        <Badge variant="outline" className="text-xs">
          {asset.category.split(' ')[0]}
        </Badge>
      </TableCell>
      <TableCell className="font-mono font-semibold">{asset.ticker}</TableCell>
      <TableCell className="text-right">{dynPercent}%</TableCell>
      <TableCell className="text-right font-medium">{currency(cumul).format()}</TableCell>
      <TableCell className="text-right">
        {currency(qty, { precision: 2, symbol: '' }).format()}
      </TableCell>
      <TableCell className="text-right">{currency(avgPrice, { precision: 3 }).format()}</TableCell>
      <TableCell className="text-right font-medium">
        {price !== null && price > 0 ? (
          <span className={isLoading ? 'text-muted-foreground' : ''}>
            {currency(price, { precision: 3 }).format()}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <span className={gainLoss.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
          {gainLoss.isPositive ? '+' : '-'}
          {gainLoss.value}%
        </span>
      </TableCell>
    </TableRow>
  )
})
