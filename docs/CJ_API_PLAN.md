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

## Settings

### Get Settings

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/setting/get
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Purpose:

1. Validate the CJ account before running automation.
2. Read API quota limits.
3. Read account level QPS limits.
4. Detect sandbox mode.
5. Check callback and webhook configuration.
6. Check account root permission.

Successful response fields:

```text
openId
openName
openEmail
setting.quotaLimits
setting.qpsLimit
callback.product.type
callback.product.urls
callback.order.type
callback.order.urls
root
isSandbox
requestId
```

Root access values:

```text
NO_PERMISSION - not authorized
GENERAL - general account
VIP - VIP account
ADMIN - administrator
```

Quota type values:

```text
0 - total
1 - per year
2 - per quarter
3 - per month
4 - per day
5 - per hour
```

Project usage:

1. Call this endpoint immediately after authentication.
2. Stop the job if root is `NO_PERMISSION`.
3. Run in safe test mode if `isSandbox` is true.
4. Use `setting.qpsLimit` to configure request throttling.
5. Log quota limits for monitoring.
6. Store callback settings for webhook planning.

Startup workflow:

```text
Get Access Token
      ↓
Get Settings
      ↓
Validate Account
      ↓
Check Sandbox Mode
      ↓
Check QPS Limits
      ↓
Start Product Discovery
```

## Product Discovery

These endpoints can support product search, product listing, category discovery, warehouse discovery, and product details.

Relevant endpoints:

```text
/product/getCategory
/product/listV2
/product/globalWarehouseList
/product/list
/product/query
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
5. Fetch global warehouse data.
6. Fetch product reviews or comments where available.

### Category List

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/getCategory
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Purpose:

1. Get all CJ product categories.
2. Build a CJ category cache.
3. Map CJ categories into our store categories: Pet, Home, Beauty.
4. Use third level category IDs for product filtering.

Response structure:

```text
categoryFirstName
categoryFirstList
categorySecondName
categorySecondList
categoryId
categoryName
```

Project usage:

1. Fetch categories during setup.
2. Store first, second, and third level category names.
3. Classify categories into Pet, Home, or Beauty.
4. Use category IDs in `/product/listV2` searches.

### Product List V2

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/listV2
```

Example:

```text
GET /product/listV2?page=1&size=20&keyWord=hoodie
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Purpose:

1. Main product discovery endpoint.
2. Supports keyword search.
3. Supports price, category, country, inventory, warehouse, and product type filters.
4. Supports sorting.
5. Supports optional product details, category information, combine product information, and video IDs through `features`.

Pagination rules:

```text
page minimum: 1
page maximum: 1000
size minimum: 1
size maximum: 100
maximum total records returned: 6000
```

Key request parameters:

```text
keyWord - product name or SKU keyword
page - page number
size - results per page
categoryId - third level category ID
lv2categoryList - second level category IDs
lv3categoryList - third level category IDs
countryCode - inventory country code such as CN, US, GB, FR
startSellPrice - minimum sell price
endSellPrice - maximum sell price
addMarkStatus - 0 not free shipping, 1 free shipping
productType - 4 supplier product, 10 video product, 11 non video product
productFlag - 0 trending, 1 new, 2 video, 3 slow moving
startWarehouseInventory - minimum warehouse inventory
endWarehouseInventory - maximum warehouse inventory
verifiedWarehouse - null or 0 all, 1 verified inventory, 2 unverified inventory
timeStart - listing start timestamp in milliseconds
timeEnd - listing end timestamp in milliseconds
zonePlatform - shopify, ebay, amazon, tiktok, etsy, etc.
isWarehouse - global warehouse search true or false
sort - desc or asc
orderBy - 0 best match, 1 listing count, 2 sell price, 3 create time, 4 inventory
features - enable_description, enable_category, enable_combine, enable_video
supplierId - supplier ID
hasCertification - 0 no, 1 yes
isSelfPickup - 0 no, 1 yes
customization - 0 no, 1 yes
```

Important response fields:

```text
pageSize
pageNumber
totalRecords
totalPages
content.productList
content.relatedCategoryList
content.keyWord
content.keyWordOld
```

Important product fields:

```text
id
nameEn
sku
spu
bigImage
sellPrice
nowPrice
discountPrice
discountPriceRate
listedNum
categoryId
threeCategoryName
twoCategoryId
twoCategoryName
oneCategoryId
oneCategoryName
addMarkStatus
isVideo
videoList
productType
supplierName
createAt
warehouseInventoryNum
totalVerifiedInventory
totalUnVerifiedInventory
verifiedWarehouse
customization
hasCECertification
isCollect
myProduct
description
deliveryCycle
saleStatus
authorityStatus
isPersonalized
```

Ranking signals from Product List V2:

```text
sellPrice
nowPrice
discountPrice
listedNum
addMarkStatus
isVideo
createAt
warehouseInventoryNum
totalVerifiedInventory
totalUnVerifiedInventory
verifiedWarehouse
hasCECertification
description
deliveryCycle
saleStatus
authorityStatus
```

Recommended initial filters for Shopify discovery:

```text
zonePlatform=shopify
countryCode=US
verifiedWarehouse=1
startWarehouseInventory=50
features=enable_description,enable_category
orderBy=1
sort=desc
size=50
```

Project usage:

1. Search by category keywords for Pet, Home, and Beauty.
2. Search by CJ category IDs once mappings are available.
3. Prefer products with verified inventory.
4. Prefer products with enough stock.
5. Prefer products with good listing count but not excessive competition.
6. Pull descriptions and categories when needed for scoring.
7. Send top candidates into Product Details for enrichment.

### Global Warehouse List

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/globalWarehouseList
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Request parameters:

```text
None
```

Purpose:

1. Get available global warehouses.
2. Identify warehouses by country.
3. Prefer warehouses closer to the target market.
4. Improve shipping speed scoring.

Important response fields:

```text
areaCn
areaEn
areaId
countryCode
nameEn
valueEn
disabled
zh
en
de
fr
th
id
```

Project usage:

1. Cache available warehouses.
2. Prefer United States warehouse for US targeting.
3. Avoid disabled warehouses.
4. Use country codes for product search and inventory filters.

### Product List

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/list
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Purpose:

1. Legacy product search endpoint.
2. Useful fallback if Product List V2 is unavailable.
3. Supports broad product search with up to 200 results per page.

Notes:

```text
Maximum 200 data per page.
Free users or v1 users may be limited to 1000 requests per day.
One IP may be limited to a maximum of three users.
deliveryTime field can be 24, 48, 72, or null.
```

Key request parameters:

```text
pageNum
pageSize
categoryId
pid
productSku
productName
productNameEn
productType
countryCode
deliveryTime
verifiedWarehouse
startInventory
endInventory
createTimeFrom
createTimeTo
brandOpenId
minPrice
maxPrice
searchType
minListedNum
maxListedNum
sort
orderBy
isSelfPickup
supplierId
isFreeShipping
customizationVersion
```

Important response fields:

```text
pageNum
pageSize
total
list
pid
productName
productNameEn
productSku
productImage
productWeight
productType
productUnit
sellPrice
categoryId
categoryName
remark
createTime
customizationVersion
isFreeShipping
listedNum
supplierName
supplierId
isVideo
saleStatus
```

Ranking signals from Product List:

```text
sellPrice
isFreeShipping
listedNum
supplierName
supplierId
isVideo
saleStatus
productWeight
categoryName
```

Project usage:

1. Use as a fallback search endpoint.
2. Use for compatibility with older CJ product search behavior.
3. Compare results against Product List V2 if needed.

### Product Details

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/query
```

Example:

```text
GET /product/query?pid=000B9312-456A-4D31-94BD-B083E2A198E8
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Purpose:

1. Fetch full product details for selected candidates.
2. Get product images, description, variants, materials, packaging, logistics attributes, and supplier data.
3. Prepare Shopify product drafts.
4. Improve scoring after initial discovery.

Request parameters:

```text
pid - product ID, choose one of pid, productSku, variantSku
productSku - product SKU, choose one of pid, productSku, variantSku
variantSku - variant SKU, choose one of pid, productSku, variantSku
features - enable_combine, enable_video
countryCode - optional inventory country filter such as CN or US
```

Important product fields:

```text
pid
productName
productNameEn
productSku
bigImage
productImageSet
productWeight
productUnit
productType
categoryId
categoryName
entryCode
entryName
entryNameEn
materialName
materialNameEn
materialKey
packingWeight
packingName
packingNameEn
packingKey
productKey
productKeyEn
productPro
productProSet
productProEn
productProEnSet
sellPrice
description
suggestSellPrice
listedNum
status
supplierName
supplierId
customizationVersion
customizationJson1
customizationJson2
customizationJson3
customizationJson4
variants
createrTime
```

Important variant fields:

```text
vid
pid
variantName
variantNameEn
variantSku
variantUnit
variantKey
variantLength
variantWidth
variantHeight
variantVolume
variantWeight
variantSellPrice
createTime
variantStandard
variantSugSellPrice
combineVariants
inventories
```

Important inventory fields inside variants:

```text
countryCode
totalInventory
cjInventory
factoryInventory
verifiedWarehouse
stock.stockId
stock.inventory
stock.factoryInventory
```

Shopify publishing fields from Product Details:

```text
productNameEn -> Shopify title
productImageSet -> Shopify images
description -> Shopify body_html
categoryName -> Shopify product type or tags
variants -> Shopify variants
variantSku -> Shopify SKU
variantSellPrice -> cost and pricing input
suggestSellPrice -> pricing guidance
productWeight or packingWeight -> shipping weight
productProEnSet -> logistics risk tags
```

Project usage:

1. Call only after a product passes initial ranking.
2. Use product images and description to build a Shopify draft.
3. Use variants to build Shopify variants.
4. Use inventory by country to verify sellability.
5. Use logistics attributes to avoid risky items.

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

## Current Store Categories

```text
Pet
Home
Beauty
```

## Ranking Model Draft

Each product should receive a dropshipping score from 0 to 100.

Suggested scoring factors:

```text
Profit margin: 25 points
Shipping cost: 15 points
Shipping time: 15 points
Inventory availability: 15 points
Product demand or listed count: 10 points
Listing quality: 10 points
Category fit: 10 points
```

Initial formula:

```text
Dropshipping Score = Margin Score + Shipping Cost Score + Shipping Time Score + Inventory Score + Demand Score + Listing Quality Score + Category Fit Score
```

Product decision rules:

```text
Score 85 to 100: Strong winner, add to store
Score 70 to 84: Good candidate, review manually
Score 50 to 69: Weak candidate, save for later
Score below 50: Reject
```

## Recommended Development Phases

### Phase 1: Safe Setup

1. Add environment variable support.
2. Add CJ API client wrapper.
3. Add token refresh handling.
4. Add settings validation.
5. Add basic logging.
6. Add a safe `.env.example` file without secrets.

### Phase 2: Product Pull

1. Fetch categories from CJ.
2. Fetch warehouses from CJ.
3. Fetch products from Product List V2.
4. Fetch product details for top candidates.
5. Store normalized product data locally.

### Phase 3: Scoring Engine

1. Calculate margin.
2. Calculate shipping score.
3. Calculate stock score.
4. Calculate listing quality score.
5. Calculate category fit.
6. Return ranked products.

### Phase 4: Store Publishing

1. Match products to Pet, Home, or Beauty.
2. Prepare product title, description, images, variants, and price.
3. Publish selected products to Shopify through Shopify Admin API.
4. Track which products were already listed.

### Phase 5: Automation

1. Run product discovery on a schedule.
2. Save top ranked products.
3. Notify before publishing or auto publish based on score.
4. Monitor stock and shipping changes.

## Security Notes

Never commit API keys, access tokens, refresh tokens, Shopify tokens, or customer data.

Use `.env` locally and keep it ignored by Git.

Recommended ignored files:

```text
.env
.env.local
```
