import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface PortfolioSummaryProps {
	totalInvested: number;
	currentValue: number;
	gainLoss: number;
	gainLossPercent: number;
}

export function PortfolioSummary({
	totalInvested,
	currentValue,
	gainLoss,
	gainLossPercent,
}: PortfolioSummaryProps) {
	const isPositive = gainLoss >= 0;

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					📊 Resumen del Portfolio
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Total Invertido */}
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							💵 Total Invertido
						</div>
						<div className="text-2xl font-bold">
							{formatCurrency(totalInvested)}
						</div>
					</div>

					{/* Valor Actual */}
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							🏦 Valor Actual
						</div>
						<div className="text-2xl font-bold">
							{formatCurrency(currentValue)}
						</div>
					</div>

					{/* Ganancia/Pérdida Absoluta */}
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							📈 Ganancia/Pérdida
						</div>
						<div className="flex items-center gap-2">
							<div
								className={`text-2xl font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
							>
								{isPositive ? "+" : ""}
								{formatCurrency(gainLoss)}
							</div>
						</div>
						<Badge
							variant={isPositive ? "default" : "destructive"}
							className="w-fit"
						>
							{isPositive ? "Ganancia" : "Pérdida"}
						</Badge>
					</div>

					{/* Rendimiento Porcentual */}
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							📊 Rendimiento
						</div>
						<div
							className={`text-2xl font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
						>
							{formatPercent(gainLossPercent)}
						</div>
						<Badge
							variant={isPositive ? "default" : "destructive"}
							className="w-fit"
						>
							{isPositive ? "↑ Positivo" : "↓ Negativo"}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
