# Obituary Publisher Utility

A cross-platform desktop application for manually publishing obituaries to Legacy.com via the obituary API.

## Features

- ✅ Cross-platform support (macOS and Windows)
- ✅ Simple, intuitive form-based UI
- ✅ Secure API key storage
- ✅ Form validation and error handling
- ✅ Support for all obituary fields (person info, obituary text, source info, etc.)
- ✅ Real-time feedback on publish status
- ✅ Configuration management for API keys and defaults

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To run the application in development mode:

```bash
npm start
```

Or with DevTools open:

```bash
npm run dev
```

## Building for Distribution

### Build for macOS

```bash
npm run build:mac
```

This will create a `.dmg` file in the `dist` directory.

### Build for Windows

```bash
npm run build:win
```

This will create a `.exe` installer and portable version in the `dist` directory.

### Build for Both Platforms

```bash
npm run build:all
```

## First-Time Setup

1. Launch the application
2. Click the "⚙️ Settings" button
3. Enter your API key
4. Select your environment (Production, Staging, or Development)
5. Optionally set default values for Source, Provider, and Owner
6. Click "Save Settings"

## Usage

1. Fill out the obituary form:
   - **Person Information**: Name (first/last required), dates, age
   - **Obituary Information**: Text (required), publication dates (start date required)
   - **Source Information**: Source type, source, and reference ID (all required)
   - **Publisher Information**: Required if source type is "publisher"

2. Click "Publish Obituary"

3. Review the results:
   - Success: You'll see the obituary ID and redirector URL
   - Error: You'll see a detailed error message

## Form Fields

### Required Fields

- **Person**: First Name, Last Name
- **Obituary**: Obituary Text, Publish Start Date
- **Source**: Source Type, Source, Source Reference ID
- **Publisher** (if source type is "publisher"): Provider, Provider Reference ID, Owner, Owner Reference ID

### Date Formats

- **Dates of Birth/Death**: `MMDDYYYY` format (e.g., `01221926` for January 22, 1926)
  - Use `00` for unknown month or day (e.g., `00151926` if only year is known)
- **Publication/Print Dates**: Standard date picker (YYYY-MM-DD format)

## API Information

The application uses the Legacy.com Obituary API:

- **Endpoint**: `POST /v1/obituaries/`
- **Environments**:
  - Production: `https://eqvuex5md7.execute-api.us-east-1.amazonaws.com/prod`
  - Staging: `https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage`
  - Development: `https://h8j5wx2ek8.execute-api.us-east-1.amazonaws.com/dev`

For detailed API documentation, see `API_REVIEW.md`.

## Character Set Limitations

⚠️ **Important**: The Legacy.com database only supports the Windows-1252 character set. Extended Unicode characters will be automatically converted or replaced. The application will display a warning about this limitation.

## Configuration Storage

Configuration (API keys, defaults) is stored locally in the application's user data directory:
- **macOS**: `~/Library/Application Support/obit-intake-utils/config.json`
- **Windows**: `%APPDATA%/obit-intake-utils/config.json`

## Troubleshooting

### "API key is required" error
- Make sure you've configured your API key in Settings
- Verify the API key is correct

### "HTTP 401" error
- Your API key is invalid or expired
- Check your API key in Settings

### "HTTP 403" error
- Access denied - your API key may not have write permissions
- Contact your API administrator

### "HTTP 400" error
- Validation error - check that all required fields are filled
- Verify date formats are correct
- Check that source information is complete

### Application won't start
- Make sure Node.js is installed: `node --version`
- Try reinstalling dependencies: `rm -rf node_modules && npm install`

## Project Structure

```
obit-intake-utils/
├── src/
│   ├── main/           # Electron main process
│   │   └── main.js
│   ├── renderer/       # UI code
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   ├── preload/        # Preload script (IPC bridge)
│   │   └── preload.js
│   └── api/            # API client
│       └── obituaryClient.js
├── assets/             # Icons and resources
├── dist/               # Built applications (generated)
├── package.json
└── README.md
```

## License

ISC

## Support

For issues or questions, please refer to the API documentation or contact your system administrator.

