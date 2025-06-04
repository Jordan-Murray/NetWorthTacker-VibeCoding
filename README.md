# Net Worth Tracker

A simple yet powerful web application to track your net worth over time, built using vanilla HTML, CSS, and JavaScript.

## Features

- **Net Worth Tracking:** Track your assets and liabilities by year.
- **Data Visualization:** See your financial progress with dynamic charts.
- **Asset Diversity:** Visualize your asset allocation with a pie chart.
- **Growth Metrics:** Track year-over-year growth percentages.
- **Debt-to-Asset Ratio:** Monitor your financial health with debt-to-asset ratio tracking.
- **Milestone Tracking:** Set and achieve net worth goals.
- **Market Benchmarking:** Compare your growth to market benchmarks.
- **Offline Data Storage:** All data is stored locally in your browser.

## Getting Started

### Installation

1. Clone or download this repository.
2. *(Optional)* Run `./setup.sh` to install the Node.js dependencies. This step is required if you want to run the test suite.
3. Open `index.html` in your web browser.

No server setup or installation is required for basic usage&mdash;the application runs entirely in your browser. The setup script simply installs the development dependencies so that `npm test` works.

### How to Use

1. **Add a Year:** Start by adding a financial year to track. The current year will be added by default.
2. **Add Assets:** Input your assets with category, name, and value.
3. **Add Liabilities:** Enter your debts and other liabilities.
4. **Track Progress:** View your financial progress through various charts and metrics.
5. **Set Milestones:** Create financial goals and track your progress towards achieving them.

## Data Management

- All data is stored securely in your browser's local storage.
- Use the export feature to back up your data.
- Import previously exported data to restore your information.

## Browser Compatibility

This application works with all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Privacy

Your financial data never leaves your computer - everything is stored locally in your browser.

## License

This project is open source and available under the MIT License.

## Running Tests

After cloning the repository and installing the dependencies, run:

```bash
npm test
```

This executes the Jest test suite located in the `tests/` directory.

## Contributions

Contributions, issues, and feature requests are welcome! 