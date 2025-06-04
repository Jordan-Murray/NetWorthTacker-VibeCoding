import { jest } from '@jest/globals';
import { DataStore } from '../js/modules/enhancedDataService.js';

class StorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = value; }
  removeItem(key) { delete this.store[key]; }
}

describe('DataStore', () => {
  let store;
  let dataStore;
  beforeEach(() => {
    global.document = { dispatchEvent: jest.fn() };
    global.CustomEvent = function(name, params) { return { name, ...params }; };
    store = new StorageMock();
    dataStore = new DataStore(store);
  });

  test('addYear creates a new year and triggers event', () => {
    const listener = jest.fn();
    dataStore.addEventListener('yearAdded', listener);
    const result = dataStore.addYear(2025);
    expect(result).toBe(true);
    expect(dataStore.data.years[2025]).toBeDefined();
    expect(listener).toHaveBeenCalledWith({ year: 2025 });
  });

  test('addYear does not add duplicate year', () => {
    dataStore.addYear(2025);
    const result = dataStore.addYear(2025);
    expect(result).toBe(false);
  });

  test('removeYear deletes year and triggers event', () => {
    dataStore.addYear(2024);
    const listener = jest.fn();
    dataStore.addEventListener('yearRemoved', listener);
    const result = dataStore.removeYear(2024);
    expect(result).toBe(true);
    expect(dataStore.data.years[2024]).toBeUndefined();
    expect(listener).toHaveBeenCalledWith({ year: 2024 });
  });
});
