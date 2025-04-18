/**
 * Get Batch Detail Query
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Batch%20Detail/getBatchDetail
 */
export interface GetBatchDetailQuery {
	/**
	 * Batch file id
	 */
	batchFileId: number;
}

export interface BatchItem {
	accountInfo: {
		accountId: number;
		accountNumberPrefix: string;
		accountNumber: number;
		mainCurrencyId: string;
	};
	numberOfPayments: number;
	sumAmount: number;
	sumAmountCurrencyId: string;
	batchType: string;
	status: 'DRAFT' | 'ERROR' | 'FOR_SIGN' | 'VERIFIED' | 'PASSING_TO_BANK' | 'PASSED' | 'PASSED_TO_BANK_WITH_ERROR' | 'UNDISCLOSED';
	assignedUserName: string;
	lastChangeDateTime: string;
}

/**
 * Get Batch Detail Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox#/Get%20Batch%20Detail/getBatchDetail
 */
export interface GetBatchDetailResponse {
	batchName: string;
	batchFileStatus: string;
	createDate: string;
	batchItems: BatchItem[];
}
