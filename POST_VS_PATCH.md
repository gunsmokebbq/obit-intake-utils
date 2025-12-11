# POST vs PATCH: Differences and Impact

## HTTP Method Overview

### POST
- **Purpose**: Create a new resource or submit data for processing
- **Idempotency**: Not idempotent (multiple identical requests may create multiple resources)
- **Semantics**: "Create something new" or "Process this data"
- **Request Body**: Typically contains the full resource representation

### PATCH
- **Purpose**: Partially update an existing resource
- **Idempotency**: Should be idempotent (multiple identical requests have the same effect)
- **Semantics**: "Update part of this existing resource"
- **Request Body**: Contains only the fields to update (partial update)

## In the Context of the Obituary API

### Current Implementation (POST)

According to the swagger specification, the obituary API uses **POST** for `/v1/obituaries/`:

```yaml
"/v1/obituaries/":
  post:
    summary: "POST a new or updated obituary to Legacy.com"
    description: "Sends a new or updated obituary to Legacy"
```

**Key Points:**
- POST is used for **both** creating new obituaries AND updating existing ones
- The API determines whether to create or update based on the `source_reference_id`
- Response codes:
  - `201` = New obituary created
  - `200` = Existing obituary updated

### Why POST Instead of PATCH?

The API uses POST for a specific reason:

1. **Upsert Behavior**: The API implements an "upsert" pattern - if an obituary with the same `source_reference_id` exists, it updates it; otherwise, it creates a new one.

2. **Full Payload Required**: Even for updates, the API expects the full obituary payload, not just changed fields. This is more like a "replace" operation than a "partial update."

3. **Idempotent by Design**: While POST is not inherently idempotent, this API makes it idempotent through the `source_reference_id` mechanism - sending the same payload multiple times results in the same final state.

### What About PATCH?

The swagger spec shows PATCH is used for a **different endpoint**:

```yaml
"/v1/obituaries/{obituary_id}/settings/":
  patch:
    summary: "PATCH updated settings object for a Legacy.com obituary"
    description: "Sends a patch of updated settings to Legacy"
```

**PATCH is used for:**
- Updating only the **settings** of an existing obituary
- Requires the obituary ID (not source_reference_id)
- Only updates specific settings fields, not the entire obituary

## Impact on Your 403 Error

### The CORS Header Issue

The error response showed:
```
access-control-allow-methods: OPTIONS,PATCH
```

This header indicates which HTTP methods the server **allows** for CORS requests. However, this doesn't necessarily mean POST is blocked - it might just be a CORS preflight configuration issue.

### Why You Might See This

1. **CORS Preflight**: The browser sends an OPTIONS request first to check allowed methods. The response might only list methods that require CORS, not all supported methods.

2. **Different Endpoints**: The PATCH method might be for a different endpoint (`/settings/`), so the CORS header might be endpoint-specific.

3. **Configuration Issue**: The API Gateway might not have POST properly configured in CORS, even though the endpoint accepts POST.

## Practical Differences

### If You Used PATCH Instead of POST

**Problems:**
1. **Wrong Endpoint**: PATCH is for `/v1/obituaries/{id}/settings/`, not `/v1/obituaries/`
2. **Requires Obituary ID**: You'd need the obituary ID first (from a GET request)
3. **Only Updates Settings**: PATCH only updates settings, not the full obituary
4. **Not for Creating**: PATCH can't create new obituaries, only update existing ones

**What Would Happen:**
- You'd get a 404 (obituary not found) if trying to update a non-existent obituary
- You'd get a 400 (bad request) if trying to update fields other than settings
- You couldn't create new obituaries at all

### Why POST is Correct

✅ **POST is the right method** because:
- It supports both create and update operations
- It works with `source_reference_id` (your identifier)
- It accepts the full obituary payload
- It's the documented method in the swagger spec

## The Real Issue: API Key Permissions

The 403 error is **not** because you're using POST instead of PATCH. The issue is:

1. **API Key Permissions**: Your API key likely doesn't have write permissions
2. **Endpoint Configuration**: The endpoint might have restrictions on which API keys can write
3. **Source/Provider Validation**: The API might be validating your source/provider combination

## Recommendation

**Keep using POST** - it's the correct method for this API. The 403 error needs to be resolved by:

1. Verifying your API key has write permissions
2. Confirming the API key is configured for the `ipublish` source
3. Checking with the API administrator about endpoint access

The CORS header showing PATCH is likely a red herring - it's probably just showing methods for a different endpoint or a CORS configuration quirk.

