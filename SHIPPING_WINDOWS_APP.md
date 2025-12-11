# Shipping the Windows App to Support Staff

## Quick Steps to Build and Ship

### Option 1: You Build It (Recommended)

If you have access to a Windows computer:

1. **On the Windows computer:**
   - Make sure Node.js is installed (download from https://nodejs.org/ if needed)
   - Copy the entire `obit-intake-utils` project folder to the Windows computer
   - Follow the Windows build instructions in `BUILD_GUIDE.md`

2. **After building, you'll find these files in the `dist` folder:**
   - `iPublish Obituary Publisher Setup 1.0.0.exe` ← **Share this one (recommended)**
   - `iPublish Obituary Publisher-1.0.0-win.zip` ← Alternative portable version

3. **Share the file:**
   - Email the `.exe` file as an attachment
   - Or upload to a file sharing service (Dropbox, Google Drive, OneDrive, etc.)
   - Or put it on a shared network drive
   - Or copy to a USB drive

### Option 2: Support Person Builds It

If you want the support person to build it themselves:

1. **Share the project:**
   - Send them the entire `obit-intake-utils` folder (zip it first)
   - Or have them clone from GitHub: `https://github.com/gunsmokebbq/obit-intake-utils.git`

2. **Send them these instructions:**
   - Point them to `BUILD_GUIDE.md` in the project
   - Or send them the Windows build section

3. **They'll need:**
   - Node.js installed (they can download from https://nodejs.org/)
   - Follow the step-by-step instructions

## What to Share

### Recommended: The Installer (.exe file)

**File:** `iPublish Obituary Publisher Setup 1.0.0.exe`

**Why:** 
- Easiest for users
- Creates Start Menu shortcuts
- Professional installation experience
- Users are familiar with installers

**How to share:**
- Email attachment (if under size limit, usually 25MB)
- File sharing service (Google Drive, Dropbox, OneDrive)
- Shared network folder
- USB drive

### Alternative: Portable Version (.zip file)

**File:** `iPublish Obituary Publisher-1.0.0-win.zip`

**Why:**
- No installation needed
- Good if users can't install software
- Can run from USB drive

**How to share:**
- Same methods as above

## Instructions to Send with the App

Copy and paste this for your support person:

---

### Installation Instructions

**If you received the `.exe` file (Installer):**

1. Download the file: `iPublish Obituary Publisher Setup 1.0.0.exe`
2. Double-click the file to run the installer
3. Follow the installation wizard:
   - Click "Next" through the screens
   - Choose installation location (default is fine)
   - Click "Install"
4. When installation completes, click "Finish"
5. Launch the app from:
   - Start Menu → "iPublish Obituary Publisher"
   - Or desktop shortcut (if you chose to create one)

**If you received the `.zip` file (Portable):**

1. Download the file: `iPublish Obituary Publisher-1.0.0-win.zip`
2. Right-click the ZIP file and select "Extract All..."
3. Choose a location (like Desktop or Documents)
4. Open the extracted folder
5. Double-click `iPublish Obituary Publisher.exe` to launch
6. No installation needed!

### First-Time Setup

1. When the app opens, click the **"⚙️ Settings"** button (top right)
2. Enter your **API Key** (get this from your administrator)
3. Select your **Environment**:
   - **Production** - For live publishing
   - **Staging** - For testing
   - **Development** - For development
4. (Optional) Check "Use Direct Endpoint" if you're having connection issues
5. (Optional) Set default Owner if you use the same one frequently
6. Click **"Save Settings"**

### Using the App

1. Fill out the obituary form with the required information
2. Click **"Publish Obituary"**
3. Review the results - you'll see the obituary ID and redirector URL on success

### Need Help?

- Check the console at the bottom of the app for API call details
- Review error messages if publishing fails
- Contact your administrator if you need a new API key

---

## File Sizes

The built files are approximately:
- **Installer (.exe):** ~100-150 MB
- **Portable (.zip):** ~90-120 MB

**Note:** These are large files because they include everything needed to run the app (browser engine, etc.). This is normal for Electron apps.

## Email Size Limits

Most email providers have attachment size limits:
- Gmail: 25 MB
- Outlook: 20 MB
- Yahoo: 25 MB

**If the file is too large for email:**
- Use Google Drive, Dropbox, or OneDrive
- Upload the file and share the link
- Or use a file sharing service like WeTransfer

## Quick Checklist

- [ ] Build the Windows app on a Windows computer
- [ ] Locate the files in the `dist` folder
- [ ] Choose which file to share (installer recommended)
- [ ] Share via email, file sharing service, or USB drive
- [ ] Send installation instructions (copy from above)
- [ ] Provide API key and environment information
- [ ] Test the app yourself first (optional but recommended)

## Testing Before Shipping

Before sending to support staff, test the built app:

1. Install/run the built app on a Windows computer
2. Configure settings with a test API key
3. Try publishing a test obituary
4. Verify everything works
5. Then share with support staff

This ensures the app works correctly before distribution.

