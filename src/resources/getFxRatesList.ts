import { ExchangeRate } from './getFxRates';

/**
 * Get FX Rates List Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Fx%20Rates%20List/getFxRatesList
 */
export interface GetFxRatesListQuery {
	/**
	 * The effective date for which the FX rates list is requested. Will default to now when not specified.
	 */
	date?: Date;
}

/**
 * Get FX Rates List Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Fx%20Rates%20List/getFxRatesList
 */
export interface GetFxRatesListResponse {
	exchangeRateLists: {
		effectiveDateFrom: Date;
		effectiveDateTo: Date;
		tradingDate: Date;
		ordinalNumber: number;
		lastRates: boolean;
		exchangeRates: ExchangeRate[];
	}[];
}
