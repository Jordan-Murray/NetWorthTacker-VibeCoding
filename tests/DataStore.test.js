import { DataService } from '../js/modules/dataService.js';

describe('DataService', () => {
    let dataService;
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
        dataService = new DataService(mockStorage);
    });

    test('should initialize with current year', () => {
        const currentYear = new Date().getFullYear();
        expect(dataService.data.years[currentYear]).toBeDefined();
        expect(dataService.data.years[currentYear].assets).toEqual([]);
        expect(dataService.data.years[currentYear].liabilities).toEqual([]);
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

        dataService = new DataService(mockStorage);
        expect(dataService.data).toEqual(mockData);
    });

    test('should save data to storage', () => {
        dataService.addYear(2024);
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            'netWorthData',
            JSON.stringify(dataService.data)
        );
    });

    test('should add a new year', () => {
        const result = dataService.addYear(2024);
        expect(result).toBe(true);
        expect(dataService.data.years['2024']).toBeDefined();
        expect(dataService.data.years['2024'].assets).toEqual([]);
        expect(dataService.data.years['2024'].liabilities).toEqual([]);
    });

    test('should not add duplicate year', () => {
        dataService.addYear(2024);
        const result = dataService.addYear(2024);
        expect(result).toBe(false);
    });

    test('should add an asset', () => {
        dataService.addYear(2024);
        dataService.addAsset(2024, 'Cash', 1000);
        
        const assets = dataService.getAssets(2024);
        expect(assets).toHaveLength(1);
        expect(assets[0].category).toBe('Cash');
        expect(assets[0].value).toBe(1000);
        expect(assets[0].id).toBeDefined();
        expect(assets[0].dateAdded).toBeDefined();
    });

    test('should add a liability', () => {
        dataService.addYear(2024);
        dataService.addLiability(2024, 'Mortgage', 200000);
        
        const liabilities = dataService.getLiabilities(2024);
        expect(liabilities).toHaveLength(1);
        expect(liabilities[0].category).toBe('Mortgage');
        expect(liabilities[0].value).toBe(200000);
        expect(liabilities[0].id).toBeDefined();
        expect(liabilities[0].dateAdded).toBeDefined();
    });

    test('should calculate net worth correctly', () => {
        dataService.addYear(2024);
        dataService.addAsset(2024, 'Cash', 1000);
        dataService.addAsset(2024, 'Investments', 5000);
        dataService.addLiability(2024, 'Mortgage', 200000);
        dataService.addLiability(2024, 'Car Loan', 15000);

        const netWorth = dataService.getNetWorth(2024);
        expect(netWorth).toBe(-209000); // 6000 - 215000
    });

    test('should remove an asset', () => {
        dataService.addYear(2024);
        dataService.addAsset(2024, 'Cash', 1000);
        const assets = dataService.getAssets(2024);
        const assetId = assets[0].id;

        const result = dataService.removeAsset(2024, assetId);
        expect(result).toBe(true);
        expect(dataService.getAssets(2024)).toHaveLength(0);
    });

    test('should remove a liability', () => {
        dataService.addYear(2024);
        dataService.addLiability(2024, 'Mortgage', 200000);
        const liabilities = dataService.getLiabilities(2024);
        const liabilityId = liabilities[0].id;

        const result = dataService.removeLiability(2024, liabilityId);
        expect(result).toBe(true);
        expect(dataService.getLiabilities(2024)).toHaveLength(0);
    });

    test('should handle event listeners', () => {
        const mockCallback = jest.fn();
        dataService.on('dataChanged', mockCallback);
        
        dataService.addYear(2024);
        expect(mockCallback).toHaveBeenCalled();
    });
}); 