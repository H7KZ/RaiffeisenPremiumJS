/**
 * Download Statement Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Download%20Statement/downloadStatement
 */
export interface DownloadStatementQuery {
	/**
	 * The Accept-Language request HTTP header is used to determine document language. Supported languages are cs and en.
	 */
	'Accept-Language': 'cs' | 'en';
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
		 * Statement id
		 *
		 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Download%20Statement/downloadStatement
		 */
		statementId: string;
		/**
		 * Statement format
		 *
		 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Download%20Statement/downloadStatement
		 */
		statementFormat: string;
	};
}

/**
 * Download Statement Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Download%20Statement/downloadStatement
 */
export type DownloadStatementResponse = string;
