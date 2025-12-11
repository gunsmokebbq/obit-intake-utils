# What Files to Send for Building

## Quick Answer

Send them the **entire project folder** (as a ZIP file), but you can exclude some files to make it smaller.

## What to Include

Send these files and folders:

✅ **Required Files:**
- `package.json` - Contains build configuration
- `src/` folder - All source code
  - `src/main/` - Main Electron process
  - `src/renderer/` - UI files
  - `src/preload/` - Preload scripts
  - `src/api/` - API client
- `README.md` - Documentation
- `BUILD_GUIDE.md` - Build instructions (they'll need this!)
- `SHIPPING_WINDOWS_APP.md` - Shipping guide (optional but helpful)

✅ **Helpful Files:**
- `QUICK_START.md` - Quick reference
- `SETUP.md` - Setup instructions
- `API_REVIEW.md` - API documentation
- `.gitignore` - Git ignore rules (harmless to include)

## What to Exclude (Don't Send)

❌ **Don't include these** (they're large and will be recreated):
- `node_modules/` folder - Very large (~300MB+), will be recreated with `npm install`
- `dist/` folder - Build outputs, not needed for building
- `.git/` folder - Git repository data, not needed
- `*.log` files - Log files
- `package-lock.json` - Optional (will be recreated, but harmless to include)

## How to Package It

### Option 1: Create a ZIP File (Easiest)

1. **On your Mac:**
   - Open Finder
   - Navigate to the `obit-intake-utils` folder
   - Right-click the folder
   - Select "Compress" or "Archive"
   - This creates `obit-intake-utils.zip`

2. **Before sending, you can make it smaller by:**
   - Opening the ZIP file
   - Deleting the `node_modules` folder from inside (if it's there)
   - Re-zipping if needed

### Option 2: Use Git (If They Have Git)

If the support person has Git installed, they can clone directly:

```
git clone https://github.com/gunsmokebbq/obit-intake-utils.git
```

This is cleaner and ensures they get the latest version.

## What to Send

**Send them:**
1. The ZIP file (or GitHub clone instructions)
2. Point them to `BUILD_GUIDE.md` for Windows build instructions
3. Make sure they have Node.js installed (they can download from https://nodejs.org/)

## File Size

- **With node_modules:** ~300-400 MB (too large for email)
- **Without node_modules:** ~1-5 MB (easy to email or share)

**Recommendation:** Exclude `node_modules` - they'll run `npm install` anyway.

## Step-by-Step: Creating the ZIP

1. **Open Terminal on your Mac:**
   - Press `Command + Space`
   - Type "Terminal"
   - Press Enter

2. **Navigate to the parent folder:**
   ```bash
   cd /Users/chrisgray/Documents/Code
   ```

3. **Create a clean ZIP (excluding node_modules and dist):**
   ```bash
   zip -r obit-intake-utils-for-building.zip obit-intake-utils -x "*/node_modules/*" "*/dist/*" "*/.git/*" "*.log"
   ```

4. **Find the ZIP file:**
   - It will be in `/Users/chrisgray/Documents/Code/`
   - File name: `obit-intake-utils-for-building.zip`

5. **Send this ZIP file** to your support person

## What They Need to Do After Receiving

1. **Extract the ZIP file** to a folder (like `C:\Users\TheirName\Documents\obit-intake-utils`)

2. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Install it
   - Restart computer

3. **Follow the Windows build instructions** in `BUILD_GUIDE.md`

4. **Build the app:**
   - Open Command Prompt
   - Navigate to the project folder
   - Run: `npm install` (first time only)
   - Run: `npm run build:win`

5. **Find the built app** in the `dist` folder

## Alternative: GitHub Access

If you want to give them direct access:

1. **Give them the GitHub repository URL:**
   ```
   https://github.com/gunsmokebbq/obit-intake-utils.git
   ```

2. **They can clone it:**
   - Install Git for Windows: https://git-scm.com/download/win
   - Open Command Prompt
   - Run: `git clone https://github.com/gunsmokebbq/obit-intake-utils.git`
   - Navigate into the folder: `cd obit-intake-utils`
   - Follow build instructions

**Advantages:**
- Always get latest version
- Smaller download
- Can pull updates later

## Quick Checklist

- [ ] Create ZIP file (excluding node_modules, dist, .git)
- [ ] Verify ZIP is reasonable size (1-5 MB without node_modules)
- [ ] Send ZIP file or GitHub link
- [ ] Tell them to read `BUILD_GUIDE.md` for Windows instructions
- [ ] Make sure they have Node.js installed
- [ ] They'll run `npm install` then `npm run build:win`

## Recommended Approach

**Best option:** Send them the GitHub repository link and have them clone it. This is:
- Cleaner
- Smaller
- Always up-to-date
- Professional

**Alternative:** Send a ZIP file without `node_modules` folder.

