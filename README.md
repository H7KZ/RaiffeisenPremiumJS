# RaiffeisenPremiumJS Documentation

A Node.js wrapper for the Raiffeisen Bank Premium API

## Installation

```bash
npm install @h7kz/raiffeisen-premium-js
```

or

```bash
yarn add @h7kz/raiffeisen-premium-js
```

## Prerequisites

To use this library, you need:

1. A certificate (.p12) obtained from Raiffeisen Bank
2. Client ID obtained from the Raiffeisen Developer Portal
3. The password for your certificate

## Quick Start

```typescript
import RaiffeisenAPI from '@h7kz/raiffeisen-premium-js';

// Initialize the API client
const api = new RaiffeisenAPI(
	'your-client-id',
	'/path/to/your/certificate.p12',
	'certificate-password',
	'api.rb.cz', // hostname
	false // set to true for sandbox environment
);

// Example: Get accounts
async function getAccounts() {
	const response = await api.getAccounts();

	if (api.isRaiffeisenErrorResponse(response)) {
		console.error('Error:', response);
		return;
	}

	console.log('Accounts:', response.accounts);
}

getAccounts();
```

## API Reference

### RaiffeisenAPI Class

The main class for interacting with the Raiffeisen Bank API.

#### Constructor

```typescript
constructor(
  clientId: string,
  cert: string,
  pass: string,
  hostname: string,
  sandbox: boolean = false
)
```

- `clientId`: ClientID obtained from Developer Portal when you registered your app
- `cert`: Path to the Certificate .p12 file
- `pass`: Password for the certificate
- `hostname`: Base URL of the Raiffeisen API (e.g., 'api.rb.cz')
- `sandbox`: Boolean flag to indicate if the sandbox environment should be used (default: false)

#### Methods

##### Account Methods

###### `getAccounts(query?: GetAccountsQuery): Promise<GetAccountsResponse | RaiffeisenErrorResponse>`

Get a list of accounts for the given certificate.

Parameters:

- `query` (optional):
    - `page`: Number of the requested page (default: 1)
    - `size`: Number of items on the page (default: 15)

Example:

```typescript
const accounts = await api.getAccounts({ page: 1, size: 10 });
```

###### `getAccountBalance(query: GetAccountBalanceQuery): Promise<GetAccountBalanceResponse | RaiffeisenErrorResponse>`

Get balance for a specific account.

Parameters:

- `query`:
    - `accountNumber`: The number of account without prefix and bankCode

Example:

```typescript
const balance = await api.getAccountBalance({ accountNumber: '123456789' });
```

##### Transaction Methods

###### `getTransactionList(query: GetTransactionListQuery): Promise<GetTransactionListResponse | RaiffeisenErrorResponse>`

Get a list of posted transactions (including intraday).

Parameters:

- `query`:
    - `accountNumber`: The number of account without prefix and bankCode
    - `currencyCode`: Currency code in ISO-4217 format (e.g., CZK, EUR, USD)
    - `from`: Start date for transactions
    - `to`: End date for transactions
    - `page` (optional): Page number to be requested (first page is 1)

Example:

```typescript
const transactions = await api.getTransactionList({
	accountNumber: '123456789',
	currencyCode: 'CZK',
	from: new Date('2023-01-01'),
	to: new Date('2023-01-31'),
	page: 1
});
```

##### Payment Methods

###### `uploadPayments(query: UploadPaymentsQuery): Promise<UploadPaymentsResponse | RaiffeisenErrorResponse>`

Import batch payments in one of the supported formats.

Parameters:

- `query`:
    - `Batch-Import-Format`: Format of imported batch (e.g., 'GEMINI-P11', 'SEPA-XML')
    - `Batch-Name` (optional): Batch name
    - `Batch-Combined-Payments` (optional): Flag for combined payments (default: false)
    - `Batch-Autocorrect` (optional): Flag if valueDate should be autocorrected (default: true)
    - `body`: The batch payment data as a string

Example:

```typescript
const uploadResult = await api.uploadPayments({
	'Batch-Import-Format': 'SEPA-XML',
	'Batch-Name': 'MyPayments-20230101',
	'Batch-Combined-Payments': false,
	'Batch-Autocorrect': true,
	body: '<?xml version="1.0" encoding="UTF-8"?>...' // SEPA XML content
});
```

###### `getBatchDetail(query: GetBatchDetailQuery): Promise<GetBatchDetailResponse | RaiffeisenErrorResponse>`

Get details about the state of processing of an imported batch file.

Parameters:

- `query`:
    - `batchFileId`: Batch file ID

Example:

```typescript
const batchDetail = await api.getBatchDetail({ batchFileId: 123456 });
```

##### Statement Methods

###### `getStatementList(query: GetStatementListQuery): Promise<GetStatementListResponse | RaiffeisenErrorResponse>`

List statements for all available accounts.

Parameters:

- `query`:
    - `page` (optional): Number of the requested page (default: 1)
    - `size` (optional): Number of items on the page (default: 15)
    - `body`:
        - `accountNumber`: Account number without prefix and bankCode
        - `currency`: Currency code in ISO-4217 format
        - `statementLine`: Statement line
        - `dateFrom`: Start date for statements
        - `dateTo`: End date for statements

Example:

```typescript
const statements = await api.getStatementList({
	page: 1,
	size: 10,
	body: {
		accountNumber: '123456789',
		currency: 'CZK',
		statementLine: '1',
		dateFrom: new Date('2023-01-01'),
		dateTo: new Date('2023-01-31')
	}
});
```

###### `downloadStatement(query: DownloadStatementQuery): Promise<DownloadStatementResponse | RaiffeisenErrorResponse>`

Download a selected statement.

Parameters:

- `query`:
    - `Accept-Language`: Document language ('cs' or 'en')
    - `body`:
        - `accountNumber`: Account number without prefix and bankCode
        - `currency`: Currency code in ISO-4217 format
        - `statementId`: Statement ID
        - `statementFormat`: Statement format

Example:

```typescript
const statement = await api.downloadStatement({
	'Accept-Language': 'en',
	body: {
		accountNumber: '123456789',
		currency: 'CZK',
		statementId: 'stmt-123',
		statementFormat: 'PDF'
	}
});
```

##### Foreign Exchange Methods

###### `getFxRatesList(query?: GetFxRatesListQuery): Promise<GetFxRatesListResponse | RaiffeisenErrorResponse>`

Get foreign exchange rates for all available currencies.

Parameters:

- `query` (optional):
    - `date` (optional): The effective date for which FX rates are requested (default: current date)

Example:

```typescript
const fxRatesList = await api.getFxRatesList({ date: new Date('2023-01-15') });
```

###### `getFxRates(query: GetFxRatesQuery): Promise<GetFxRatesResponse | RaiffeisenErrorResponse>`

Get foreign exchange rates for a specific currency.

Parameters:

- `query`:
    - `currencyCode`: Currency code in ISO-4217 format
    - `date` (optional): The effective date for which FX rates are requested (default: current date)

Example:

```typescript
const fxRates = await api.getFxRates({
	currencyCode: 'EUR',
	date: new Date('2023-01-15')
});
```

### Helper Functions

#### `isRaiffeisenErrorResponse(response: any): response is RaiffeisenErrorResponse`

Check if the response is a Raiffeisen error response.

Example:

```typescript
const response = await api.getAccounts();
if (isRaiffeisenErrorResponse(response)) {
	console.error('Error:', response.statusMessage);
}
```

## Error Handling

All API methods return either the expected response type or a `RaiffeisenErrorResponse`. You should always check for errors before using the response:

```typescript
const response = await api.getAccounts();

if (isRaiffeisenErrorResponse(response)) {
	console.error('Error:', response.statusCode, response.statusMessage);
	if (response.error) {
		console.error('Error details:', response.error, response.error_description);
	}
	return;
}

// Now it's safe to use the response
console.log('Accounts:', response.accounts);
```

## Response Types

This library includes TypeScript interfaces for all request and response data structures, making it easy to work with the API in a type-safe manner.

### Error Response

```typescript
interface RaiffeisenErrorResponse {
	statusCode: number;
	statusMessage: string;
	error?: string;
	error_description?: string;
}
```

## SSL Certificate

The API requires mutual TLS (mTLS) authentication. Be sure to keep your certificate and password secure.

## Rate Limits

When iterating through pages of transactions, your app may need to implement some delay in order not to break the request rate limit. [See Raiffeisen API documentation for details.](https://developers.rb.cz/premium)
