# CJ Storage API

This document covers the CJ Storage APIs used for warehouse details, private inventory, inventory movement history, and warehouse order pictures.

These endpoints are useful for inventory validation, warehouse selection, fulfillment monitoring, dispute support, and private inventory automation.

## Storage Info

### Get Storage Info

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/warehouse/detail
```

Example:

```text
GET /warehouse/detail?id=201e67f6ba4644c0a36d63bf4989dd70
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Request parameters:

```text
id - Storage ID, required
```

Purpose:

1. Retrieve warehouse details.
2. Get warehouse address and contact information.
3. Discover supported logistics carriers.
4. Validate warehouse availability.
5. Support warehouse selection for fulfillment.

Important response fields:

```text
id
name
areaId
areaCountryCode
address1
address2
contacts
phone
city
province
logisticsBrandList
isSelfPickup
zipCode
```

Logistics brand fields:

```text
logisticsBrandList.id
logisticsBrandList.name
```

Example supported carrier IDs:

```text
USPS
FedEx
UPS
GOFO
DHL
UniUni
CBT
```

Project usage:

1. Validate the selected warehouse before connecting products.
2. Prefer warehouses in the target country.
3. Use supported logistics brands when choosing fulfillment methods.
4. Store warehouse metadata for shipping and fulfillment decisions.

Common error:

```text
1608001 - Warehouse info not found
```

## Private Inventory

All private inventory APIs below query inventory data for the account bound to the current `CJ-Access-Token`. The server automatically binds the current user, so `userId` is not required in the request body.

Private inventory is useful when products or SKUs are already stocked for the account and should be monitored separately from public CJ marketplace inventory.

### Query Private Inventory SPU Page

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/stock/privateInventory/querySpuPage
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "keyword": "shirt",
  "availableStock": true,
  "productId": "1234567890",
  "sku": "CJNS000000101AZ",
  "sortField": "totalWarehouseQuantity",
  "sortType": "desc"
}
```

Request parameters:

```text
pageNum - page number, default 1
pageSize - page size, default 20
keyword - fuzzy search by product name, SPU, or SKU
availableStock - true means only products with available stock
pack - true means packaging product
serviceProd - true means service product
pod - true means POD product
productId - CJ product ID
sku - product SKU
sortField - sort field such as totalWarehouseQuantity or minStockPrice
sortType - asc or desc
```

Important response fields:

```text
pageSize
pageNumber
totalRecords
totalPages
content.productId
content.productName
content.spu
content.productPic
content.productType
content.skuQuantity
content.totalWarehouseQuantity
content.minStockPrice
content.maxStockPrice
content.warehouseQuantityInfoList
```

Warehouse quantity fields:

```text
countryCode
warehouseQuantity
clientTransitQuantity
```

Project usage:

1. List private inventory products.
2. Monitor total stocked quantity.
3. Identify stocked products available for Shopify sale.
4. Use `minStockPrice` and `maxStockPrice` for cost analysis.
5. Feed private inventory availability into product ranking.

Ranking signals:

```text
totalWarehouseQuantity
warehouseQuantity
clientTransitQuantity
minStockPrice
maxStockPrice
```

### Query Private Inventory SKU List By Product ID

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/stock/privateInventory/querySkuListByProductId
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "productId": "1234567890",
  "keyword": "black",
  "variantId": "9876543210"
}
```

Request parameters:

```text
productId - CJ product ID, required
keyword - fuzzy search by SKU or specification
variantId - CJ variant ID
```

Important response fields:

```text
merchantId
productId
variantId
sku
productName
variantKey
variantValue1
variantValue2
variantValue3
bigImage
minStockPrice
maxStockPrice
warehouseQuantityInfoList
```

Project usage:

1. Retrieve all private inventory SKU variants for a product.
2. Map variant IDs and SKUs to Shopify variants.
3. Analyze variant level cost and inventory.
4. Select only variants with strong stock availability.

### Query Private Inventory SKU Detail Page

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/stock/privateInventory/querySkuDetailPage
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "sku": "CJNS000000101AZ",
  "productId": "1234567890",
  "storageIds": ["US"],
  "availableStock": true
}
```

Request parameters:

```text
pageNum - page number, default 1
pageSize - page size, default 20
sku - SKU
productId - product ID
keyword - fuzzy search by SKU or product name
orderCode - stock order code of private inventory
storageIds - warehouse ID list, such as CN or US
availableStock - true means only SKUs with available stock
pack - true means packaging product
serviceProd - true means service product
pod - true means POD product
skuList - exact query by multiple SKUs
```

Important response fields:

```text
pageSize
pageNumber
totalRecords
totalPages
content.merchantId
content.sku
content.variantId
content.productId
content.productName
content.storageId
content.clientTransitQuantity
content.clientAvailableQuantity
content.clientLockQuantity
content.clientUseQuantity
content.clientDisputeQuantity
content.clientDisputeCompleteQuantity
content.clientFreezeQuantity
content.variantKey
content.bigImage
```

Inventory dimensions:

```text
clientTransitQuantity - in transit inventory
clientAvailableQuantity - available sellable inventory
clientLockQuantity - locked or reserved inventory
clientUseQuantity - used inventory
clientDisputeQuantity - disputed inventory
clientDisputeCompleteQuantity - completed dispute inventory
clientFreezeQuantity - frozen inventory
```

Project usage:

1. Inspect private SKU inventory deeply.
2. Check warehouse level sellable stock.
3. Avoid publishing variants with no available quantity.
4. Detect locked, frozen, or disputed stock.
5. Build inventory health reports.

### Query Private Inventory Batch Detail By SKU

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/stock/privateInventory/querySkuDetailListBySku
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "sku": "CJNS000000101AZ",
  "orderCode": "SY230101000001",
  "storageIds": ["US"],
  "availableStock": true
}
```

Request parameters:

```text
sku - SKU, required
keyword - fuzzy search
orderCode - stock order code of private inventory
storageIds - warehouse ID list, such as CN or US
availableStock - true means only batches with available stock
```

Important response fields:

```text
merchantId
sku
orderCode
storage
storageId
unitPrice
productId
orderQuantity
clientTransitQuantity
clientAvailableQuantity
clientLockQuantity
clientUseQuantity
clientDisputeQuantity
clientDisputeCompleteQuantity
clientFreezeQuantity
```

Project usage:

1. Track inventory batches by SKU.
2. Support inventory cost analysis.
3. Monitor inventory tied to stock order codes.
4. Separate available stock from locked, used, disputed, and frozen stock.

### Query Private Inventory SKU Flow Page

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/product/stock/privateInventory/querySkuFlowByCondition
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "sku": "CJNS000000101AZ",
  "orderCode": "SY230101000001",
  "eventOrderCode": "ORDER230101000001",
  "storageId": "US",
  "recordId": "REC123456",
  "clientVisible": 1
}
```

Request parameters:

```text
pageNum - page number, default 1
pageSize - page size, default 20
sku - SKU to query flow for
orderCode - source stock order code of private inventory
eventOrderCode - business order code that caused the inventory change
storageId - warehouse ID, such as CN or US
unitPrice - inventory unit price, subject to API return unit
recordId - exact query by flow record
clientVisible - 1 visible, 0 invisible
```

Important response fields:

```text
clientRecordId
eventDesc
changeQuantity
createDate
eventOrderCode
eventOrderCodeType
clientVisible
orderCode
storage
storageId
unitPrice
clientTransitQuantity
clientAvailableQuantity
clientLockQuantity
clientUseQuantity
clientDisputeQuantity
clientDisputeCompleteQuantity
clientFreezeQuantity
clientTransitChangeQuantity
clientAvailableChangeQuantity
clientLockChangeQuantity
clientUseChangeQuantity
clientDisputeChangeQuantity
clientDisputeChangeCompleteQuantity
clientFreezeChangeQuantity
skuDetailInfo
```

Project usage:

1. Build inventory movement audit trails.
2. Track stock increases and decreases.
3. Reconcile Shopify sales against CJ inventory movement.
4. Investigate disputes and frozen inventory events.
5. Build private inventory analytics.

### Query Warehouse Order Pictures

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/storehouseCenterWeb/syncStorehouseVideoRequests
```

Headers:

```text
CJ-Access-Token: <access_token>
Content-Type: application/json
```

Example request:

```json
{
  "orderIdList": ["ORDER001", "ORDER002"]
}
```

Request parameters:

```text
orderIdList - order ID list, required
```

Important response fields:

```text
orderId
pictureJson
pictureJson.url
pictureJson.type
```

Purpose:

1. Query photos of orders being processed in the warehouse.
2. Support fulfillment verification.
3. Support dispute investigation.
4. Provide customer support evidence when appropriate.

Project usage:

1. Pull warehouse processing pictures for order audit trails.
2. Attach fulfillment evidence to internal support records.
3. Help resolve shipping or packing disputes.
4. Avoid exposing warehouse images publicly without review.

## Storage Automation Opportunities

These APIs can support:

```text
Private inventory monitoring
Warehouse inventory dashboards
Inventory valuation reporting
Inventory movement analytics
Stock depletion alerts
Warehouse performance reporting
Fulfillment audit system
Order evidence collection
Inventory reconciliation workflows
```

## Ranking and Shopify Impact

Private inventory can improve scoring because it gives stronger stock confidence than public marketplace inventory.

Recommended scoring usage:

```text
Available private inventory in target country: strong positive signal
High frozen inventory: negative signal
High dispute inventory: negative signal
High in transit inventory: neutral to positive depending on ETA
Low or no available quantity: reject or manual review
```

Recommended Shopify publishing rule:

```text
Only publish variants where clientAvailableQuantity is above the configured minimum stock threshold.
```
