# Testing Guide

## Quick Test

Your environment is now set up! Here's how to test the application:

### 1. Start the Application

```bash
npm start
```

This will launch the Electron application window.

### 2. Configure Settings

1. Click the **"⚙️ Settings"** button in the top right
2. Enter your **API Key**
3. Select your **Environment** (start with "Staging" or "Development" for testing)
4. Optionally set default values for Source, Provider, and Owner
5. Click **"Save Settings"**

### 3. Test the Form

Fill out a test obituary:

**Person Information:**
- First Name: `Test`
- Last Name: `User`
- Date of Death: `01012025` (MMDDYYYY format)

**Obituary Information:**
- Obituary Text: `This is a test obituary for testing purposes.`
- Publish Start Date: Select today's date using the date picker

**Source Information:**
- Source Type: `Publisher`
- Source: `test-source`
- Source Reference ID: `test-001`
- Provider: `test-provider`
- Provider Reference ID: `test-provider-001`
- Owner: `test-owner`
- Owner Reference ID: `test-owner-001`

### 4. Publish

Click **"Publish Obituary"** and verify:
- Success message appears
- Obituary ID is displayed
- Redirector URL is shown (if provided)

## Testing Checklist

- [ ] Application launches without errors
- [ ] Settings modal opens and closes
- [ ] Settings can be saved
- [ ] Form validation works (try submitting empty form)
- [ ] Required fields are marked with *
- [ ] Date format validation works (try invalid date format)
- [ ] Publisher fields show/hide based on Source Type
- [ ] Success message appears on successful publish
- [ ] Error messages appear on failed publish
- [ ] Clear Form button works
- [ ] Results section displays correctly

## Common Test Scenarios

### Test 1: Empty Form Submission
- Leave all fields empty
- Click "Publish Obituary"
- **Expected**: Validation errors for required fields

### Test 2: Invalid Date Format
- Enter date of birth as `01/22/1926` (wrong format)
- **Expected**: Error message about MMDDYYYY format

### Test 3: Missing Publisher Fields
- Select Source Type: "Publisher"
- Leave publisher fields empty
- **Expected**: Error about required publisher fields

### Test 4: Successful Publish
- Fill all required fields correctly
- Use valid API key
- **Expected**: Success message with obituary ID

### Test 5: Invalid API Key
- Enter invalid API key in settings
- Try to publish
- **Expected**: HTTP 401 or 403 error

## Debugging

If you encounter issues:

1. **Check the terminal** - Error messages appear in the terminal where you ran `npm start`

2. **Run with DevTools**:
   ```bash
   npm run dev
   ```
   This opens Chrome DevTools for debugging JavaScript errors.

3. **Check console logs**:
   - Open DevTools (View → Toggle Developer Tools)
   - Check Console tab for errors
   - Check Network tab for API request details

4. **Verify API connectivity**:
   - Check your internet connection
   - Verify API endpoint is accessible
   - Confirm API key is correct

## Next Steps

Once testing is complete:
1. Test with real API credentials (in Staging environment)
2. Verify published obituaries appear correctly
3. Build distributable versions for your team
4. Distribute to support staff

