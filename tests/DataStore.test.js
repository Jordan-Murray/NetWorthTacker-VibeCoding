import { DataService } from '../js/modules/dataService.js';

describe('DataService', () => {
    let dataStore;
    let mockStorage;

    beforeEach(() => {
        // Create a mock storage object
        mockStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };

        // Create a new DataService instance with mock storage
        dataStore = new DataService(mockStorage);
    });

    test('should initialize with current year', () => {
        const currentYear = new Date().getFullYear();
        expect(dataStore.data.years[currentYear]).toBeDefined();
        expect(dataStore.data.years[currentYear].assets).toEqual([]);
        expect(dataStore.data.years[currentYear].liabilities).toEqual([]);
    });

    test('should load data from storage on initialization', () => {
        const mockData = {
            years: {
                '2024': {
                    assets: [{ id: '1', category: 'Cash', value: 1000 }],
                    liabilities: []
                }
            }
        };
        mockStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        dataStore = new DataService(mockStorage);
        expect(dataStore.data).toEqual(mockData);
    });

    test('should save data to storage', () => {
        dataStore.addYear(2024);
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            'netWorthData',
            JSON.stringify(dataStore.data)
        );
    });

    test('should add a new year', () => {
        const result = dataStore.addYear(2024);
        expect(result).toBe(true);
        expect(dataStore.data.years['2024']).toBeDefined();
        expect(dataStore.data.years['2024'].assets).toEqual([]);
        expect(dataStore.data.years['2024'].liabilities).toEqual([]);
    });

    test('should not add duplicate year', () => {
        dataStore.addYear(2024);
        const result = dataStore.addYear(2024);
        expect(result).toBe(false);
    });

    test('should add an asset', () => {
        dataStore.addYear(2024);
        dataStore.addAsset(2024, 'Cash', 1000);
        
        const assets = dataStore.getAssets(2024);
        expect(assets).toHaveLength(1);
        expect(assets[0].category).toBe('Cash');
        expect(assets[0].value).toBe(1000);
        expect(assets[0].id).toBeDefined();
        expect(assets[0].dateAdded).toBeDefined();
    });

    test('should add a liability', () => {
        dataStore.addYear(2024);
        dataStore.addLiability(2024, 'Mortgage', 200000);
        
        const liabilities = dataStore.getLiabilities(2024);
        expect(liabilities).toHaveLength(1);
        expect(liabilities[0].category).toBe('Mortgage');
        expect(liabilities[0].value).toBe(200000);
        expect(liabilities[0].id).toBeDefined();
        expect(liabilities[0].dateAdded).toBeDefined();
    });

    test('should calculate net worth correctly', () => {
        dataStore.addYear(2024);
        dataStore.addAsset(2024, 'Cash', 1000);
        dataStore.addAsset(2024, 'Investments', 5000);
        dataStore.addLiability(2024, 'Mortgage', 200000);
        dataStore.addLiability(2024, 'Car Loan', 15000);

        const netWorth = dataStore.getNetWorth(2024);
        expect(netWorth).toBe(-209000); // 6000 - 215000
    });

    test('should remove an asset', () => {
        dataStore.addYear(2024);
        dataStore.addAsset(2024, 'Cash', 1000);
        const assets = dataStore.getAssets(2024);
        const assetId = assets[0].id;

        const result = dataStore.removeAsset(2024, assetId);
        expect(result).toBe(true);
        expect(dataStore.getAssets(2024)).toHaveLength(0);
    });

    test('should remove a liability', () => {
        dataStore.addYear(2024);
        dataStore.addLiability(2024, 'Mortgage', 200000);
        const liabilities = dataStore.getLiabilities(2024);
        const liabilityId = liabilities[0].id;

        const result = dataStore.removeLiability(2024, liabilityId);
        expect(result).toBe(true);
        expect(dataStore.getLiabilities(2024)).toHaveLength(0);
    });

    test('should handle event listeners', () => {
        const mockCallback = jest.fn();
        dataStore.on('dataChanged', mockCallback);
        
        dataStore.addYear(2024);
        expect(mockCallback).toHaveBeenCalled();
    });
}); 