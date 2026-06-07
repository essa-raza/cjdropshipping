# CJ Product Endpoints Continued

This document continues the CJ Product API specification captured for the project. These endpoints support My Products, variants, inventory, reviews, sourcing, product connections, and videos.

## Add to My Product

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/addToMyProduct
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Request:

```json
{
  "productId": "1658748072937136128"
}
```

Parameter:

```text
productId - CJ product ID, required
```

Purpose:

1. Add selected CJ products to the account's My Products list.
2. Save winning products before listing or connecting to Shopify.
3. Avoid duplicate adds by handling the existing product error message.

Project usage:

1. Call after a product passes ranking and manual or automatic approval.
2. Treat already added products as non fatal.
3. Use My Product List later to verify saved products.

## My Product List

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query
```

Example:

```text
GET /product/myProduct/query?keyword=CJWJWJYZ02543
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Request parameters:

```text
keyword - SKU, SPU, or product name
categoryId - category ID
startAt - start time
endAt - end time
isListed - listing status
visiable - visibility filter
hasPacked - packing status
hasVirPacked - virtual packing status
```

Important response fields:

```text
productId
packWeight
weight
productType
propertyKeyList
bigImage
nameEn
sku
hasPacked
sellPrice
discountPrice
discountPriceRate
defaultArea
shopMethod
trialFreight
totalPrice
listedShopNum
vid
areaId
areaCountryCode
freightDiscount
createAt
lengthList
heightList
widthList
volumeList
hasVirPacked
```

Project usage:

1. Check whether a product is already in My Products.
2. Track product add status.
3. Compare total price and trial freight before Shopify publishing.
4. Avoid duplicate Shopify listing attempts.

## Variants

### Inquiry Of All Variants

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/variant/query
```

Example:

```text
GET /product/variant/query?pid=00006BC5-E1F5-4C65-BE2B-3FE0956DA21C
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Request parameters:

```text
pid - product ID, choose one of pid, productSku, variantSku
productSku - product SKU, choose one of pid, productSku, variantSku
variantSku - variant SKU, choose one of pid, productSku, variantSku
countryCode - optional country filter. If provided, only variants with inventory in that country return.
```

Important response fields:

```text
vid
pid
variantName
variantNameEn
variantImage
variantSku
variantStandard
variantUnit
variantProperty
variantKey
variantLength
variantWidth
variantHeight
variantVolume
variantWeight
variantSellPrice
variantSugSellPrice
createTime
```

Project usage:

1. Fetch all variants for a shortlisted product.
2. Build Shopify variants.
3. Use variant weight and dimensions for shipping calculations.
4. Use variant sell price for margin calculation.

### Variant Id Inquiry

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/variant/queryByVid
```

Example:

```text
GET /product/variant/queryByVid?vid=1371342252697325568
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Request parameters:

```text
vid - variant ID, required
features - optional. Use enable_inventory to include inventory and storage ID information.
```

Important response fields:

```text
vid
pid
variantName
variantNameEn
variantImage
variantSku
variantUnit
variantKey
variantLength
variantWidth
variantHeight
variantVolume
variantWeight
variantSellPrice
variantStandard
createTime
inventories
```

Inventory fields:

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

Project usage:

1. Validate a specific variant before publishing.
2. Pull inventory for selected variants.
3. Prefer variants with verified inventory.
4. Exclude variants with low or missing inventory.

## Inventory

### Inventory Inquiry By Variant ID

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryByVid
```

Example:

```text
GET /product/stock/queryByVid?vid=7874B45D-E971-4DC8-8F59-40530B0F6B77
```

Request parameter:

```text
vid - variant ID, required
```

Important response fields:

```text
vid
areaId
areaEn
countryCode
storageNum
totalInventoryNum
cjInventoryNum
factoryInventoryNum
stock.stockId
stock.inventory
stock.factoryInventory
```

Project usage:

1. Score variant inventory strength.
2. Prefer CJ managed inventory over factory inventory where possible.
3. Prefer target country warehouse inventory.
4. Use total inventory to prevent publishing weak stock variants.

### Query Inventory by SKU

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryBySku
```

Example:

```text
GET /product/stock/queryBySku?sku=CJDS2012593
```

Request parameter:

```text
sku - SKU or SPU, required
```

Important response fields:

```text
areaEn
areaId
countryCode
countryNameEn
totalInventoryNum
cjInventoryNum
factoryInventoryNum
stock
```

Project usage:

1. Quickly check inventory by product or variant SKU.
2. Confirm target market inventory, such as US Warehouse.
3. Use as fallback when variant ID is not available.

### Query Inventory by Product ID

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/stock/getInventoryByPid
```

Example:

```text
GET /product/stock/getInventoryByPid?pid=1444929719182168064
```

Request parameter:

```text
pid - product ID, required
```

Important response fields:

```text
inventories
variantInventories
```

Product inventory fields:

```text
areaEn
areaId
countryCode
totalInventoryNum
cjInventoryNum
factoryInventoryNum
countryNameEn
stock
```

Variant inventory fields:

```text
vid
inventory.countryCode
inventory.totalInventory
inventory.cjInventory
inventory.factoryInventory
inventory.verifiedWarehouse
inventory.stock.stockId
inventory.stock.inventory
inventory.stock.factoryInventory
```

Project usage:

1. Validate product level inventory before publishing.
2. Validate each variant inventory.
3. Avoid publishing products with no target market stock.
4. Feed inventory availability score.

## Product Reviews

### Deprecated Inquiry Reviews

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/comments
```

Note:

```text
This endpoint is deprecated. Use /product/productComments instead.
```

### Inquiry Reviews

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/productComments
```

Example:

```text
GET /product/productComments?pid=7874B45D-E971-4DC8-8F59-40530B0F6B77
```

Request parameters:

```text
pid - product ID, required
score - optional score filter
pageNum - page number, default 1
pageSize - page size, default 20
```

Important response fields:

```text
pageNum
pageSize
total
list.commentId
list.pid
list.comment
list.commentDate
list.commentUser
list.score
list.commentUrls
list.countryCode
list.flagIconUrl
```

Project usage:

1. Use total review count as demand and trust signal.
2. Use score distribution as quality signal.
3. Use review images as listing quality indicator.
4. Do not publish customer review content directly without checking rights and platform policy.

## Sourcing

### Create Sourcing

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/create
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Request body:

```json
{
  "thirdProductId": "",
  "thirdVariantId": "",
  "thirdProductSku": "",
  "productName": "",
  "productImage": "",
  "productUrl": "",
  "remark": "",
  "price": ""
}
```

Required fields:

```text
productName
productImage
```

Optional fields:

```text
thirdProductId
thirdVariantId
thirdProductSku
productUrl
remark
price
```

Successful response fields:

```text
cjSourcingId
result
requestId
```

Project usage:

1. Create sourcing requests for products found outside CJ.
2. Track sourcing result before Shopify publishing.
3. Only publish successfully sourced items when CJ product and variant IDs are available.

### Query Sourcing

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/query
```

Request body:

```json
{
  "sourceIds": []
}
```

Request parameter:

```text
sourceIds - CJ sourcing ID list, required
```

Important response fields:

```text
sourceId
sourceNumber
productId
variantId
shopId
shopName
sourceStatus
sourceStatusStr
cjProductId
cjVariantSku
```

Project usage:

1. Check sourcing status.
2. Match completed sourcing to CJ product and variant IDs.
3. Reject failed sourcing results.
4. Continue ranking when sourcing succeeds.

## Product Type Reference

```text
ORDINARY_PRODUCT - 0 - ordinary product managed by CJ inventory
SERVICE_PRODUCT - 1 - service product for warehousing services
PACKAGING_PRODUCT - 3 - packaging product, shipped with other goods only
SUPPLIER_PRODUCT - 4 - supplier product with merchant inventory collaboration
SUPPLIER_SHIPPED_PRODUCT - 5 - supplier product managed and shipped by supplier
```

## Product Status Reference

```text
3 - On Sale
```

## Customization Version Reference

```text
0 - Non POD products
1 - Platform Customized Version V1
2 - Platform Customized Version V2
3 - Customer Customized Version V1
4 - Customer Customized Version V2
5 - POD 3.0 Platform Customized
```

## Product Connection

Product Connection binds a CJ product or variant to a platform shop product or variant. Once bound, orders placed on Shopify can be automatically matched to the corresponding CJ product for fulfillment.

### Query Product Connection List

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/product/conn/connection
```

Example:

```text
GET /product/conn/connection?shopId=xxx&platformProductId=yyy&page=1&pageSize=10
```

Request parameters:

```text
shopId - optional shop ID. If omitted, the API bound shop is used.
platformProductId - optional platform product ID
platformVariantId - optional platform variant ID
page - default 1
pageSize - default 10, max 100
```

Important response fields:

```text
total
list.shopId
list.platformProductId
list.platformVariantId
list.cjProductId
list.cjVariantId
list.defaultArea
list.logistics
list.sourceCountryCode
list.sourceCountry
list.targetCountryCode
list.targetCountry
```

Project usage:

1. Check whether a Shopify product is already connected to CJ.
2. Avoid duplicate product connections.
3. Audit CJ to Shopify fulfillment mappings.

### Create Product Connection

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/conn/connection
```

Request body:

```json
{
  "shopId": "xxx",
  "defaultArea": 1,
  "logistics": "PacketPlus",
  "cjProductId": "1424608189734850560",
  "platformProductId": "yyy",
  "sourceCountryCode": "CN",
  "sourceCountry": "China",
  "targetCountryCode": "US",
  "targetCountry": "United States",
  "variantList": [
    {
      "cjVariantId": "1424608152007086080",
      "platformVariantId": "v_001"
    }
  ]
}
```

Required fields:

```text
defaultArea
logistics
cjProductId
platformProductId
variantList
variantList.cjVariantId
variantList.platformVariantId
```

Optional fields:

```text
shopId
sourceCountryCode
sourceCountry
targetCountryCode
targetCountry
```

Project usage:

1. After creating a Shopify product, bind Shopify variant IDs to CJ variant IDs.
2. Store the selected logistics method and warehouse area.
3. Enable CJ fulfillment matching for Shopify orders.

### Disconnect Product

Endpoint:

```text
DELETE https://developers.cjdropshipping.com/api2.0/v1/product/conn/connection
```

Example:

```text
DELETE /product/conn/connection?shopId=xxx&platformProductId=yyy&platformVariantId=zzz
```

Request parameters:

```text
shopId - optional shop ID. If omitted, the API bound shop is used.
platformProductId - required platform product ID
platformVariantId - optional platform variant ID. If empty, all variant connections under the product are removed.
```

Project usage:

1. Remove broken CJ to Shopify connections.
2. Disconnect products that are no longer profitable or no longer sellable.
3. Support cleanup automation.

## Product Videos

### Query Product Videos

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/queryVideosByProductId
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Request body:

```json
{
  "productId": "1658748072937136128"
}
```

Important usage notes:

```text
Cache videos on our own servers instead of using CJ video URLs directly for end users.
When downloading videos, include Referer: https://developers.cjdropshipping.com/
Direct heavy use of CJ playback URLs may be rate limited.
```

Important response fields:

```text
id
locProductId
videoName
videoState
videoUrl
videoNumber
notCopyrightPrice
copyrightPrice
copyright
isFree
videoId
videoSize
coverURL
duration
unit
flag
isBuy
payType
playCount
collectCount
downloadCount
showCount
shareNum
likeNum
commentCount
buyCount
videoType
copyrightBuyType
orderNum
videoByOut
width
height
openIn
```

Video state values:

```text
ON_STATE - listed
DOWN_STATE - unlisted
DELETE_STATE - deleted
```

Video type values:

```text
0 - unboxing
1 - marketing
2 - review
```

Project usage:

1. Use video availability as a listing quality score signal.
2. Prefer free or already purchased videos.
3. Use cover image and video metadata for product media planning.
4. Avoid embedding CJ video URLs directly on Shopify until rights and caching are handled.
