# CJ Dropshipping API Plan

This document summarizes the CJ Dropshipping API endpoints shared for this project and maps them to the product discovery, ranking, and store publishing workflow.

Important: API credentials must never be committed to this repository. Store credentials in environment variables only.

## Authentication

### Authentication Endpoints

```text
/authentication/getAccessToken
/authentication/refreshAccessToken
/authentication/logout
```

### Get Access Token

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
```

Request:

```json
{
  "apiKey": "CJxxxx@api@xxxxxxxx"
}
```

Notes:

1. Use API Key authentication only.
2. Rate limit is 1 request per second.
3. Tokens are cached by CJ for up to 24 hours.
4. Access token lifetime is approximately 15 days.
5. Refresh token lifetime is approximately 180 days.

Successful response returns:

```text
openId
accessToken
accessTokenExpiryDate
refreshToken
refreshTokenExpiryDate
createDate
```

### Refresh Access Token

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken
```

Request:

```json
{
  "refreshToken": "xxxxxxxxxxxxxxxx"
}
```

Successful response returns:

```text
accessToken
accessTokenExpiryDate
refreshToken
refreshTokenExpiryDate
createDate
```

### Logout

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/authentication/logout
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Logout invalidates both access and refresh tokens.

### Authentication Strategy For This Project

Stored values:

```text
access_token
refresh_token
access_expires_at
refresh_expires_at
```

Workflow:

```text
Start Job
    ↓
Check Access Token
    ↓
Valid?
    ↓
YES → Continue

NO
    ↓
Refresh Token
    ↓
Continue
```

If refresh fails:

```text
Stop Job
Notify
Reauthenticate
```

### Required Environment Variables

```text
CJ_API_KEY=
CJ_ACCESS_TOKEN=
CJ_REFRESH_TOKEN=
CJ_API_BASE_URL=
```

## Product Discovery

These endpoints can support product search, product listing, category discovery, and product details.

Relevant endpoints:

```text
/product/list
/product/listV2
/product/query
/product/getCategory
/product/variant/query
/product/variant/queryByVid
/product/productComments
/product/comments
```

Primary use cases:

1. Search CJ products.
2. Fetch product details.
3. Fetch variants and SKUs.
4. Fetch category data.
5. Fetch product reviews or comments where available.

## Product Sourcing

These endpoints can support sourcing workflows when a desired product is not directly listed or needs sourcing validation.

Relevant endpoints:

```text
/product/sourcing/query
/product/sourcing/create
```

Primary use cases:

1. Check existing sourcing requests.
2. Create sourcing requests for promising products.
3. Track whether sourced products can be used for the store.

## Inventory and Stock

These endpoints can support inventory checks before ranking or publishing products.

Relevant endpoints:

```text
/product/stock/queryBySku
/product/stock/queryByVid
/product/stock/getInventoryByPid
/product/stock/privateInventory/querySkuListByProductId
/product/stock/privateInventory/querySkuDetailPage
/product/stock/privateInventory/querySkuDetailListBySku
/product/stock/privateInventory/querySkuFlowByCondition
/product/stock/privateInventory/querySpuPage
```

## Shipping and Logistics

Relevant endpoints:

```text
/logistic/freightCalculate
/logistic/partnerFreightCalculate
/logistic/freightCalculateTip
/logistic/getSupplierLogisticsTemplate
/logistic/getTrackInfo
/logistic/trackInfo
```

## Store and Listing Support

Relevant endpoints:

```text
/shop/getShops
/product/listed/getPlatformCategoryTree
/product/listed/getReceiverCountryInfo
/product/listed/queryVendors
/product/listed/queryDeliveryProfiles
/product/listed/listedByPids
```
