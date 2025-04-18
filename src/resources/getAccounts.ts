/**
 * Get Accounts Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Accounts/getAccounts
 */
export interface GetAccountsQuery {
	/**
	 * Number of the requested page. Default is 1.
	 */
	page?: number;
	/**
	 * Number of items on the page. Default is 15.
	 */
	size?: number;
}

export interface Account {
	accountId: string;
	accountName: string;
	friendlyName: string;
	accountNumber: number;
	accountNumberPrefix: string;
	iban: string;
	bankCode: number;
	bankBicCode: string;
	mainCurrency: string;
	accountTypeId: string;
}

/**
 * Get Accounts Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Accounts/getAccounts
 */
export interface GetAccountsResponse {
	accounts: Account[];
	page: number;
	size: number;
	first: boolean;
	last: boolean;
	totalPages: number;
	totalSize: number;
}
