# Obituary API Review and Publishing Process

## API Overview

The obituary publishing API is documented in the `obit-intake` project's swagger specification: `swagger_spec_obituary_api.yml`

### Endpoint Details

**POST** `/v1/obituaries/`

**Base URLs:**
- **Dev**: `https://h8j5wx2ek8.execute-api.us-east-1.amazonaws.com/dev`
- **Stage**: `https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage`
- **Prod**: `https://eqvuex5md7.execute-api.us-east-1.amazonaws.com/prod`

**Authentication:**
- Header: `x-api-key` (required)
- Token identifying the client of the API

**Response Codes:**
- `201` - Successfully created (new obituary)
- `200` - Successfully updated (existing obituary)
- `400` - Validation error
- `401` - Client not authenticated
- `403` - Access denied (token issue)
- `413` - Quota exceeded

## Request Payload Structure

The API expects a JSON payload following the `ObituariesInput` schema. Here's the structure:

### Required Fields

1. **`person`** (object) - Information about the deceased
   - `name` (object) - Required fields: `first`, `last`
     - `prefix` (string, optional) - e.g., "Dr.", "Father"
     - `first` (string, **required**)
     - `middle` (string, optional)
     - `last` (string, **required**)
     - `maiden` (string, optional)
     - `nickname` (string, optional)
     - `suffix` (string, optional) - e.g., "Jr.", "Sr."
   - `date_of_birth` (string, optional) - Format: `MMDDYYYY` (MM/DD can be 00 if unknown)
   - `date_of_death` (string, optional) - Format: `MMDDYYYY` (MM/DD can be 00 if unknown)
   - `age` (integer, optional)

2. **`obituary`** (object) - Obituary details
   - `obituary_text` (string, **required**) - The obituary text or HTML
   - `publish_start_date` (string, **required**) - Format: `YYYY-MM-DD`
   - `publish_end_date` (string, optional) - Format: `YYYY-MM-DD`
   - `print_start_date` (string, optional) - Format: `YYYY-MM-DD`
   - `print_end_date` (string, optional) - Format: `YYYY-MM-DD`
   - `obituary_type` (string, optional) - Enum: `"paid"` or `"free"`
   - `email_address` (string, optional) - Email of person submitting

3. **`source_info`** (object, **required**) - Source information
   - `source_type` (string, **required**) - Enum: `"publisher"` or `"adn"`
   - `source` (string, **required**) - Source identifier (e.g., "ipublish")
   - `source_reference_id` (string, **required**) - Obituary identifier from the source
   - `source_url` (string, optional) - URL to the obituary source
   - For `publisher` type, also requires:
     - `provider` (string) - Provider identifier
     - `provider_reference_id` (string) - Provider's reference ID
     - `owner` (string) - Owner identifier
     - `owner_reference_id` (string) - Owner's reference ID

### Optional Fields

- **`memberships`** (array) - Organizations the deceased belonged to (schools, etc.)
- **`locations`** (array) - Important locations (birth place, residence, etc.)
- **`events`** (array) - Funeral events (Wake, Funeral Service, etc.)
- **`media`** (array) - Photos, logos, videos, etc.
- **`gift_contact`** (object) - Next of kin contact info for e-commerce
- **`version`** (string) - Client-originated version (typically timestamp) for version comparison

## Character Set Limitations

⚠️ **Important**: The database only supports Windows-1252 character set. UTF-8 is accepted but unsupported characters will be replaced with spaces. Extended characters (like Ā, ă, etc.) are converted to their ASCII equivalents.

## Example Request

```json
{
  "person": {
    "name": {
      "first": "John",
      "last": "Doe",
      "middle": "Q",
      "suffix": "Jr."
    },
    "date_of_birth": "01221926",
    "date_of_death": "05152021",
    "age": 95
  },
  "obituary": {
    "obituary_text": "John Q. Doe Jr., 95, passed away on May 15, 2021...",
    "publish_start_date": "2021-05-16",
    "publish_end_date": "2021-05-23",
    "obituary_type": "paid"
  },
  "source_info": {
    "source_type": "publisher",
    "source": "ipublish",
    "source_reference_id": "1000",
    "provider": "ipublish",
    "provider_reference_id": "1000",
    "owner": "chicagotribune",
    "owner_reference_id": "a7500"
  }
}
```

## Response Structure

On success, the API returns:

```json
{
  "obituary_id": 12345,
  "redirector_url": "https://www.legacy.com/link.asp?I=OB155931063",
  "warnings": []
}
```

## Publishing Process Summary

1. **Authenticate**: Include `x-api-key` header in request
2. **Prepare Payload**: Build JSON payload with required fields:
   - Person information (name is required)
   - Obituary text and publish dates (required)
   - Source information (required)
3. **POST Request**: Send POST to `/v1/obituaries/` endpoint
4. **Handle Response**: 
   - Check status code (201 = new, 200 = updated)
   - Extract `obituary_id` and `redirector_url` from response
   - Review any warnings

---

# Plan for Cross-Platform Publishing Utility

## Requirements
- ✅ Works on MacBook Pro (macOS)
- ✅ Works on PC (Windows)
- ✅ No hosting required (runs locally)
- ✅ Simple UI for support staff
- ✅ Manual obituary publishing

## Recommended Solution: Electron Application

**Why Electron:**
- Cross-platform (Mac, Windows, Linux)
- Modern web-based UI (HTML/CSS/JavaScript)
- No server/hosting needed
- Can be packaged as standalone executables
- Easy to distribute

**Alternative Solutions:**
1. **Python + Tkinter** - Simple but less modern UI
2. **Python + PyQt/PySide** - More modern but larger dependencies
3. **Local Web Server (Flask/FastAPI)** - Requires users to run server locally

## Proposed Architecture

### Tech Stack
- **Frontend**: HTML/CSS/JavaScript (React or Vue.js for better UX)
- **Backend**: Node.js (Electron main process)
- **API Client**: Axios or Fetch API
- **Packaging**: Electron Builder

### Features
1. **Configuration**
   - API endpoint selection (Dev/Stage/Prod)
   - API key storage (encrypted local storage)
   - Default source/provider/owner settings

2. **Form Interface**
   - Person information (name, dates, age)
   - Obituary text editor (with character set warnings)
   - Publication dates
   - Source information
   - Optional: Events, Locations, Media uploads

3. **Validation**
   - Required field validation
   - Date format validation
   - Character set warnings
   - API response error handling

4. **Success/Error Handling**
   - Display obituary ID and redirector URL on success
   - Clear error messages for failures
   - Save draft functionality

5. **History/Logging**
   - Local log of published obituaries
   - Export capability for records

### File Structure
```
obit-intake-utils/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # UI code
│   ├── api/            # API client
│   └── utils/          # Utilities
├── package.json
├── electron-builder config
└── README.md
```

### Distribution
- Build Mac app (.dmg or .app)
- Build Windows app (.exe)
- Distribute via shared drive, email, or download link

## Alternative: Simple Python GUI

If Electron seems too complex, a Python-based solution with Tkinter or PyQt would work:

**Pros:**
- Simpler setup
- Smaller footprint
- Python ecosystem for API calls

**Cons:**
- Less modern UI
- More platform-specific packaging needed

## Next Steps

1. **Confirm approach** (Electron vs Python GUI)
2. **Set up project structure**
3. **Create API client module**
4. **Build form UI**
5. **Add validation and error handling**
6. **Test on both Mac and Windows**
7. **Package for distribution**

