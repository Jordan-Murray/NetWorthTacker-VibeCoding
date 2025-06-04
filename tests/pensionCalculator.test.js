import { jest } from '@jest/globals';

class StorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value; }
  removeItem(key) { delete this.store[key]; }
}

describe('Pension calculator UI', () => {
  let calcHandler;
  let progressBar;
  let rateElem;
  let personalInput;
  let employerInput;
  let goalInput;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-08-01'));
    jest.resetModules();

    progressBar = { style: { width: '0%' } };
    rateElem = { textContent: '' };
    personalInput = { value: '5' };
    employerInput = { value: '3' };
    goalInput = { value: '3' };
    const calcBtn = { addEventListener: (evt, cb) => { calcHandler = cb; } };

    global.document = {
      dispatchEvent: jest.fn(),
      getElementById: jest.fn(id => {
        switch(id) {
          case 'calculate-savings': return calcBtn;
          case 'personal-contribution': return personalInput;
          case 'employer-contribution': return employerInput;
          case 'emergency-fund-goal': return goalInput;
          case 'emergency-fund-progress': return progressBar;
          case 'savings-rate': return rateElem;
          default: return null;
        }
      })
    };
    global.CustomEvent = function(name, params) { return { name, ...params }; };

    const { getDataStore } = await import('../js/modules/enhancedDataService.js');
    const store = new StorageMock();
    const ds = getDataStore(store);

    ds.addSalaryEntry(new Date('2024-06-01'), 'Acme', 'Engineer', 60000);
    ds.addSavingEntry(2024, new Date('2024-07-01'), 7500, 'Emergency Fund');

    jest.unstable_mockModule('../js/modules/enhancedDataService.js', () => ({
      getDataStore: () => ds,
    }));

    const { setupPensionCalculator } = await import('../js/modules/savingsTrackerUI.js');
    setupPensionCalculator();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.document;
    jest.resetModules();
  });

  test('updates emergency fund progress on calculate', () => {
    calcHandler();
    expect(progressBar.style.width).toBe('50%');
    expect(rateElem.textContent).toBe('158.0%');
  });
});

