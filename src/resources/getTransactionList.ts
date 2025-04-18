/**
 * Get Transaction List Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Transaction%20List/getTransactionList
 */
export interface GetTransactionListQuery {
	/**
	 * The number of account without prefix and bankCode
	 */
	accountNumber: string;
	/**
	 * Currency code of the account in ISO-4217 standard (e.g. czk, eur, usd)
	 */
	currencyCode: string;
	/**
	 * Defines date (and optionally time) from which transactions will be requested. If no time is specified then 00:00:00.0 (Central European Time) will be used. Example values - 2021-08-01 or 2021-08-01T10:00:00.0Z
	 */
	from: Date;
	/**
	 * Defines date (and optionally time) until which transactions will be requested. If no time is specified then 23:59:59.999 (Central European Time) will be used. Example values - 2021-08-02 or 2021-08-02T14:00:00.0Z
	 */
	to: Date;
	/**
	 * Page number to be requested. The first page is 1.
	 */
	page?: number;
}

export interface Transaction {
	entryReference: number;
	amount: {
		value: number;
		currency: string;
	};
	creditDebitIndication: string;
	bookingDate: Date;
	valueDate: Date;
	bankTransactionCode: {
		code: string;
	};
	entryDetails: {
		transactionDetails: {
			references: {
				endToEndIdentification: string;
			};
			instructedAmount: {
				value: number;
				currency: string;
				exchangeRate: number;
			};
			chargeBearer: string;
			paymentCardNumber: string;
			relatedParties: {
				counterParty: {
					name: string;
					postalAddress: {
						street: string;
						city: string;
						country: string;
					};
					organisationIdentification: {
						name: string;
						bicOrBei: string;
						bankCode: string;
						postalAddress: {
							street: string;
							city: string;
							shortAddress: string;
							country: string;
						};
					};
					account: {
						iban: string;
						accountNumberPrefix: string;
						accountNumber: string;
					};
				};
				intermediaryInstitution: {
					name: string;
					bicOrBei: string;
					bankCode: string;
					postalAddress: {
						street: string;
						city: string;
						shortAddress: string;
						country: string;
					};
				};
				ultimateCounterParty: {
					name: string;
					postalAddress: {
						street: string;
						city: string;
						country: string;
					};
				};
			};
			remittanceInformation: {
				unstructured: string;
				creditorReferenceInformation: {
					variable: string;
					constant: string;
					specific: string;
				};
				originatorMessage: string;
			};
		};
	};
}

/**
 * Get Transaction List Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Transaction%20List/getTransactionList
 */
export interface GetTransactionListResponse {
	lastPage: boolean;
	transactions: Transaction[];
}
