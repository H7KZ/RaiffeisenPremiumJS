/**
 * Get Account Balance Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Account%20Balance/getBalance
 */
export interface GetAccountBalanceQuery {
	/**
	 * The number of account without prefix and bankCode
	 */
	accountNumber: string;
}

export interface Balance {
	balanceType: string;
	currency: string;
	value: number;
}

export interface CurrencyFolder {
	currency: string;
	status: string;
	balances: Balance[];
}

/**
 * Get Account Balance Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Account%20Balance/getBalance
 */
export interface GetAccountBalanceResponse {
	numberPart1: string;
	numberPart2: string;
	bankCode: string;
	currencyFolders: CurrencyFolder[];
}
