import { DataService } from '../js/modules/dataService.js';

describe('Assets and Liabilities Management', () => {
    let dataStore;
    let mockStorage;
    const currentYear = new Date().getFullYear();

    beforeEach(() => {
        mockStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        dataStore = new DataService(mockStorage);
    });

    describe('Asset Management', () => {
        test('should handle multiple assets in the same year', () => {
            // Add multiple assets
            dataStore.addAsset(currentYear, 'Cash', 1000);
            dataStore.addAsset(currentYear, 'Investments', 5000);
            dataStore.addAsset(currentYear, 'Property', 250000);

            const assets = dataStore.getAssets(currentYear);
            expect(assets).toHaveLength(3);
            expect(assets.map(a => a.value)).toEqual([1000, 5000, 250000]);
            expect(assets.map(a => a.category)).toEqual(['Cash', 'Investments', 'Property']);
        });

        test('should handle asset updates', () => {
            // Add an asset
            dataStore.addAsset(currentYear, 'Cash', 1000);
            let assets = dataStore.getAssets(currentYear);
            const assetId = assets[0].id;

            // Remove and re-add with new value (simulating update)
            dataStore.removeAsset(currentYear, assetId);
            dataStore.addAsset(currentYear, 'Cash', 1500);

            assets = dataStore.getAssets(currentYear);
            expect(assets).toHaveLength(1);
            expect(assets[0].value).toBe(1500);
        });

        test('should handle invalid asset operations gracefully', () => {
            // Try to remove non-existent asset
            const result = dataStore.removeAsset(currentYear, 'non-existent-id');
            expect(result).toBe(false);

            // Try to get assets for non-existent year
            const assets = dataStore.getAssets(1900);
            expect(assets).toEqual([]);
        });

        test('should maintain asset order', () => {
            const assets = [
                { category: 'Cash', value: 1000 },
                { category: 'Stocks', value: 5000 },
                { category: 'Property', value: 300000 }
            ];

            // Add assets in sequence
            assets.forEach(asset => {
                dataStore.addAsset(currentYear, asset.category, asset.value);
            });

            const storedAssets = dataStore.getAssets(currentYear);
            expect(storedAssets.map(a => a.category)).toEqual(['Cash', 'Stocks', 'Property']);
        });
    });

    describe('Liability Management', () => {
        test('should handle multiple liabilities in the same year', () => {
            // Add multiple liabilities
            dataStore.addLiability(currentYear, 'Mortgage', 200000);
            dataStore.addLiability(currentYear, 'Car Loan', 15000);
            dataStore.addLiability(currentYear, 'Credit Card', 2000);

            const liabilities = dataStore.getLiabilities(currentYear);
            expect(liabilities).toHaveLength(3);
            expect(liabilities.map(l => l.value)).toEqual([200000, 15000, 2000]);
            expect(liabilities.map(l => l.category)).toEqual(['Mortgage', 'Car Loan', 'Credit Card']);
        });

        test('should handle liability updates', () => {
            // Add a liability
            dataStore.addLiability(currentYear, 'Mortgage', 200000);
            let liabilities = dataStore.getLiabilities(currentYear);
            const liabilityId = liabilities[0].id;

            // Remove and re-add with new value (simulating update)
            dataStore.removeLiability(currentYear, liabilityId);
            dataStore.addLiability(currentYear, 'Mortgage', 195000);

            liabilities = dataStore.getLiabilities(currentYear);
            expect(liabilities).toHaveLength(1);
            expect(liabilities[0].value).toBe(195000);
        });

        test('should handle invalid liability operations gracefully', () => {
            // Try to remove non-existent liability
            const result = dataStore.removeLiability(currentYear, 'non-existent-id');
            expect(result).toBe(false);

            // Try to get liabilities for non-existent year
            const liabilities = dataStore.getLiabilities(1900);
            expect(liabilities).toEqual([]);
        });

        test('should maintain liability order', () => {
            const liabilities = [
                { category: 'Mortgage', value: 200000 },
                { category: 'Car Loan', value: 15000 },
                { category: 'Credit Card', value: 2000 }
            ];

            // Add liabilities in sequence
            liabilities.forEach(liability => {
                dataStore.addLiability(currentYear, liability.category, liability.value);
            });

            const storedLiabilities = dataStore.getLiabilities(currentYear);
            expect(storedLiabilities.map(l => l.category)).toEqual(['Mortgage', 'Car Loan', 'Credit Card']);
        });
    });

    describe('Net Worth Calculations', () => {
        test('should calculate net worth with multiple assets and liabilities', () => {
            // Add assets
            dataStore.addAsset(currentYear, 'Cash', 10000);
            dataStore.addAsset(currentYear, 'Investments', 50000);
            dataStore.addAsset(currentYear, 'Property', 300000);

            // Add liabilities
            dataStore.addLiability(currentYear, 'Mortgage', 250000);
            dataStore.addLiability(currentYear, 'Car Loan', 15000);
            dataStore.addLiability(currentYear, 'Credit Card', 2000);

            const netWorth = dataStore.getNetWorth(currentYear);
            expect(netWorth).toBe(93000); // 360000 - 267000
        });

        test('should handle net worth calculation with no data', () => {
            const emptyYear = currentYear + 1;
            dataStore.addYear(emptyYear);
            
            const netWorth = dataStore.getNetWorth(emptyYear);
            expect(netWorth).toBe(0);
        });

        test('should handle net worth calculation with only assets', () => {
            dataStore.addAsset(currentYear, 'Cash', 10000);
            dataStore.addAsset(currentYear, 'Investments', 50000);

            const netWorth = dataStore.getNetWorth(currentYear);
            expect(netWorth).toBe(60000);
        });

        test('should handle net worth calculation with only liabilities', () => {
            dataStore.addLiability(currentYear, 'Mortgage', 250000);
            dataStore.addLiability(currentYear, 'Car Loan', 15000);

            const netWorth = dataStore.getNetWorth(currentYear);
            expect(netWorth).toBe(-265000);
        });
    });
}); 