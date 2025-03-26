import { Router } from '../js/modules/router.js';

describe('Router', () => {
    let router;
    let mockDashboard;
    let mockAssetsLiabilities;
    let mockTrends;
    let mockNavLinks;

    beforeEach(() => {
        // Create mock DOM elements
        mockDashboard = document.createElement('section');
        mockDashboard.id = 'dashboard';
        mockDashboard.classList.add('active-section');
        
        mockAssetsLiabilities = document.createElement('section');
        mockAssetsLiabilities.id = 'assets-liabilities';
        mockAssetsLiabilities.classList.add('hidden-section');
        
        mockTrends = document.createElement('section');
        mockTrends.id = 'trends';
        mockTrends.classList.add('hidden-section');

        // Create mock nav links
        mockNavLinks = {
            dashboard: document.createElement('a'),
            assetsLiabilities: document.createElement('a'),
            trends: document.createElement('a')
        };
        mockNavLinks.dashboard.href = '#dashboard';
        mockNavLinks.assetsLiabilities.href = '#assets-liabilities';
        mockNavLinks.trends.href = '#trends';
        mockNavLinks.dashboard.classList.add('active');

        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            switch(id) {
                case 'dashboard': return mockDashboard;
                case 'assets-liabilities': return mockAssetsLiabilities;
                case 'trends': return mockTrends;
                default: return null;
            }
        });

        // Mock querySelectorAll for nav links
        document.querySelectorAll = jest.fn(() => Object.values(mockNavLinks));

        // Create router instance
        router = new Router();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with dashboard as active section', () => {
        router.init();
        expect(mockDashboard.classList.contains('active-section')).toBe(true);
        expect(mockDashboard.classList.contains('hidden-section')).toBe(false);
        expect(mockNavLinks.dashboard.classList.contains('active')).toBe(true);
    });

    test('should handle navigation to assets-liabilities section', () => {
        router.init();
        router.navigate('assets-liabilities');

        // Check section visibility
        expect(mockDashboard.classList.contains('active-section')).toBe(false);
        expect(mockDashboard.classList.contains('hidden-section')).toBe(true);
        expect(mockAssetsLiabilities.classList.contains('active-section')).toBe(true);
        expect(mockAssetsLiabilities.classList.contains('hidden-section')).toBe(false);

        // Check nav link active state
        expect(mockNavLinks.dashboard.classList.contains('active')).toBe(false);
        expect(mockNavLinks.assetsLiabilities.classList.contains('active')).toBe(true);
    });

    test('should handle navigation to trends section', () => {
        router.init();
        router.navigate('trends');

        // Check section visibility
        expect(mockDashboard.classList.contains('active-section')).toBe(false);
        expect(mockDashboard.classList.contains('hidden-section')).toBe(true);
        expect(mockTrends.classList.contains('active-section')).toBe(true);
        expect(mockTrends.classList.contains('hidden-section')).toBe(false);

        // Check nav link active state
        expect(mockNavLinks.dashboard.classList.contains('active')).toBe(false);
        expect(mockNavLinks.trends.classList.contains('active')).toBe(true);
    });

    test('should handle hash change events', () => {
        router.init();
        
        // Simulate hash change to assets-liabilities
        window.location.hash = '#assets-liabilities';
        router.handleHashChange();

        expect(mockAssetsLiabilities.classList.contains('active-section')).toBe(true);
        expect(mockNavLinks.assetsLiabilities.classList.contains('active')).toBe(true);
    });

    test('should default to dashboard for unknown routes', () => {
        router.init();
        router.navigate('unknown-route');

        expect(mockDashboard.classList.contains('active-section')).toBe(true);
        expect(mockNavLinks.dashboard.classList.contains('active')).toBe(true);
    });

    test('should dispatch navigationChanged event', () => {
        const mockEventListener = jest.fn();
        document.addEventListener('navigationChanged', mockEventListener);
        
        router.init();
        router.navigate('trends');

        expect(mockEventListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { section: 'trends' }
            })
        );
    });
}); 