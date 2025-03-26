import { DataService } from '../js/modules/dataService.js';

describe('Assets and Liabilities Management', () => {
    let dataService;
    let mockStorage;
    const currentYear = new Date().getFullYear();

    beforeEach(() => {
        mockStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        dataService = new DataService(mockStorage);
    });

    describe('Asset Management', () => {
        test('should handle multiple assets in the same year', () => {
            // Add multiple assets
            dataService.addAsset(currentYear, 'Cash', 1000);
            dataService.addAsset(currentYear, 'Investments', 5000);
            dataService.addAsset(currentYear, 'Property', 250000);

            const assets = dataService.getAssets(currentYear);
            expect(assets).toHaveLength(3);
            expect(assets.map(a => a.value)).toEqual([1000, 5000, 250000]);
            expect(assets.map(a => a.category)).toEqual(['Cash', 'Investments', 'Property']);
        });

        test('should handle asset updates', () => {
            // Add an asset
            dataService.addAsset(currentYear, 'Cash', 1000);
            let assets = dataService.getAssets(currentYear);
            const assetId = assets[0].id;

            // Remove and re-add with new value (simulating update)
            dataService.removeAsset(currentYear, assetId);
            dataService.addAsset(currentYear, 'Cash', 1500);

            assets = dataService.getAssets(currentYear);
            expect(assets).toHaveLength(1);
            expect(assets[0].value).toBe(1500);
        });

        test('should handle invalid asset operations gracefully', () => {
            // Try to remove non-existent asset
            const result = dataService.removeAsset(currentYear, 'non-existent-id');
            expect(result).toBe(false);

            // Try to get assets for non-existent year
            const assets = dataService.getAssets(1900);
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
                dataService.addAsset(currentYear, asset.category, asset.value);
            });

            const storedAssets = dataService.getAssets(currentYear);
            expect(storedAssets.map(a => a.category)).toEqual(['Cash', 'Stocks', 'Property']);
        });
    });

    describe('Liability Management', () => {
        test('should handle multiple liabilities in the same year', () => {
            // Add multiple liabilities
            dataService.addLiability(currentYear, 'Mortgage', 200000);
            dataService.addLiability(currentYear, 'Car Loan', 15000);
            dataService.addLiability(currentYear, 'Credit Card', 2000);

            const liabilities = dataService.getLiabilities(currentYear);
            expect(liabilities).toHaveLength(3);
            expect(liabilities.map(l => l.value)).toEqual([200000, 15000, 2000]);
            expect(liabilities.map(l => l.category)).toEqual(['Mortgage', 'Car Loan', 'Credit Card']);
        });

        test('should handle liability updates', () => {
            // Add a liability
            dataService.addLiability(currentYear, 'Mortgage', 200000);
            let liabilities = dataService.getLiabilities(currentYear);
            const liabilityId = liabilities[0].id;

            // Remove and re-add with new value (simulating update)
            dataService.removeLiability(currentYear, liabilityId);
            dataService.addLiability(currentYear, 'Mortgage', 195000);

            liabilities = dataService.getLiabilities(currentYear);
            expect(liabilities).toHaveLength(1);
            expect(liabilities[0].value).toBe(195000);
        });

        test('should handle invalid liability operations gracefully', () => {
            // Try to remove non-existent liability
            const result = dataService.removeLiability(currentYear, 'non-existent-id');
            expect(result).toBe(false);

            // Try to get liabilities for non-existent year
            const liabilities = dataService.getLiabilities(1900);
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
                dataService.addLiability(currentYear, liability.category, liability.value);
            });

            const storedLiabilities = dataService.getLiabilities(currentYear);
            expect(storedLiabilities.map(l => l.category)).toEqual(['Mortgage', 'Car Loan', 'Credit Card']);
        });
    });

    describe('Net Worth Calculations', () => {
        test('should calculate net worth with multiple assets and liabilities', () => {
            // Add assets
            dataService.addAsset(currentYear, 'Cash', 10000);
            dataService.addAsset(currentYear, 'Investments', 50000);
            dataService.addAsset(currentYear, 'Property', 300000);

            // Add liabilities
            dataService.addLiability(currentYear, 'Mortgage', 250000);
            dataService.addLiability(currentYear, 'Car Loan', 15000);
            dataService.addLiability(currentYear, 'Credit Card', 2000);

            const netWorth = dataService.getNetWorth(currentYear);
            expect(netWorth).toBe(93000); // 360000 - 267000
        });

        test('should handle net worth calculation with no data', () => {
            const emptyYear = currentYear + 1;
            dataService.addYear(emptyYear);
            
            const netWorth = dataService.getNetWorth(emptyYear);
            expect(netWorth).toBe(0);
        });

        test('should handle net worth calculation with only assets', () => {
            dataService.addAsset(currentYear, 'Cash', 10000);
            dataService.addAsset(currentYear, 'Investments', 50000);

            const netWorth = dataService.getNetWorth(currentYear);
            expect(netWorth).toBe(60000);
        });

        test('should handle net worth calculation with only liabilities', () => {
            dataService.addLiability(currentYear, 'Mortgage', 250000);
            dataService.addLiability(currentYear, 'Car Loan', 15000);

            const netWorth = dataService.getNetWorth(currentYear);
            expect(netWorth).toBe(-265000);
        });
    });
}); 