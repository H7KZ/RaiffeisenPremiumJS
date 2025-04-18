/**
 * Get FX Rates Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Fx%20Rates/getFxRates
 */
export interface GetFxRatesQuery {
	/**
	 * Currency code of the account in ISO-4217 standard (e.g. czk, eur, usd)
	 */
	currencyCode: string;
	/**
	 * The effective date for which the FX rates are requested. Will default to now when not specified.
	 */
	date?: Date;
}

export interface ExchangeRate {
	countryFlagPath: string;
	currencyFrom: string;
	currencyTo: string;
	exchangeRateBuy: number;
	exchangeRateBuyCash: number;
	exchangeRateCenter: number;
	exchangeRateCenterChange: number;
	exchangeRateSell: number;
	exchangeRateSellCash: number;
	exchangeRateSellCenter: number;
	exchangeRateSellCenterPrevious: number;
	exchangeRateEcbRate: number;
	exchangeRateEcbVariation: number;
	fixedCountryCode: string;
	fixedCountryName: string;
	quotationType: string;
	unitsFrom: number;
	variableCountryCode: string;
	variableCountryName: string;
}

/**
 * Get FX Rates Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Fx%20Rates/getFxRates
 */
export interface GetFxRatesResponse {
	exchangeRateLists: {
		effectiveDateFrom: Date;
		effectiveDateTo: Date;
		tradingDate: Date;
		ordinalNumber: number;
		lastRates: boolean;
		exchangeRates: ExchangeRate[];
	}[];
}
