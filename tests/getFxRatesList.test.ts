import { log } from 'console';
import RaiffeisenAPI, { isRaiffeisenErrorResponse } from '../src';

test('Test accounts fetching', async () => {
	const api = new RaiffeisenAPI(
		'-',
		'.cert.p12',
		'Test12345678',
		'api.rb.cz',
		true // sandbox mode
	);

	const fxRates = await api.getFxRatesList();

	log('fxRates', fxRates);

	if (isRaiffeisenErrorResponse(fxRates)) throw new Error(`Error fetching accounts: ${fxRates.error_description}`);
	else if (fxRates) {
		expect(fxRates).toHaveProperty('exchangeRateLists');
		expect(fxRates.exchangeRateLists).toBeInstanceOf(Array);
		expect(fxRates.exchangeRateLists.length).toBeGreaterThan(0);

		const firstList = fxRates.exchangeRateLists[0];
		expect(firstList).toHaveProperty('effectiveDateFrom');
		expect(firstList).toHaveProperty('effectiveDateTo');
		expect(firstList).toHaveProperty('tradingDate');
		expect(firstList).toHaveProperty('ordinalNumber');
		expect(firstList).toHaveProperty('lastRates');
		expect(firstList).toHaveProperty('exchangeRates');
	}
});
