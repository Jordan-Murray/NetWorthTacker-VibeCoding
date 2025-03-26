// Mock Chart.js
const Chart = jest.fn().mockImplementation((ctx, config) => {
    const chartInstance = {
        data: {
            labels: [],
            datasets: config.data.datasets.map(dataset => ({
                ...dataset,
                data: []
            }))
        },
        update: jest.fn(),
        destroy: jest.fn()
    };
    return chartInstance;
});

global.Chart = Chart;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.alert
global.alert = jest.fn();

// Add custom matchers if needed
expect.extend({
    toHaveBeenCalledWithMatch(received, ...expected) {
        const pass = received.mock.calls.some(call =>
            expected.every((arg, i) => {
                if (typeof arg === 'object') {
                    return JSON.stringify(call[i]) === JSON.stringify(arg);
                }
                return call[i] === arg;
            })
        );

        return {
            pass,
            message: () =>
                `expected ${received.mock.calls} to contain a call matching ${expected}`
        };
    }
}); 