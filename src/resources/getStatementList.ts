/**
 * Get Statement List Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Statement%20List/getStatements
 */
export interface GetStatementListQuery {
	/**
	 * Number of the requested page. Default is 1.
	 */
	page?: number;
	/**
	 * Number of items on the page. Default is 15.
	 */
	size?: number;
	/**
	 * Parameter content type: application/json
	 */
	body: {
		/**
		 * The number of account without prefix and bankCode
		 */
		accountNumber: string;
		/**
		 * Currency code of the account in ISO-4217 standard (e.g. czk, eur, usd)
		 */
		currency: string;
		/**
		 * Statement line
		 *
		 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Statement%20List/getStatements
		 */
		statementLine: string;
		/**
		 * Defines date from which transactions will be requested. Example values - 2021-08-01
		 */
		dateFrom: Date;
		/**
		 * Defines date until which transactions will be requested. Example values - 2021-08-02
		 */
		dateTo: Date;
	};
}

export interface Statement {
	statementId: string;
	accountId: number;
	statementNumber: string;
	dateFrom: Date;
	dateTo: Date;
	currency: string;
	statementFormats: string[];
}

/**
 * Get Statement List Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Statement%20List/getStatements
 */
export interface GetStatementListResponse {
	statements: Statement[];
	page: number;
	size: number;
	first: boolean;
	last: boolean;
	totalPages: number;
	totalSize: number;
}
