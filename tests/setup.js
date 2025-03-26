// Mock Chart.js
jest.mock('chart.js', () => ({
    Chart: jest.fn(),
    registerables: []
}));

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