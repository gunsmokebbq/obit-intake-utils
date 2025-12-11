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

```bash
npm run build:win
```

This creates:
- `dist/iPublish Obituary Publisher Setup 1.0.0.exe` - Windows installer
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

You can build Windows apps on Mac, but it requires Wine:

```bash
# Install Wine (using Homebrew)
brew install wine-stable

# Then build
npm run build:win
```

**Note:** For best compatibility, build Windows apps on a Windows machine when possible.

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

### Build Fails with "Icon not found"

The build will still work without icons, but you'll see warnings. Either:
1. Add icon files to `assets/` directory, or
2. Remove icon references from `package.json` build config

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

```bash
# Build Mac app
npm run build:mac

# Build Windows app
npm run build:win

# Build both
npm run build:all

# Output location
dist/
```

## Support

If users encounter issues:
1. Check they have the correct OS version
2. Verify they followed installation instructions
3. Check console/error messages
4. Ensure they have proper API key permissions

