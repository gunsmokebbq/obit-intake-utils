#!/bin/bash

# Quick Node.js installation script for macOS
# This script helps install Node.js if it's not already installed

echo "🔍 Checking for Node.js installation..."

if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed!"
    node --version
    npm --version
    exit 0
fi

echo "❌ Node.js is not installed."
echo ""
echo "Please choose an installation method:"
echo ""
echo "Option 1: Install via Homebrew (Recommended)"
echo "  If you have Homebrew installed, run:"
echo "    brew install node"
echo ""
echo "Option 2: Download from Node.js website"
echo "  1. Visit: https://nodejs.org/"
echo "  2. Download the LTS version for macOS"
echo "  3. Run the installer"
echo "  4. Restart your terminal"
echo ""
echo "Option 3: Install Homebrew first (if you don't have it)"
echo "  Run: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo "  Then: brew install node"
echo ""
echo "After installation, verify with:"
echo "  node --version"
echo "  npm --version"
echo ""
echo "Then run: npm install"

