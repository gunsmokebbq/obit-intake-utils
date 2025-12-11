# Quick Start Guide

## Installation Steps

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Verify installation: `node --version` (should be v16 or higher)

2. **Install Dependencies**
   ```bash
   cd obit-intake-utils
   npm install
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

## First-Time Configuration

1. When the app opens, click **"⚙️ Settings"** in the top right
2. Enter your **API Key** (required)
3. Select your **Environment**:
   - **Production** - For live publishing
   - **Staging** - For testing
   - **Development** - For development/testing
4. (Optional) Set default values:
   - Default Source (e.g., "ipublish")
   - Default Provider (e.g., "ipublish")
   - Default Owner (e.g., "chicagotribune")
5. Click **"Save Settings"**

## Publishing an Obituary

### Step 1: Fill Person Information
- **First Name** * (required)
- **Last Name** * (required)
- Middle Name, Prefix, Suffix, etc. (optional)
- Date of Birth: Format `MMDDYYYY` (e.g., `01221926` for Jan 22, 1926)
- Date of Death: Format `MMDDYYYY`
- Age (optional)

### Step 2: Fill Obituary Information
- **Obituary Text** * (required) - The full obituary text or HTML
- **Publish Start Date** * (required) - Use the date picker
- Publish End Date (optional)
- Print dates (optional)
- Obituary Type: Paid or Free (optional)
- Email Address (optional)

### Step 3: Fill Source Information
- **Source Type** * (required) - Select "Publisher" or "ADN"
- **Source** * (required) - e.g., "ipublish"
- **Source Reference ID** * (required) - Your reference ID for this obituary
- Source URL (optional)

### Step 4: Publisher Information (if Source Type is "Publisher")
- **Provider** * (required)
- **Provider Reference ID** * (required)
- **Owner** * (required)
- **Owner Reference ID** * (required)

### Step 5: Publish
- Click **"Publish Obituary"**
- Wait for the response
- On success, you'll see:
  - Obituary ID
  - Redirector URL (clickable link)

## Building Distributable Applications

### For macOS Users:
```bash
npm run build:mac
```
Output: `dist/Obituary Publisher-1.0.0.dmg`

### For Windows Users:
```bash
npm run build:win
```
Output: `dist/Obituary Publisher Setup 1.0.0.exe` and portable version

### For Both:
```bash
npm run build:all
```

## Common Issues

**"API key is required"**
→ Go to Settings and enter your API key

**"First name and last name are required"**
→ Make sure both name fields are filled

**"Date must be in MMDDYYYY format"**
→ Use format like `01221926` (not `01/22/1926` or `1926-01-22`)

**"All publisher fields are required"**
→ If Source Type is "Publisher", fill all four publisher fields

**Application won't start**
→ Make sure you ran `npm install` first

## Tips

- Use the **Clear Form** button to reset all fields
- Default values from Settings will auto-populate when you open the form
- The form validates as you go - required fields are marked with *
- Success messages auto-hide after 5 seconds
- Error messages stay visible until you dismiss them or clear the form

## Need Help?

- Check `README.md` for detailed documentation
- Review `API_REVIEW.md` for API details
- Verify your API key has write permissions
- Test in Staging environment first before using Production

