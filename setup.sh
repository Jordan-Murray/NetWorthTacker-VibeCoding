#!/usr/bin/env bash
# Setup script for Net Worth Tracker
# Installs Node dependencies and prepares the project

set -e

# Check for Node.js installation
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed. Please install Node.js v18+ and rerun this script." >&2
    exit 1
fi

# Ensure minimum Node version
NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Error: Detected Node.js v$NODE_MAJOR. Please install Node.js v18 or newer." >&2
    exit 1
fi

# Install project dependencies
npm install --no-audit --no-fund

echo "Setup complete. You can run 'npm test' to execute the test suite."
