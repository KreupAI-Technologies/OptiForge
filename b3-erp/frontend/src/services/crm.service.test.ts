import { crmService } from './crm.service';

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

describe('crmService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('contacts.getAll appends non-empty filters to the query string', async () => {
    const contacts = [{ id: 'c1', firstName: 'Ada' }];
    const fetchMock = mockFetchOnce(contacts);

    const result = await crmService.contacts.getAll({
      search: 'ada',
      status: '',
      department: 'sales',
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`${BASE}/crm/contacts?`);
    expect(url).toContain('search=ada');
    expect(url).toContain('department=sales');
    // Empty-string filters are dropped by buildQueryParams.
    expect(url).not.toContain('status=');
    expect(result).toEqual(contacts);
  });

  it('contacts.getById targets the resource URL', async () => {
    const fetchMock = mockFetchOnce({ id: 'c1' });
    await crmService.contacts.getById('c1');
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/crm/contacts/c1`);
  });

  it('contacts.create POSTs a JSON body', async () => {
    const fetchMock = mockFetchOnce({ id: 'c2', firstName: 'Grace' });
    await crmService.contacts.create({ firstName: 'Grace', lastName: 'Hopper' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/crm/contacts`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      firstName: 'Grace',
      lastName: 'Hopper',
    });
  });

  it('opportunities.getForecast hits the forecast endpoint', async () => {
    const fetchMock = mockFetchOnce({ pipeline: 42 });
    const result = await crmService.opportunities.getForecast();
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/crm/opportunities/forecast`);
    expect(result).toEqual({ pipeline: 42 });
  });

  it('activities.complete POSTs to the /complete sub-resource', async () => {
    const fetchMock = mockFetchOnce({ id: 'a1', status: 'completed' });
    await crmService.activities.complete('a1');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/crm/activities/a1/complete`);
    expect(options.method).toBe('POST');
  });

  it('contacts.delete returns undefined on 204 No Content', async () => {
    mockFetchOnce(null, true, 204);
    const result = await crmService.contacts.delete('c1');
    expect(result).toBeUndefined();
  });

  it('propagates API errors', async () => {
    mockFetchOnce({}, false, 404);
    await expect(crmService.contacts.getById('missing')).rejects.toThrow(
      'API Error',
    );
  });
});
