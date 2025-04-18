import RaiffeisenAPI, { isRaiffeisenErrorResponse } from '../src';

test('Test accounts fetching', async () => {
	const api = new RaiffeisenAPI(
		'-',
		'.cert.p12',
		'Test12345678',
		'api.rb.cz',
		true // sandbox mode
	);

	const accounts = await api.getAccounts();

	if (isRaiffeisenErrorResponse(accounts)) throw new Error(`Error fetching accounts: ${accounts.error_description}`);
	else if (accounts) {
		expect(accounts).toHaveProperty('accounts');
		expect(accounts).toHaveProperty('page');
		expect(accounts).toHaveProperty('size');
		expect(accounts).toHaveProperty('first');
		expect(accounts).toHaveProperty('last');
		expect(accounts).toHaveProperty('totalPages');
		expect(accounts).toHaveProperty('totalSize');

		accounts.accounts.forEach((account) => {
			expect(account).toHaveProperty('accountId');
			expect(account).toHaveProperty('accountName');
			expect(account).toHaveProperty('friendlyName');
			expect(account).toHaveProperty('accountNumber');
			expect(account).toHaveProperty('accountNumberPrefix');
			expect(account).toHaveProperty('iban');
			expect(account).toHaveProperty('bankCode');
			expect(account).toHaveProperty('bankBicCode');
			expect(account).toHaveProperty('mainCurrency');
			expect(account).toHaveProperty('accountTypeId');
		});
	}
});
