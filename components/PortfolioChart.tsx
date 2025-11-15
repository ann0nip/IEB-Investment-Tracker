"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyData } from "@/lib/portfolio-utils";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface PortfolioChartProps {
	data: MonthlyData[];
}

export function PortfolioChart({ data }: PortfolioChartProps) {
	// Si no hay datos, mostrar mensaje
	if (data.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="text-xl font-semibold">
						📈 Evolución del Portfolio
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[400px] text-muted-foreground">
						No hay datos disponibles para mostrar el gráfico
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">
					📈 Evolución del Portfolio
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={400}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<defs>
							{/* Gradiente para área de ganancia (verde) */}
							<linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
							</linearGradient>
							{/* Gradiente para área de pérdida (rojo) */}
							<linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
							</linearGradient>
						</defs>

						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

						<XAxis
							dataKey="month"
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>

						<YAxis
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
						/>

						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "var(--radius)",
							}}
							formatter={(value: number) => formatCurrency(value)}
							labelStyle={{ color: "hsl(var(--foreground))" }}
						/>

						<Legend
							wrapperStyle={{
								paddingTop: "20px",
							}}
						/>

						{/* Área entre las líneas para visualizar ganancia/pérdida */}
						<Area
							type="monotone"
							dataKey="currentValue"
							stroke="none"
							fill="url(#colorGain)"
							fillOpacity={1}
						/>

						{/* Línea de monto invertido */}
						<Line
							type="monotone"
							dataKey="invested"
							stroke="#94a3b8"
							strokeWidth={2}
							dot={false}
							name="Invertido"
						/>

						{/* Línea de valor actual */}
						<Line
							type="monotone"
							dataKey="currentValue"
							stroke="#10b981"
							strokeWidth={2}
							dot={false}
							name="Valor Actual"
						/>
					</AreaChart>
				</ResponsiveContainer>

				{/* Leyenda adicional */}
				<div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="w-4 h-0.5 bg-[#94a3b8]" />
						<span>Total Invertido Acumulado</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-0.5 bg-[#10b981]" />
						<span>Valor Actual del Portfolio</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 bg-[#10b981] opacity-30" />
						<span>Área de Ganancia/Pérdida</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
