/**
 * Portfolio calculation utilities
 * Funciones para calcular métricas del portfolio
 */

export interface Asset {
	id: number;
	category: string;
	ticker: string;
	percent: number;
	months: Record<string, { amount: number; qty: number }>;
}

export interface MonthlyData {
	month: string;
	invested: number;
	currentValue: number;
	gainLoss: number;
}

/**
 * Calcula el valor actual total del portfolio
 * @param assets - Array de assets con datos acumulados
 * @param currentValues - Objeto con precios actuales por ticker
 * @returns Valor total actual del portfolio en USD
 */
export function calculateCurrentPortfolioValue(
	assets: Asset[],
	currentValues: Record<string, number | null>,
): number {
	return assets.reduce((sum, asset) => {
		const currentPrice = currentValues[asset.ticker] || 0;
		const totalQty = Object.values(asset.months).reduce(
			(qtySum, month) => qtySum + month.qty,
			0,
		);
		return sum + currentPrice * totalQty;
	}, 0);
}

/**
 * Calcula el total invertido en el portfolio
 * @param assets - Array de assets con datos acumulados
 * @returns Total invertido en USD
 */
export function calculateTotalInvested(assets: Asset[]): number {
	return assets.reduce((sum, asset) => {
		const totalAmount = Object.values(asset.months).reduce(
			(amountSum, month) => amountSum + month.amount,
			0,
		);
		return sum + totalAmount;
	}, 0);
}

/**
 * Genera datos mensuales para el gráfico de evolución del portfolio
 * @param assets - Array de assets con datos acumulados
 * @param currentValues - Objeto con precios actuales por ticker
 * @returns Array de datos mensuales para el gráfico
 */
export function generateMonthlyChartData(
	assets: Asset[],
	currentValues: Record<string, number | null>,
): MonthlyData[] {
	// Recolectar todos los meses únicos de todos los assets
	const allMonthsSet = new Set<string>();
	for (const asset of assets) {
		for (const month of Object.keys(asset.months)) {
			allMonthsSet.add(month);
		}
	}

	// Ordenar meses cronológicamente (formato: "YYYY-MM")
	const sortedMonths = Array.from(allMonthsSet).sort();

	// Generar datos acumulados por mes
	const monthlyData: MonthlyData[] = sortedMonths.map((month) => {
		let investedUpToMonth = 0;
		let currentValueUpToMonth = 0;

		// Para cada asset, sumar lo invertido y el valor actual hasta este mes
		for (const asset of assets) {
			const currentPrice = currentValues[asset.ticker] || 0;

			// Sumar todas las cantidades y montos hasta este mes
			for (const [assetMonth, data] of Object.entries(asset.months)) {
				if (assetMonth <= month) {
					investedUpToMonth += data.amount;
					currentValueUpToMonth += currentPrice * data.qty;
				}
			}
		}

		return {
			month: formatMonthLabel(month),
			invested: investedUpToMonth,
			currentValue: currentValueUpToMonth,
			gainLoss: currentValueUpToMonth - investedUpToMonth,
		};
	});

	return monthlyData;
}

/**
 * Formatea el label del mes para el gráfico
 * @param month - Mes en formato "YYYY-MM"
 * @returns Label formateado (ej: "Ene 2024")
 */
function formatMonthLabel(month: string): string {
	const monthNames = [
		"Ene",
		"Feb",
		"Mar",
		"Abr",
		"May",
		"Jun",
		"Jul",
		"Ago",
		"Sep",
		"Oct",
		"Nov",
		"Dic",
	];

	const [year, monthNum] = month.split("-");
	const monthIndex = Number.parseInt(monthNum, 10) - 1;

	return `${monthNames[monthIndex]} ${year}`;
}
