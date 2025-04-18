/**
 * Upload Payments Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Upload%20Payments/importPayments
 */
export interface UploadPaymentsQuery {
	/**
	 * Format of imported batch. For CCT format please use option SEPA-XML.
	 *
	 * Available values : GEMINI-P11, GEMINI-P32, GEMINI-F84, ABO-KPC, SEPA-XML, CFD, CFU, CFA
	 */
	'Batch-Import-Format': 'GEMINI-P11' | 'GEMINI-P32' | 'GEMINI-F84' | 'ABO-KPC' | 'SEPA-XML' | 'CFD' | 'CFU' | 'CFA';
	/**
	 * Batch name, if not present then will be generated in format ImportApi_<DDMMYYYY>. If the name is longer than 50 characters, it will be truncated
	 */
	'Batch-Name'?: string;
	/**
	 * Optional header for combined payments. Payments inside the import file are considered as combined in case the header is present and its value is set to 'true'.
	 *
	 * Default value: false
	 */
	'Batch-Combined-Payments'?: boolean;
	/**
	 * Flag if valueDate should be autocorrected in the imported file or not. Autocorrection moved valueDate on first available valid (working) day. Beware that this may affect if the payment will be sent as instant or not since only payments with valueDate same as actual date (during sending of payment to bank) can be sent as instant.
	 *
	 * Default value: true
	 */
	'Batch-Autocorrect'?: boolean;
	/**
	 * Parameter content type: text/plain
	 */
	body: string;
}

/**
 * Upload Payments Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Upload%20Payments/importPayments
 */
export interface UploadPaymentsResponse {
	batchFileId: number;
}
