import fs from 'fs';
import * as https from 'https';
import forge from 'node-forge';
import axios, { AxiosRequestConfig } from 'axios';
import { GetAccountsQuery, GetAccountsResponse } from './resources/getAccounts';
import { GetFxRatesListQuery, GetFxRatesListResponse } from './resources/getFxRatesList';
import { GetAccountBalanceQuery, GetAccountBalanceResponse } from './resources/getAccountBalance';
import { GetTransactionListQuery, GetTransactionListResponse } from './resources/getTransactionList';
import { UploadPaymentsQuery, UploadPaymentsResponse } from './resources/uploadPayments';
import { GetBatchDetailQuery, GetBatchDetailResponse } from './resources/getBatchDetail';
import { GetStatementListQuery, GetStatementListResponse } from './resources/getStatementList';
import { DownloadStatementQuery, DownloadStatementResponse } from './resources/downloadStatement';
import { GetFxRatesQuery, GetFxRatesResponse } from './resources/getFxRates';

interface RequestData {
	headers?: Record<string, string | number | boolean>;
	params?: Record<string, unknown>;
	body?: unknown;
}

/**
 * Raiffeisen Error Response
 *
 * @see https://developers.rb.cz/premium/documentation/02rbczpremiumapi_sandbox
 */
export interface RaiffeisenErrorResponse {
	statusCode: number;
	statusMessage: string;
	error?: string;
	error_description?: string;
}

/**
 * Check if the response is a Raiffeisen error response
 *
 * @param response The response to check
 * @returns True if the response is a Raiffeisen error response, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRaiffeisenErrorResponse(response: any): response is RaiffeisenErrorResponse {
	return response && typeof response.statusCode === 'number' && typeof response.statusMessage === 'string';
}

class RaiffeisenAPI {
	private httpsAgent: https.Agent;
	private headers: Record<string, string>;
	private hostname: string;
	private sandbox: boolean;

	/**
	 * RaiffeisenAPI constructor
	 *
	 * @param clientId ClientID obtained from Developer Portal - when you registered your app with us.
	 * @param cert Certificate .p12 path. https://developers.rb.cz/premium/documentation/01rbczpremiumapi
	 * @param pass Yes, your app needs the password as well to get use of the *p12 file for establishing mTLS connection to the bank.
	 * @param hostname Base URL of the Raiffeisen API. For example, 'api.rb.cz'.
	 * @param sandbox Boolean flag to indicate if the sandbox environment should be used. Default is false (production).
	 */
	constructor(clientId: string, cert: string, pass: string, hostname: string, sandbox: boolean = false) {
		const { pemCert, pemKey } = this.loadCertificate(cert, pass);

		this.httpsAgent = new https.Agent({
			cert: pemCert,
			key: pemKey,
			rejectUnauthorized: true
		});

		this.headers = {
			'Content-Type': 'application/json',
			'X-IBM-Client-Id': clientId
		};

		this.hostname = hostname;
		this.sandbox = sandbox;
	}

	private getHeaders(): Record<string, string> {
		return {
			...this.headers,
			'X-Request-Id': Date.now().toString() // Unique request id provided by consumer application for reference and auditing.
		};
	}

	private loadCertificate(certificatePath: string, password: string): { pemCert: string; pemKey: string; certificate: forge.pki.Certificate } {
		try {
			// Load the PKCS#12 certificate
			const p12Buffer = fs.readFileSync(certificatePath);
			const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Buffer.toString('binary')));
			const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

			// Extract private key and certificate
			let privateKey: forge.pki.PrivateKey | undefined;
			let certificate: forge.pki.Certificate | undefined;

			// Find the private key and certificate
			const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
			if (bags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
				privateKey = bags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key ?? undefined;
			}

			const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
			if (certBags[forge.pki.oids.certBag]) {
				certificate = certBags[forge.pki.oids.certBag]?.[0].cert ?? undefined;
			}

			if (!privateKey || !certificate) {
				throw new Error('Failed to extract private key or certificate');
			}

			// Convert forge certificate and key to PEM format
			const pemCert = forge.pki.certificateToPem(certificate);
			const pemKey = forge.pki.privateKeyToPem(privateKey);

			return { pemCert, pemKey, certificate };
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes('password')) {
					throw new Error(`Invalid certificate password. Please check the password and try again.`);
				} else if (error.message.includes('asn1')) {
					throw new Error(`Invalid certificate format. Please ensure you're using a valid PKCS#12 (.p12) file.`);
				}
			}
			throw new Error(`Certificate loading error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Make a request to the Raiffeisen Premium API that requires mTLS
	 *
	 * @param endpoint The API endpoint (without base URL)
	 * @param method HTTP method
	 * @param data Optional request body
	 * @returns API response data
	 */
	public async request<T = unknown>(endpoint: string, method: string = 'GET', data?: RequestData): Promise<T | RaiffeisenErrorResponse> {
		try {
			const config: AxiosRequestConfig = {
				method,
				url: `https://${this.hostname}/${endpoint.replace(/^\//, '')}`,
				httpsAgent: this.httpsAgent,
				headers: this.getHeaders()
			};

			if (data) {
				if (data.headers) config.headers = { ...config.headers, ...data.headers };
				if (data.params) config.params = data.params;
				if (data.body) config.data = data.body;
			}

			const response = await axios(config);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const errorResponse: RaiffeisenErrorResponse = {
					statusCode: error.response?.status || 500,
					statusMessage: error.response?.statusText || 'Unknown error',
					error: error.response?.data?.error,
					error_description: error.response?.data?.error_description
				};

				return errorResponse;
			}

			throw error;
		}
	}

	/**
	 * Make a request to the Premium API that doesn't require mTLS (FX rates endpoints)
	 * @param endpoint The API endpoint (without base URL)
	 * @param method HTTP method
	 * @param data Optional request body
	 * @returns API response data
	 */
	public async requestWithoutCert<T = unknown>(endpoint: string, method: string = 'GET', data?: RequestData): Promise<T | RaiffeisenErrorResponse> {
		try {
			const config: AxiosRequestConfig = {
				method,
				url: `https://${this.hostname}/${endpoint.replace(/^\//, '')}`,
				headers: this.getHeaders()
			};

			if (data) {
				if (data.headers) config.headers = { ...config.headers, ...data.headers };
				if (data.params) config.params = data.params;
				if (data.body) config.data = data.body;
			}

			const response = await axios(config);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const errorResponse: RaiffeisenErrorResponse = {
					statusCode: error.response?.status || 500,
					statusMessage: error.response?.statusText || 'Unknown error',
					error: error.response?.data?.error,
					error_description: error.response?.data?.error_description
				};

				return errorResponse;
			}

			throw error;
		}
	}

	/**
	 * Get balance for given accounts.
	 *
	 * @param query GetAccountBalanceQuery - query parameters
	 * @returns Promise with GetAccountBalanceResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getAccountBalance(query: GetAccountBalanceQuery): Promise<GetAccountBalanceResponse | RaiffeisenErrorResponse> {
		let endpoint = this.sandbox ? 'rbcz/premium/mock/accounts/{accountNumber}/balance' : 'rbcz/premium/api/accounts/{accountNumber}/balance';
		const method = 'GET';

		endpoint = endpoint.replace('{accountNumber}', query.accountNumber);

		return this.request<GetAccountBalanceResponse>(endpoint, method);
	}

	/**
	 * Get a list of posted transactions (including intraday). In addition, transactions must not be older than 90 days - see request parameter from.
	 *
	 * The list is returned as a sequence of pages - see request parameter page. The request parameter/flag lastPage indicates whether the returned page is the last one or if there are more pages that you can iterate.
	 *
	 * When iterating pages of transactions, your app may need to implement some delay in order not to break the request rate limit.
	 *
	 * @param query GetTransactionListQuery - query parameters
	 * @returns Promise with GetTransactionListResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getTransactionList(query: GetTransactionListQuery): Promise<GetTransactionListResponse | RaiffeisenErrorResponse> {
		let endpoint = this.sandbox
			? 'rbcz/premium/mock/accounts/{accountNumber}/{currencyCode}/transactions'
			: 'rbcz/premium/api/accounts/{accountNumber}/{currencyCode}/transactions';
		const method = 'GET';

		endpoint = endpoint.replace('{accountNumber}', query.accountNumber).replace('{currencyCode}', query.currencyCode);

		const params = {} as Record<string, unknown>;
		if (query.from) params.from = query.from;
		if (query.to) params.to = query.to;
		if (query.page) params.page = query.page;

		return this.request<GetTransactionListResponse>(endpoint, method, {
			params: params
		});
	}

	/**
	 * Importing batch payments in one of supported formates - see request parameter Batch-Import-Format.
	 *
	 * This is an API alternative to the manual import of batch payments through Internet Banking.
	 *
	 * Imported payments are not immediately processed, they are just loaded into Internet Banking and they still must be authorized/certified in Internet Banking according to client settings of disposable rights and signatures.
	 *
	 * Once authorized/certified, uploaded payments will be processed in the Instant payments mode if the following conditions are met:
	 *
	 * 1. the batch has no more than 100 payments
	 * 2. no more than 10 batches per day were uploaded
	 * 3. individual payments meet the conditions for Instant payments - see Instant Payments
	 * 4. on the weekend, only payments within our bank are processed as Instant payments
	 *
	 * The number of transactions in one request is limited to 15.000 (this can change without prior notice). The limit is not checked during the call, it is performed later and a possible error is provided in Internet Banking.
	 *
	 * @param query UploadPaymentsQuery - query parameters
	 * @returns Promise with UploadPaymentsResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async uploadPayments(query: UploadPaymentsQuery): Promise<UploadPaymentsResponse | RaiffeisenErrorResponse> {
		const endpoint = this.sandbox ? 'rbcz/premium/mock/payments/batches' : 'rbcz/premium/api/payments/batches';
		const method = 'POST';

		const headers: Record<string, string | number | boolean> = {
			'Batch-Import-Format': query['Batch-Import-Format']
		};

		if (query['Batch-Name']) headers['Batch-Name'] = query['Batch-Name'];
		if (query['Batch-Combined-Payments']) headers['Batch-Combined-Payments'] = query['Batch-Combined-Payments'];
		if (query['Batch-Autocorrect']) headers['Batch-Autocorrect'] = query['Batch-Autocorrect'];

		return await this.request<UploadPaymentsResponse>(endpoint, method, {
			headers: headers,
			body: query?.body || ''
		});
	}

	/**
	 * Getting details about state of processing of imported batch file and created batch transactions.
	 *
	 * All possible batch status values are: DRAFT, ERROR, FOR_SIGN, VERIFIED, PASSING_TO_BANK, PASSED, PASSED_TO_BANK_WITH_ERROR, UNDISCLOSED
	 *
	 * @param query GetBatchDetailQuery - query parameters
	 * @returns Promise with GetBatchDetailResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getBatchDetail(query: GetBatchDetailQuery): Promise<GetBatchDetailResponse | RaiffeisenErrorResponse> {
		let endpoint = this.sandbox ? 'rbcz/premium/mock/payments/batches/{batchFileId}' : 'rbcz/premium/api/payments/batches/{batchFileId}';
		const method = 'GET';

		endpoint = endpoint.replace('{batchFileId}', query.batchFileId.toString());

		return this.request<GetBatchDetailResponse>(endpoint, method);
	}

	/**
	 * Get list of accounts for given certificate. First page is 1.
	 *
	 * @param query GetAccountsQuery - query parameters
	 * @returns Promise with GetAccountsResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getAccounts(query?: GetAccountsQuery): Promise<GetAccountsResponse | RaiffeisenErrorResponse> {
		const endpoint = this.sandbox ? 'rbcz/premium/mock/accounts' : 'rbcz/premium/api/accounts';
		const method = 'GET';

		const params = {} as Record<string, unknown>;
		if (query?.page) params.page = query.page;
		if (query?.size) params.size = query.size;

		return await this.request<GetAccountsResponse>(endpoint, method, {
			params: params
		});
	}

	/**
	 * Lists statements for all available accounts for which the client has appropriate access rights.
	 *
	 * @param query GetStatementListQuery - query parameters
	 * @returns Promise with GetStatementListResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getStatementList(query: GetStatementListQuery): Promise<GetStatementListResponse | RaiffeisenErrorResponse> {
		const endpoint = this.sandbox ? 'rbcz/premium/mock/accounts/statements' : 'rbcz/premium/api/accounts/statements';
		const method = 'POST';

		const params = {} as Record<string, unknown>;
		if (query.page) params.page = query.page;
		if (query.size) params.size = query.size;

		return await this.request<GetStatementListResponse>(endpoint, method, {
			params: params,
			body: query?.body || ''
		});
	}

	/**
	 * Download the selected statement.
	 *
	 * Returns one of the following Content-type header values depending on the downloaded document type: application/pdf, application/xml, text/mt940, application/json (in case of an error).
	 *
	 * @param query DownloadStatementQuery - query parameters
	 * @returns Promise with DownloadStatementResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async downloadStatement(query: DownloadStatementQuery): Promise<DownloadStatementResponse | RaiffeisenErrorResponse> {
		const endpoint = this.sandbox ? 'rbcz/premium/mock/accounts/statements/download' : 'rbcz/premium/api/accounts/statements/download';
		const method = 'POST';

		return await this.request<DownloadStatementResponse>(endpoint, method, {
			body: query?.body || ''
		});
	}

	/**
	 * Returns foreign exchange rates for all available currencies.
	 *
	 * @param query GetFxRatesListQuery - query parameters
	 * @returns Promise with GetFxRatesListResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getFxRatesList(query?: GetFxRatesListQuery): Promise<GetFxRatesListResponse | RaiffeisenErrorResponse> {
		const endpoint = this.sandbox ? 'rbcz/premium/mock/fxrates' : 'rbcz/premium/api/fxrates';
		const method = 'GET';

		const params = {} as Record<string, unknown>;
		if (query?.date) params.date = query.date;

		return await this.request<GetFxRatesListResponse>(endpoint, method, {
			params: params
		});
	}

	/**
	 * Returns foreign exchange rates for the given currency code.
	 *
	 * @param query GetFxRatesQuery - query parameters
	 * @returns Promise with GetFxRatesResponse or RaiffeisenErrorResponse
	 * @throws Non-request errors
	 */
	public async getFxRates(query: GetFxRatesQuery): Promise<GetFxRatesResponse | RaiffeisenErrorResponse> {
		let endpoint = this.sandbox ? 'rbcz/premium/mock/fxrates/{currencyCode}' : 'rbcz/premium/api/fxrates/{currencyCode}';
		const method = 'GET';

		endpoint = endpoint.replace('{currencyCode}', query.currencyCode || '');

		const params = {} as Record<string, unknown>;
		if (query.date) params.date = query.date;

		return await this.request<GetFxRatesResponse>(endpoint, method, {
			params: params
		});
	}
}

export default RaiffeisenAPI;
export * from './resources/getAccountBalance';
export * from './resources/getTransactionList';
export * from './resources/uploadPayments';
export * from './resources/getBatchDetail';
export * from './resources/getAccounts';
export * from './resources/getStatementList';
export * from './resources/downloadStatement';
export * from './resources/getFxRatesList';
export * from './resources/getFxRates';
