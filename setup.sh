#!/usr/bin/env bash
# Setup script for Net Worth Tracker
# Installs Node dependencies and prepares the project

set -e

# Check for Node.js installation
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed. Please install Node.js v18+ and rerun this script." >&2
    exit 1
fi

# Install project dependencies
npm install

echo "Setup complete. You can run 'npm test' to execute the test suite."
