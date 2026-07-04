import { exportToCsv, exportToJson, printCurrentView } from './export';

describe('lib/export', () => {
  let clickSpy: jest.Mock;
  let createObjectURLSpy: jest.Mock;
  let revokeObjectURLSpy: jest.Mock;
  let capturedHref = '';
  let capturedDownload = '';
  let blobParts: BlobPart[] = [];
  let blobType = '';
  const RealBlob = global.Blob;

  beforeEach(() => {
    clickSpy = jest.fn();
    capturedHref = '';
    capturedDownload = '';
    blobParts = [];
    blobType = '';

    // URL.createObjectURL / revokeObjectURL are not implemented in jsdom,
    // so assign the mocks directly rather than spying on a missing property.
    createObjectURLSpy = jest.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = jest.fn();
    (URL as unknown as { createObjectURL: unknown }).createObjectURL =
      createObjectURLSpy;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL =
      revokeObjectURLSpy;

    // Intercept the anchor element so we can observe href/download/click.
    const realCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickSpy, writable: true });
        const anchor = el as HTMLAnchorElement;
        Object.defineProperty(anchor, 'href', {
          get: () => capturedHref,
          set: (v: string) => {
            capturedHref = v;
          },
          configurable: true,
        });
        Object.defineProperty(anchor, 'download', {
          get: () => capturedDownload,
          set: (v: string) => {
            capturedDownload = v;
          },
          configurable: true,
        });
      }
      return el;
    });

    // Capture Blob contents so we can assert on the CSV/JSON payload.
    // @ts-expect-error override Blob for capture
    global.Blob = class MockBlob extends RealBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobParts = parts;
        blobType = options?.type ?? '';
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.Blob = RealBlob;
  });

  const content = () => blobParts.map((p) => String(p)).join('');

  describe('exportToCsv', () => {
    it('builds a CSV with header + rows and triggers a download', () => {
      exportToCsv('report', [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]);

      expect(content()).toBe('name,age\nAlice,30\nBob,25');
      expect(blobType).toContain('text/csv');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(capturedDownload).toBe('report.csv');
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    });

    it('does not double-append the .csv extension', () => {
      exportToCsv('already.csv', [{ a: 1 }]);
      expect(capturedDownload).toBe('already.csv');
    });

    it('quotes and escapes cells containing commas, quotes, or newlines', () => {
      exportToCsv('escaped', [
        { note: 'hello, world', quote: 'say "hi"', multi: 'a\nb' },
      ]);
      expect(content()).toBe(
        'note,quote,multi\n"hello, world","say ""hi""","a\nb"',
      );
    });

    it('uses explicit columns with labels when provided', () => {
      exportToCsv(
        'labeled',
        [{ firstName: 'Alice', ageYears: 30 }],
        [
          { key: 'firstName', label: 'First Name' },
          { key: 'ageYears', label: 'Age' },
        ],
      );
      expect(content()).toBe('First Name,Age\nAlice,30');
    });

    it('renders empty cells for null/undefined and serialises objects', () => {
      exportToCsv(
        'nulls',
        [{ a: null, b: undefined, c: { x: 1 } }],
        [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
      );
      expect(content()).toBe('a,b,c\n,,"{""x"":1}"');
    });
  });

  describe('exportToJson', () => {
    it('serialises data with indentation and triggers a JSON download', () => {
      exportToJson('payload', { hello: 'world', nested: { n: 1 } });

      expect(content()).toBe(
        JSON.stringify({ hello: 'world', nested: { n: 1 } }, null, 2),
      );
      expect(blobType).toContain('application/json');
      expect(capturedDownload).toBe('payload.json');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('does not double-append the .json extension', () => {
      exportToJson('data.json', []);
      expect(capturedDownload).toBe('data.json');
    });
  });

  describe('printCurrentView', () => {
    it('invokes window.print', () => {
      const printSpy = jest.spyOn(window, 'print').mockImplementation(() => undefined);
      printCurrentView();
      expect(printSpy).toHaveBeenCalledTimes(1);
    });
  });
});
