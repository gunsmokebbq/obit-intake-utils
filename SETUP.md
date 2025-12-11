# Local Environment Setup Guide

## Prerequisites

This application requires **Node.js** (version 16 or higher) and **npm** (comes with Node.js).

## Step 1: Install Node.js

### Option A: Using Homebrew (Recommended for macOS)

If you have Homebrew installed:

```bash
brew install node
```

Verify installation:
```bash
node --version
npm --version
```

### Option B: Download from Node.js Website

1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Follow the installation wizard
5. Restart your terminal

Verify installation:
```bash
node --version
npm --version
```

### Option C: Using nvm (Node Version Manager)

If you prefer to manage multiple Node.js versions:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc  # or ~/.bash_profile

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version
```

## Step 2: Install Project Dependencies

Once Node.js is installed, navigate to the project directory and install dependencies:

```bash
cd /Users/chrisgray/Documents/Code/obit-intake-utils
npm install
```

This will install:
- Electron (desktop application framework)
- Electron Builder (for packaging)
- Axios (HTTP client for API calls)
- All other required dependencies

**Expected output:** You should see a progress bar and then "added X packages" message.

## Step 3: Test the Application

### Run in Development Mode

```bash
npm start
```

This will:
- Launch the Electron application
- Open the main window
- Allow you to test the UI

### Run with DevTools (for debugging)

```bash
npm run dev
```

This opens the application with Chrome DevTools enabled, useful for debugging.

## Step 4: Configure the Application

1. When the app opens, click the **"⚙️ Settings"** button
2. Enter your **API Key** (required)
3. Select your **Environment**:
   - **Production** - For live publishing
   - **Staging** - For testing
   - **Development** - For development
4. (Optional) Set default values for Source, Provider, and Owner
5. Click **"Save Settings"**

## Step 5: Test Publishing

1. Fill out the obituary form with test data
2. Click **"Publish Obituary"**
3. Verify you get a success response with an obituary ID

**Note:** Make sure you're using the correct environment (Staging/Dev) for testing to avoid publishing test data to production.

## Troubleshooting

### "command not found: node"
- Node.js is not installed or not in your PATH
- Follow Step 1 above to install Node.js
- Restart your terminal after installation

### "npm install" fails
- Check your internet connection
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Application won't start
- Make sure dependencies are installed: `npm install`
- Check for error messages in the terminal
- Try running with DevTools: `npm run dev` to see detailed errors

### "API key is required" error
- Go to Settings and configure your API key
- Make sure you've saved the settings

### Port already in use
- Close any other instances of the application
- Check if another Electron app is running

## Next Steps

Once everything is working:

1. **Test the full workflow** - Publish a test obituary
2. **Build for distribution** - See README.md for build instructions
3. **Customize** - Add icons, modify UI, etc.

## Quick Reference

```bash
# Install dependencies
npm install

# Run application
npm start

# Run with DevTools
npm run dev

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for both
npm run build:all
```

## Getting Help

- Check `README.md` for full documentation
- Review `QUICK_START.md` for usage guide
- See `API_REVIEW.md` for API details
- Check terminal output for error messages

