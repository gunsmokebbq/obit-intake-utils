# 403 Forbidden Error Analysis

## Error Details

**Status Code:** 403 Forbidden  
**Error Message:** "Forbidden"  
**Endpoint:** `POST /stage/v1/obituaries/`  
**API Key:** `4e9a3eb3-e695-4564-b8d7-cee0476bcaa5-stage`  
**Environment:** Stage

## Request Analysis

The request appears to be correctly formatted:

✅ **URL Construction:** Correct
- Base URL: `https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage`
- Endpoint: `/v1/obituaries/`
- Full URL: `https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage/v1/obituaries/`

✅ **Headers:** Correct
- `x-api-key`: Present and properly formatted
- `Content-Type`: `application/json`
- `Content-Length`: 376 bytes

✅ **Payload:** Valid JSON structure
- Person information: ✓
- Obituary information: ✓
- Source information: ✓
- All required fields present

## Most Likely Causes

### 1. **API Key Permissions (Most Likely)**
The API key may not have **write permissions** for the obituary endpoint.

**Check:**
- Does the API key have POST/PUT/DELETE permissions?
- Is the API key configured for read-only access?
- Are there role-based access controls (RBAC) that restrict write operations?

**Solution:**
- Contact API administrator to verify key permissions
- Request write access for the obituary publishing endpoint
- Verify the API key is configured for the correct operation type

### 2. **API Key Scope/Configuration**
The API key might be configured for a different source or provider.

**Check:**
- Is the API key tied to a specific source/provider?
- Does the key match the source_info in the payload (`source: "ipublish"`)?
- Are there restrictions on which sources can use this key?

**Solution:**
- Verify API key is configured for `ipublish` source
- Check if key needs to be associated with specific provider/owner

### 3. **Environment Mismatch**
The API key might be for a different environment.

**Check:**
- Is the key `4e9a3eb3-e695-4564-b8d7-cee0476bcaa5-stage` actually valid for stage?
- Does the key suffix `-stage` match the environment?

**Solution:**
- Verify the API key is correct for the stage environment
- Try with a different environment's key if available

### 4. **API Gateway Configuration**
The API Gateway might have additional restrictions.

**Check:**
- Are there IP whitelist restrictions?
- Are there rate limiting rules that block requests?
- Are there CORS restrictions (though this would typically be 401/405, not 403)?

**Solution:**
- Check API Gateway logs for more details
- Verify no IP restrictions are in place
- Check for any usage plan or throttling configurations

### 5. **Source/Provider Validation**
The API might be validating the source/provider combination.

**Check:**
- Does the API require owner information for publisher source type?
- Are there validation rules for `source: "ipublish"`?

**Solution:**
- Try including owner and owner_reference_id in the payload
- Verify the source/provider combination is valid

## Recommended Actions

1. **Verify API Key Permissions**
   - Contact the API administrator
   - Request confirmation that the key has write access
   - Ask for a key with POST permissions if needed

2. **Check API Documentation**
   - Review the swagger spec for required permissions
   - Verify any additional headers or parameters needed
   - Check for any source/provider restrictions

3. **Test with Different Key**
   - If available, try with a production key (in dev environment)
   - Test with a key known to have write access
   - Compare permissions between keys

4. **Review API Gateway Logs**
   - Check CloudWatch logs for the API Gateway
   - Look for more detailed error messages
   - Check for any additional context in the logs

5. **Verify Payload Structure**
   - Ensure all required fields are present
   - Check if owner fields are actually required (despite being marked optional)
   - Verify date formats match API expectations

## Additional Notes

The error response shows:
- `x-amzn-errortype: ForbiddenException` - Standard AWS API Gateway forbidden error
- `access-control-allow-methods: OPTIONS,PATCH` - Interesting that it only allows OPTIONS and PATCH, not POST
- This might indicate the endpoint configuration issue

**Important:** The `access-control-allow-methods` header showing only `OPTIONS,PATCH` is suspicious - it suggests the endpoint might not be configured to accept POST requests, or there's a CORS/configuration issue.

## Next Steps

1. Contact the obit-intake engineering team to verify:
   - API key permissions for write operations
   - Endpoint configuration for POST requests
   - Any source/provider restrictions

2. Request a test API key with confirmed write permissions

3. Verify the endpoint accepts POST requests (the CORS header suggests it might only accept PATCH)

4. Check if there are any additional authentication requirements beyond the API key

