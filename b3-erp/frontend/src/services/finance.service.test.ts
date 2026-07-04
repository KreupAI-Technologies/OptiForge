import {
  FinanceService,
  AccountType,
  AccountStatus,
} from './finance.service';

const BASE = 'http://localhost:3001/api/v1';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('FinanceService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('getDashboardStats GETs /finance/dashboard-stats and returns the payload', async () => {
    const stats = { totalRevenue: 100, totalExpenses: 40, netIncome: 60 };
    const fetchMock = mockFetchOnce(stats);

    const result = await FinanceService.getDashboardStats();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/finance/dashboard-stats`);
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(result).toEqual(stats);
  });

  it('getChartOfAccounts encodes filters into the query string', async () => {
    const fetchMock = mockFetchOnce([]);

    await FinanceService.getChartOfAccounts({
      type: AccountType.ASSET,
      status: AccountStatus.ACTIVE,
      search: 'cash',
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`${BASE}/finance/chart-of-accounts?`);
    expect(url).toContain('type=ASSET');
    expect(url).toContain('status=ACTIVE');
    expect(url).toContain('search=cash');
  });

  it('createAccount POSTs the DTO as a JSON body', async () => {
    const created = { id: 'acc-99', code: '9000', name: 'New' };
    const fetchMock = mockFetchOnce(created);

    const dto = { code: '9000', name: 'New', type: AccountType.EXPENSE };
    const result = await FinanceService.createAccount(dto);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/finance/chart-of-accounts`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(dto);
    expect(result).toEqual(created);
  });

  it('deleteAccount issues a DELETE request', async () => {
    const fetchMock = mockFetchOnce(undefined);
    await FinanceService.deleteAccount('acc-1');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/finance/chart-of-accounts/acc-1`);
    expect(options.method).toBe('DELETE');
  });

  it('getTrialBalanceReport unwraps the { data } envelope', async () => {
    const rows = [{ account: 'Cash', debit: 100 }];
    mockFetchOnce({ reportType: 'trial-balance', data: rows });

    const result = await FinanceService.getTrialBalanceReport();
    expect(result).toEqual(rows);
  });

  it('getTrialBalanceReport returns [] when the envelope has no array data', async () => {
    mockFetchOnce({ reportType: 'trial-balance' });
    const result = await FinanceService.getTrialBalanceReport();
    expect(result).toEqual([]);
  });

  it('throws when the response is not ok', async () => {
    mockFetchOnce({}, false, 500);
    await expect(FinanceService.getDashboardStats()).rejects.toThrow('API Error');
  });
});
