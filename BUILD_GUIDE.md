# Building Standalone Applications

This guide explains how to build standalone applications for Mac and Windows that can be distributed to support staff.

## Prerequisites

- Node.js (v16 or higher) installed
- npm installed
- For Mac builds: macOS (can build for both Intel and Apple Silicon)
- For Windows builds: Windows machine OR use a Mac with Wine installed (for cross-platform building)

## Quick Start

### Build for macOS

```bash
npm run build:mac
```

This creates:
- `dist/iPublish Obituary Publisher-1.0.0.dmg` - Disk image for distribution
- `dist/iPublish Obituary Publisher-1.0.0-mac.zip` - Zip archive (alternative distribution)

### Build for Windows

**Step-by-Step Instructions for Non-Technical Users:**

#### Step 1: Open Command Prompt

1. Press the **Windows key** (the key with the Windows logo) on your keyboard
2. Type: `cmd` or `Command Prompt`
3. Click on **"Command Prompt"** or **"Windows Command Processor"** when it appears
4. A black window will open - this is where you'll type commands

**Alternative:** You can also press `Windows Key + R`, type `cmd`, and press Enter.

#### Step 2: Navigate to the Project Folder

1. In the Command Prompt window, you'll see a line that looks like:
   ```
   C:\Users\YourName>
   ```
   (YourName will be your actual username)

2. You need to navigate to where the project folder is located. For example, if the project is in:
   - `C:\Users\YourName\Documents\Code\obit-intake-utils`
   - Or `C:\Projects\obit-intake-utils`
   - Or wherever you saved/cloned the project

3. Type the following command, replacing the path with your actual project location:
   ```
   cd C:\Users\YourName\Documents\Code\obit-intake-utils
   ```
   (Replace the path with where YOUR project folder is located)

4. Press **Enter**

5. You should now see the prompt change to show the project folder path:
   ```
   C:\Users\YourName\Documents\Code\obit-intake-utils>
   ```

**Tip:** If you're not sure where the project folder is:
- Open File Explorer (Windows Key + E)
- Navigate to the project folder
- Click in the address bar at the top
- Copy the full path (Ctrl + C)
- In Command Prompt, type `cd ` (with a space after cd)
- Right-click in the Command Prompt window and select "Paste"
- Press Enter

#### Step 3: Verify You're in the Right Place

1. Type this command and press Enter:
   ```
   dir
   ```
   (This shows the files in the current folder)

2. You should see files like:
   - `package.json`
   - `README.md`
   - `src` (folder)
   - `node_modules` (folder)
   - etc.

3. If you don't see `package.json`, you're in the wrong folder. Go back to Step 2.

#### Step 4: Install Dependencies (First Time Only)

**Only do this step if you haven't built the app before on this computer.**

1. Type this command and press Enter:
   ```
   npm install
   ```

2. Wait for it to finish. You'll see lots of text scrolling by - this is normal. It may take 1-2 minutes.

3. When it's done, you'll see your prompt again (the `>` symbol).

4. If you see any errors in red, contact your IT support.

#### Step 5: Build the Windows Application

1. Type this command and press Enter:
   ```
   npm run build:win
   ```

2. **This will take several minutes** (5-10 minutes is normal). You'll see:
   - Text scrolling by
   - Messages about "packaging" and "downloading"
   - Progress indicators

3. **DO NOT CLOSE THE WINDOW** while it's building. Wait until you see the prompt (`>`) again.

4. When it's finished, you should see a message like:
   ```
   • building        target=NSIS arch=x64
   • building        target=portable arch=x64
   ```

#### Step 6: Find Your Built Applications

1. The built files are in a folder called `dist` inside your project folder.

2. To open it, you can:
   - **Option A:** In Command Prompt, type:
     ```
     explorer dist
     ```
     Press Enter. This will open the `dist` folder in File Explorer.

   - **Option B:** Open File Explorer manually:
     - Press `Windows Key + E`
     - Navigate to your project folder
     - Double-click the `dist` folder

3. Inside the `dist` folder, you should see:
   - **`iPublish Obituary Publisher Setup 1.0.0.exe`** - This is the installer (recommended to share)
   - **`iPublish Obituary Publisher-1.0.0-win.zip`** - This is the portable version (no installation needed)

#### Step 7: Test the Build (Optional but Recommended)

1. Double-click the **`iPublish Obituary Publisher Setup 1.0.0.exe`** file
2. Follow the installation wizard
3. Launch the app to make sure it works
4. If it works, you're ready to distribute!

**What Gets Created:**
- `dist/iPublish Obituary Publisher Setup 1.0.0.exe` - Windows installer (recommended)
- `dist/iPublish Obituary Publisher-1.0.0-win.zip` - Portable version (no installation needed)

### Build for Both Platforms

```bash
npm run build:all
```

**Note:** Building for Windows on Mac requires Wine. For best results, build Windows apps on a Windows machine.

## Build Outputs

### macOS Outputs

1. **DMG File** (`*.dmg`)
   - Disk image format
   - Users double-click to mount, then drag app to Applications
   - Most common distribution method for Mac

2. **ZIP File** (`*-mac.zip`)
   - Compressed archive
   - Users extract and run the `.app` file directly
   - Good for quick distribution or testing

### Windows Outputs

1. **NSIS Installer** (`Setup *.exe`)
   - Full installer with setup wizard
   - Creates Start Menu shortcuts
   - Creates desktop shortcut (optional)
   - Allows custom installation directory
   - Recommended for most users

2. **Portable Version** (`*-win.zip`)
   - No installation required
   - Extract and run `iPublish Obituary Publisher.exe`
   - Good for users who can't install software
   - Settings stored in app directory

## Distribution

### For macOS Users

**Option 1: DMG (Recommended)**
1. Share the `.dmg` file via:
   - Email attachment
   - File sharing service (Dropbox, Google Drive, etc.)
   - Internal file server
   - USB drive

2. User instructions:
   - Download the `.dmg` file
   - Double-click to mount the disk image
   - Drag "iPublish Obituary Publisher" to the Applications folder
   - Eject the disk image
   - Launch from Applications

**Option 2: ZIP**
1. Share the `*-mac.zip` file
2. User instructions:
   - Download and extract the ZIP file
   - Double-click `iPublish Obituary Publisher.app` to launch
   - (Optional) Drag to Applications for permanent installation

### For Windows Users

**Option 1: Installer (Recommended)**
1. Share the `Setup *.exe` file
2. User instructions:
   - Download the installer
   - Double-click to run
   - Follow the installation wizard
   - Launch from Start Menu or desktop shortcut

**Option 2: Portable**
1. Share the `*-win.zip` file
2. User instructions:
   - Download and extract the ZIP file
   - Double-click `iPublish Obituary Publisher.exe` to launch
   - No installation required

## Building on Different Platforms

### Building Windows App on Mac

**Note:** For best results, build Windows apps on a Windows machine. However, if you only have a Mac available, you can build Windows apps using Wine (advanced - not recommended for non-technical users).

If you need to build on Mac:
1. Install Wine (requires Homebrew)
2. Run the build command
3. Test thoroughly on a Windows machine before distributing

**For non-technical users:** It's strongly recommended to use a Windows computer to build Windows applications.

### Building Mac App on Windows

This is not possible. Mac apps must be built on macOS.

## Customization

### App Icons

To add custom icons:

1. **For macOS:**
   - Create `assets/icon.icns` (512x512 or larger)
   - Use a tool like `iconutil` or online converters

2. **For Windows:**
   - Create `assets/icon.ico` (256x256 or larger)
   - Use a tool like IcoFX or online converters

If icons are missing, Electron Builder will use default Electron icons.

### App Name and Version

Edit `package.json`:
- `name`: Internal package name
- `version`: App version (e.g., "1.0.0")
- `productName`: Display name shown to users
- `description`: App description

After changing, rebuild the app.

## Troubleshooting

### "npm is not recognized" or "npm: command not found"

**Problem:** Node.js is not installed or not in your system PATH.

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install it (use the LTS version)
3. **Restart your computer** after installation
4. Open a **new** Command Prompt window
5. Try the build command again

### "cd: cannot find the path specified"

**Problem:** The folder path is incorrect or the project folder doesn't exist at that location.

**Solution:**
1. Open File Explorer (Windows Key + E)
2. Navigate to your project folder
3. Click in the address bar at the top
4. Copy the full path (Ctrl + C)
5. In Command Prompt, type `cd ` (with a space)
6. Right-click in Command Prompt and select "Paste"
7. Press Enter

### Build Takes a Very Long Time

**This is normal!** The first build can take 10-15 minutes because it needs to download Electron (a large file, ~100MB). Subsequent builds are faster.

**What to do:**
- Be patient
- Don't close the Command Prompt window
- Make sure you have a good internet connection
- The build will complete - just wait for the prompt (`>`) to return

### Build Fails with "Icon not found"

**This is not an error** - it's just a warning. The build will still work without icons. Electron Builder will use default icons.

**You can ignore this warning.** If you want to add custom icons later, see the Customization section.

### "Error: EACCES: permission denied"

**Problem:** You don't have permission to write files in the project folder.

**Solution:**
1. Make sure you're not running Command Prompt as Administrator (you usually don't need to)
2. Check that you have write permissions to the project folder
3. Try moving the project to your Documents folder or Desktop
4. If using a work computer, contact IT support

### Build Succeeds But Files Are Missing

**Problem:** Files might be in a different location than expected.

**Solution:**
1. In Command Prompt, type: `dir dist`
2. This will show all files in the dist folder
3. If the folder is empty, the build may have failed silently
4. Scroll up in the Command Prompt window to look for error messages (usually in red)
5. Try building again

### "Cannot find module" Errors

**Problem:** Dependencies are not installed.

**Solution:**
1. Make sure you're in the project folder (see Step 2)
2. Run: `npm install`
3. Wait for it to complete
4. Try building again: `npm run build:win`

### "Code signing" Errors (macOS)

If you see code signing errors:
- For internal distribution, you can skip code signing
- For public distribution, you'll need an Apple Developer certificate
- Add to `package.json` build config:
  ```json
  "mac": {
    "identity": null
  }
  ```

### Build is Very Large

Electron apps are typically 100-200MB. This is normal. The app includes:
- Chromium browser engine
- Node.js runtime
- Your application code

### Users Get "Unidentified Developer" Warning (macOS)

This is normal for unsigned apps. Users can:
1. Right-click the app → Open → Click "Open" in the dialog
2. Or go to System Preferences → Security & Privacy → Click "Open Anyway"

For signed apps, you need an Apple Developer account ($99/year).

## Version Management

When releasing a new version:

1. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild:
   ```bash
   npm run build:all
   ```

3. Distribute new files from `dist/` directory

## Best Practices

1. **Test Before Distribution**
   - Always test the built app on the target platform
   - Verify all features work
   - Check that settings persist correctly

2. **Version Control**
   - Tag releases in git
   - Keep a changelog
   - Name files with version numbers

3. **Distribution**
   - Use a consistent distribution method
   - Provide clear installation instructions
   - Consider using an update mechanism for future versions

4. **Security**
   - Don't commit API keys to the repository
   - Users enter their own API keys in the app
   - Settings are stored locally on each user's machine

## Quick Reference

### Windows Commands (Copy and Paste These)

**Open Command Prompt:**
- Press Windows Key, type `cmd`, press Enter

**Navigate to project folder:**
```
cd C:\path\to\your\project\obit-intake-utils
```
(Replace with your actual project path)

**Install dependencies (first time only):**
```
npm install
```

**Build Windows app:**
```
npm run build:win
```

**Open the dist folder:**
```
explorer dist
```

### Mac Commands

```bash
# Build Mac app
npm run build:mac

# Build Windows app (requires Wine)
npm run build:win

# Build both
npm run build:all
```

### Output Location
All built files are in the `dist/` folder inside your project directory.

## Support

If users encounter issues:
1. Check they have the correct OS version
2. Verify they followed installation instructions
3. Check console/error messages
4. Ensure they have proper API key permissions

