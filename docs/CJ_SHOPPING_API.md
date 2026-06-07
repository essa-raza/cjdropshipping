# CJ Shopping API

This document covers CJ Shopping APIs for order creation, cart workflow, payment, shipping info, COGS, merge orders, address management, private inventory ordering, private inventory outbound orders, and makeup or supplement payments.

These APIs are mainly used after products are selected and published, when Shopify orders need to be created, paid, fulfilled, tracked, merged, or audited through CJ.

## Order Workflow Overview

The Shopping API supports multiple order creation and payment flows.

Recommended regular dropshipping order flow:

```text
Shopify Order
      ↓
Create CJ Order V3 or V2
      ↓
Confirm Order or Add Cart Flow
      ↓
Pay by Balance or Page Payment
      ↓
Track Order Status
      ↓
Update Shopify Fulfillment
```

Recommended private inventory order flow:

```text
Select Private Inventory Products
      ↓
Confirm Warehouse, Logistics, and Cost
      ↓
Create Private Inventory Order
      ↓
Pay by Balance or Page Payment
      ↓
Query Private Inventory Order List
```

## 1. Orders

### 1.1 Create Order V2

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2
```

Headers:

```text
CJ-Access-Token: <access_token>
platformToken: <platform_token_optional>
Content-Type: application/json
```

Payment behavior:

```text
payType omitted or 1 - page payment, cjPayUrl returned
payType 2 - balance payment, continues through add to cart, confirmation, and balance deduction
payType 3 - create order only, no payment, no cart, no confirmation
```

Important notes:

```text
platformToken is optional if not required.
platform should be shopify for Shopify orders.
orderFlow 1 uses CJ variants.
orderFlow 2 uses store SKUs and requires store product linked to CJ products in My CJ.
```

Required core request fields:

```text
orderNumber
shippingCountryCode
shippingCountry
shippingProvince
shippingCity
shippingCustomerName
shippingAddress
logisticName
fromCountryCode
products
products[].quantity
```

Important optional request fields:

```text
shippingZip
shippingCounty
shippingPhone
shippingAddress2
houseNumber
email
taxId
remark
consigneeID
payType
isSandbox
shopAmount
platform
shopLogisticsType
storageId
iossType
iossNumber
storeName
storeOrderTime
orderFlow
products[].vid
products[].sku
products[].unitPrice
products[].storeLineItemId
products[].podProperties
```

Product line rules:

```text
vid and sku cannot both be null.
If both vid and sku are provided, they must refer to the same CJ variant.
quantity is required.
storeLineItemId should store the Shopify line item ID.
```

Important response fields:

```text
orderNumber
orderId
shipmentOrderId
iossAmount
iossTaxHandlingFee
postageAmount
productAmount
productOriginalAmount
productDiscountAmount
postageDiscountAmount
postageOriginalAmount
totalDiscountAmount
actualPayment
orderOriginalAmount
cjPayUrl
orderAmount
logisticsMiss
productInfoList
orderStatus
interceptOrderReasons
requestId
```

Product info response fields:

```text
storeLineItemId
lineItemId
variantId
quantity
isGroup
subOrderProducts
```

Project usage:

1. Use to create CJ fulfillment orders from Shopify orders.
2. Store Shopify `orderNumber` and `storeLineItemId` for mapping.
3. Use `orderId`, `shipmentOrderId`, and `cjPayUrl` to continue payment workflow.
4. Store `interceptOrderReasons` for manual review.
5. Prefer V3 if available and stable.

### 1.2 Create Order V3

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3
```

Headers:

```text
CJ-Access-Token: <access_token>
platformToken: <platform_token_optional>
Content-Type: application/json
```

Purpose:

1. Create CJ orders with updated logistics and sandbox support.
2. Support Shopify order flow.
3. Support platform logistics, merchant logistics, and CJ assigned warehouse logistics.
4. Support sandbox orders without real charges or fulfillment.

Important request fields:

```text
orderNumber
shippingZip
shippingCountryCode
shippingCountry
shippingProvince
shippingCity
shippingCounty
shippingPhone
shippingCustomerName
shippingAddress
shippingAddress2
houseNumber
email
taxId
remark
consigneeID
shopAmount
logisticName
fromCountryCode
platform
iossType
iossNumber
shopLogisticsType
storageId
storeName
storeOrderTime
orderFlow
isSandbox
products
```

Shipping mode values:

```text
shopLogisticsType 1 - Platform Logistics, storageId specified by us
shopLogisticsType 2 - Seller or merchant logistics, storageId not used
shopLogisticsType 3 - Platform Logistics, storageId specified by CJ
```

IOSS type values:

```text
1 - no IOSS
2 - use own IOSS
3 - use CJ IOSS, CJ-IOSS fixed when used
```

Sandbox behavior:

```text
isSandbox 0 - normal order
isSandbox 1 - sandbox order using simulated payment, no real charges, logistics, or fulfillment
```

Project usage:

1. Main target endpoint for Shopify order creation.
2. Use `platform=shopify`.
3. Use `orderFlow=2` when Shopify SKUs are connected to CJ products.
4. Use sandbox mode for testing order creation and fulfillment flow.
5. Use `storageId` when platform logistics mode requires a selected CJ warehouse.

### 1.3 Add Cart

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCart
```

Request:

```json
{
  "cjOrderIdList": ["SD25080109282603297001"]
}
```

Purpose:

1. Add CJ orders to cart.
2. Support the cart based confirmation flow.
3. Prepare orders for confirmation and payment.

Important response fields:

```text
successCount
addSuccessOrders
unInterceptAddressCount
interceptOrders
```

Project usage:

1. Optional helper when using CJ cart workflow.
2. Capture intercepted orders for review.
3. Prefer direct create and payment where possible for automation.

### 1.4 Add Cart Confirm

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCartConfirm
```

Request:

```json
{
  "cjOrderIdList": ["SD25080109282603297001"]
}
```

Important response fields:

```text
successCount
submitSuccess
shipmentsId
result
interceptOrders
```

Project usage:

1. Confirm orders in cart.
2. Obtain shipment parent order ID when applicable.
3. Detect intercepted orders before payment.

### 1.5 Save Generate Parent Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/saveGenerateParentOrder
```

Request:

```json
{
  "shipmentOrderId": "SD25080109282603297001"
}
```

Purpose:

1. Generate parent order information.
2. Return payment information.
3. Return order money, pay ID, and payment expiration.

Important response fields:

```text
orderMoney
payExpireTime
payId
result
submitSuccess
unMatchOrderCodes
successOrders
unMatchProductCodes
paymentInformation
interceptOrders
```

Payment information fields:

```text
actualPayment
balanceDeduction
billAmount
canDeduct
commodityDiscount
commodityTotalAmount
couponAmount
freight
iossAmount
iossNumber
iossTaxHandlingFee
iossTaxes
iossType
orderOriginalAmount
orderProductAmount
payableAmount
postageDiscount
serviceFee
```

Project usage:

1. Use when parent order payment details are required.
2. Capture pay ID for later balance payment.
3. Store unmatched orders and products for manual handling.

### 1.6 List Order

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/shopping/order/list
```

Example:

```text
GET /shopping/order/list?pageNum=1&pageSize=10
```

Request parameters:

```text
pageNum - default 1
pageSize - default 20
orderIds - optional order ID list
shipmentOrderId - optional shipment order ID
status - default CANCELLED. Values: CREATED, IN_CART, UNPAID, UNSHIPPED, SHIPPED, DELIVERED, CANCELLED, OTHER
```

Important response fields:

```text
orderId
orderNum
cjOrderId
shippingCountryCode
shippingProvince
shippingCity
shippingPhone
shippingAddress
shippingCustomerName
remark
orderWeight
orderStatus
orderAmount
productAmount
postageAmount
logisticName
trackNumber
trackingUrl
createDate
paymentDate
storeCreateDate
isSandbox
privateOutboundOrder
productList
storageId
storageName
```

Project usage:

1. Sync CJ order status back to Shopify.
2. Find tracking numbers.
3. Detect unpaid, unshipped, shipped, delivered, or cancelled orders.
4. Monitor sandbox test orders separately.

### 1.7 Query Order

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail
```

Example:

```text
GET /shopping/order/getOrderDetail?orderId=210711100018043276&features=LOGISTICS_TIMELINESS
```

Request parameters:

```text
orderId - required. Supports custom order ID or CJ order ID.
features - optional list. LOGISTICS_TIMELINESS returns logisticTimelines.
```

Important response fields:

```text
orderId
orderNum
platformOrderId
cjOrderId
cjOrderCode
fromCountryCode
shippingCountryCode
shippingProvince
shippingCity
shippingAddress
shippingCustomerName
shippingPhone
remark
logisticName
trackNumber
trackingUrl
disputeId
orderWeight
orderAmount
orderStatus
createDate
paymentDate
outWarehouseTime
storeCreateDate
productAmount
isComplete
isSandbox
storageId
storageName
privateOutboundOrder
productList
logisticsTimeliness
```

Product list fields:

```text
vid
quantity
sellPrice
storeLineItemId
lineItemId
productionOrderStatus
abnormalType
podPropertiesInfo
```

Production status values:

```text
1 - Pending Order
2 - Pending Production
3 - In Production
4 - Production Completed
5 - Production Abnormality
```

Abnormal reason values:

```text
6 - image link error
9 - production drawings do not match renderings
10 - missing hanging ring
11 - mismatch between die cutting diagram and printing diagram
12 - uneven edges
13 - letters not connected
14 - missing order images
```

Order detail errors:

```text
1600300 - order not found
1600300 - orderId must not be empty
1600300 - maximum number of features is 20
```

Project usage:

1. Fetch detailed CJ order status.
2. Sync tracking to Shopify.
3. Handle POD production issues.
4. Identify disputes or abnormal production status.
5. Read logistics timeliness when requested.

### 1.8 Order Delete

Endpoint:

```text
DELETE https://developers.cjdropshipping.com/api2.0/v1/shopping/order/deleteOrder
```

Example:

```text
DELETE /shopping/order/deleteOrder?orderId=210711100018655344
```

Request parameter:

```text
orderId - required
```

Project usage:

1. Delete incorrect CJ orders before fulfillment.
2. Support cleanup of test or failed orders.
3. Never delete paid or active fulfillment orders without approval.

### 1.9 Confirm Order

Endpoint:

```text
PATCH https://developers.cjdropshipping.com/api2.0/v1/shopping/order/confirmOrder
```

Request:

```json
{
  "orderId": "210711100018655344"
}
```

Purpose:

1. Confirm a CJ order before payment or fulfillment.
2. Move order to the next state in CJ flow.

Project usage:

1. Confirm manually reviewed orders.
2. Handle confirmation failures by storing request ID and error message.

### 1.10 Change Order Warehouse

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/changeWarehouse
```

Request:

```json
{
  "orderCode": "123",
  "storageId": "1234"
}
```

Purpose:

1. Change warehouse for platform logistics orders.
2. Reassign fulfillment when selected warehouse is not optimal.

Project usage:

1. Change warehouse before fulfillment where allowed.
2. Use only after checking warehouse detail and logistics support.

### 1.11 Sandbox Simulate Pay

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/sandbox/simulatePay
```

Request:

```json
{
  "orderId": "210711100018655344"
}
```

Request parameters:

```text
orderId - CJ order ID of sandbox order, either orderId or shipmentOrderId required
shipmentOrderId - parent order ID for batch simulated payment
```

Rules:

```text
Only supports sandbox orders created with isSandbox=1.
Simulates payment success only.
Does not generate real charges, logistics, or fulfillment.
For parent orders with multiple suborders, use shipmentOrderId instead of a single orderId.
```

Project usage:

1. Test payment flow without real charges.
2. Use in development and QA environments.
3. Never treat sandbox payment as real fulfillment.

### 1.12 Sandbox Update Status

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/sandbox/updateStatus
```

Request:

```json
{
  "orderId": "210711100018655344",
  "targetStatus": 400
}
```

Target status values:

```text
400 - unshipped
500 - shipped
600 - completed
700 - closed
```

Rules:

```text
Only supports sandbox orders created with isSandbox=1.
Status can only flow in order: 300 -> 400 -> 500 -> 600 -> 700.
Cannot skip or revert status.
Does not trigger real logistics or fulfillment.
```

Project usage:

1. Test Shopify order status sync.
2. Test tracking and delivery state transitions.
3. Use only in sandbox mode.

### Order Status Reference

```text
CREATED - order created, waiting confirmation
IN_CART - order in cart, waiting confirmation
UNPAID - confirmed order, CJ order number created
UNSHIPPED - paid and pending shipment
SHIPPED - shipped and in transit
DELIVERED - package delivered
CANCELLED - order cancelled
OTHER - other status
```

## 2. Payment

### 2.1 Get Balance

Endpoint:

```text
GET https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/getBalance
```

Headers:

```text
CJ-Access-Token: <access_token>
```

Important response fields:

```text
amount
noWithdrawalAmount
freezeAmount
```

Project usage:

1. Check CJ account balance before automated payment.
2. Stop automatic payment if balance is insufficient.
3. Monitor frozen funds separately.

### 2.2 Pay Balance

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalance
```

Request:

```json
{
  "orderId": "12"
}
```

Notes:

```text
Sandbox orders use fake simulated payment.
For parent orders with multiple suborders, use Pay Balance V2 with shipmentOrderId instead.
```

Project usage:

1. Pay a single CJ order by balance.
2. Prefer Pay Balance V2 for parent or batch orders.

### 2.3 Pay Balance V2

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalanceV2
```

Regular order request:

```json
{
  "shipmentOrderId": "12",
  "payId": "12"
}
```

Extended usage:

```text
orderType omitted - normal dropshipping order balance payment
orderType 9 - private inventory order
orderType 24 - makeup bill payment
```

Private inventory payment example:

```json
{
  "shipmentOrderId": "SY1234567890",
  "orderType": 9,
  "payId": "PAY1234567890"
}
```

Makeup bill payment example:

```json
{
  "shipmentOrderId": "2605260000000001",
  "orderType": 24,
  "payId": "PAY260526000001"
}
```

Project usage:

1. Primary balance payment endpoint.
2. Use for normal parent orders, private inventory orders, and makeup payments.
3. Use sandbox carefully where all suborders are sandbox orders.

## 3. Shipping Info

### 3.1 Upload Shipping Info

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/uploadWaybillInfo
```

Request format:

```text
multipart/form-data
```

Required form fields:

```text
orderId
cjOrderId
cjShippingCompanyName
trackNumber
waybillFile
```

Rules:

```text
Can only be called after CJ order payment.
cjShippingCompanyName should come from Get Storage Info logisticsBrandList.
```

Project usage:

1. Upload platform logistics waybill files.
2. Attach carrier and tracking details.
3. Validate carrier support before uploading.

Common error:

```text
806 - warehouse does not support logistics carrier
```

### 3.2 Update Shipping Info

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/updateWaybillInfo
```

Request format:

```text
multipart/form-data
```

Required form fields:

```text
orderId
cjOrderId
cjShippingCompanyName
trackNumber
waybillFile
```

Project usage:

1. Update waybill files and tracking details.
2. Use only for orders using store platform logistics.

Common error:

```text
804 - order does not use store platform logistics, label upload not supported
```

### 3.3 Update POD Pictures

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/podProductCustomPicturesEdit
```

Request:

```json
{
  "podPicturesEditParams": [
    {
      "orderCode": "123",
      "lineItemId": "111",
      "effectImgList": ["https://example.com/render.jpg"],
      "productionImgList": ["https://example.com/production.jpg"]
    }
  ]
}
```

Required fields:

```text
podPicturesEditParams
podPicturesEditParams[].orderCode
podPicturesEditParams[].lineItemId
podPicturesEditParams[].effectImgList
podPicturesEditParams[].productionImgList
```

Result values:

```text
0 - fail
1 - processing
2 - success
```

Project usage:

1. Update POD production images.
2. Fix POD order image problems.
3. Track failed updates by `failedMessage`.

## 4. COGS

### 4.1 Query COGS Basic Data Order Info

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/order/queryCogsBasicDataOrderInfoList
```

Request:

```json
{
  "orderCodesList": ["DP2506140734320969300"]
}
```

Important response fields:

```text
orderCode
originalOrderCode
paymentDate
userId
cogsBasicDataOrderInfoJson
```

COGS JSON compressed field mappings:

```text
a - shipmentsOrderId
s - merchantNumber
d - payFlag
f - postage
g - totalAmount
h - orderProductAmount
j - paymentDate
k - taxesInfo
z - productInfoMap
x - disputeInfoMap
c - diffAmountInfoMap
n - storeOrderInfo
m - isOutOfStockSplit
qq - isReissue
rr - outStockFee
tt - storeCostFee
yy - resendParcelFeeMap
uu - isReOrder
ii - store
oo - storeSkuProcessFlag
pp - countryCode
```

Product info compressed mappings:

```text
pc - productCode
q - groupProductCode
w - sku
e - isGroupMain
r - grams
t - price
y - quantity
u - productType
z - img
h - isGift
j - couponOrderProductAmount
n - headPostage
```

Project usage:

1. Build profit reporting.
2. Track true COGS by CJ order.
3. Compare Shopify revenue against product cost, postage, taxes, storage cost, and refunds.
4. Support financial analytics for winning products.

## 5. Merge Order

### 5.1 Auto Match Merge Order List

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/autoMatchMergeOrderListV3
```

Request:

```json
{
  "filterOrder": true,
  "orderStatus": 100
}
```

Order status values:

```text
100 - Complete order page
101 - Shopping cart page
```

Purpose:

1. Get automatically matched mergeable orders.
2. Find orders going to the same customer or address.
3. Preview logistics options and postage.

Important response fields:

```text
haveMoreShopOrder
mergeShopOrderVOList
city
country
countryCode
customerName
logisticsInfoList
logisticsName
postage
arrivalTime
isChecked
basePostage
packPrice
remoteAmount
```

### 5.2 Auto Merge Query Progress

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/autoMergeQueryProgress
```

Important response fields:

```text
noTask
step
stepCount
stepPercent
```

Project usage:

1. Poll asynchronous auto merge processing.
2. Treat `stepPercent` max as 10000.

### 5.3 Auto Merge Query Result

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/autoMergeQueryResult
```

Important response fields:

```text
haveMoreShopOrder
mergeShopOrderVOList
mergeOrderInfoList
orderCode
orderNumber
platform
shopName
phone
shippingAddress
logisticsInfoList
```

Project usage:

1. Review mergeable order groups.
2. Choose logistics before submitting merge.

### 5.4 Submit Merge Order Batch

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/submitMergeOrderBatchV3
```

Request:

```json
[
  {
    "logisticName": "PostNL",
    "orderCodeList": ["CJ123456789", "CJ987654321"],
    "orderNumber": "ORD123456",
    "orderStatus": 100,
    "packType": 0
  }
]
```

Required fields:

```text
logisticName
orderCodeList
orderNumber
orderStatus
packType
```

Pack type values:

```text
0 - SKU
1 - Store
```

Important response fields:

```text
failGroupCount
failOrderCount
mergeFailOrderGroupList
newOrderCodeList
successGroupCount
successOrderCount
```

Merge failure error values:

```text
200 - success
11001 - only 1 order selected
11002 - order exception
11003 - empty order
11004 - address mismatch
11005 - no available logistics
11006 - supplier self shipped order
11007 - order status changed
11100 - other error
```

### 5.5 Submit Merge Progress

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/submitProgress
```

### 5.6 Submit Merge Result

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/mergeOrder/submitResult
```

Project usage for merge APIs:

1. Reduce shipping cost where multiple Shopify orders can be merged.
2. Avoid merging orders with address mismatch or unavailable logistics.
3. Track new merged order codes.
4. Sync final merged order status back to Shopify.

## 6. Address Management

These APIs maintain the account level address book for the current CJ account. The server fills the user context from the current `CJ-Access-Token`; do not pass `userId` or `token` in the request body.

### 6.1 List Addresses

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/address/list
```

Request:

```json
{}
```

### 6.2 Create Address

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/address/create
```

Request fields:

```text
firstName
lastName
country
countryCode
province
city
address
addressNew
zip
phone
mail
isDefault
```

### 6.3 Update Address

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/address/update
```

Required for update:

```text
id
firstName
lastName
country
countryCode
province
city
address
```

Optional fields:

```text
addressNew
zip
phone
mail
isDefault
countyTown
consigneeId
```

Address response fields:

```text
id
firstName
lastName
country
countryCode
province
city
address
addressNew
zip
phone
mail
isDefault
```

Project usage:

1. Store customer shipping addresses for private inventory flows.
2. Update address book entries when needed.
3. Use address list to fill outbound order address objects.

## 7. Private Inventory Orders

Private Inventory order APIs provide an OpenAPI flow for preorder or private inventory purchasing.

Recommended direct mode:

```text
GET /product/listV2
      ↓
POST /shopping/privateInventory/getConfirmationWithCost with variants
      ↓
POST /shopping/privateInventory/getConfirmationWithCost with storageId
      ↓
POST /shopping/privateInventory/getConfirmationWithCost with logisticName
      ↓
POST /shopping/privateInventory/createOrder
      ↓
POST /shopping/pay/payBalanceV2 with orderType=9 if balance payment
      ↓
POST /shopping/privateInventory/order/list
```

Recommended cart mode:

```text
GET /product/listV2
      ↓
POST /shopping/privateInventory/addToCart
      ↓
POST /shopping/privateInventory/getCart
      ↓
POST /shopping/privateInventory/getConfirmationWithCost
      ↓
POST /shopping/privateInventory/createOrder
      ↓
POST /shopping/pay/payBalanceV2 with orderType=9 if balance payment
      ↓
POST /shopping/privateInventory/order/list
```

Order element sources:

```text
Product ID, variant ID, SKU - from /product/listV2, cart, or confirmation response
Quantity - client selection, cart quantity, or confirmation response
Storage ID - availableStorehouseList[].storageId from confirmation
Logistics name - availableLogisticList[].logisticName from logistics or cost APIs
Product unit price - API calculation, do not submit price for billing
Cost details - getCostInfo or getConfirmationWithCost response
Payment option - createOrder.payType
```

### 7.1 Add To Private Inventory Cart

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/addToCart
```

Request:

```json
{
  "productId": "422C91F3-B7D0-47F3-BC66-5E1FE3208BBA",
  "variants": [
    {
      "variantId": "V001-SKU-A",
      "quantity": 100
    }
  ]
}
```

Required fields:

```text
productId
variants
variants[].variantId
variants[].quantity
```

Quantity range:

```text
1 to 100000
```

### 7.2 Get Private Inventory Cart

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/getCart
```

Request can be omitted or paginated:

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "isAll": 0
}
```

Important response fields:

```text
productList
productId
productName
productImage
variants
variants[].id
variants[].variantId
variants[].sku
variants[].quantity
variants[].count
variants[].price
invalidProductList
totalAmount
selectVariantCount
currencyInfo
```

Rules:

```text
pageSize is capped at 100.
Cart price is display only and should not be passed as order total.
```

### 7.3 Remove Private Inventory Cart Items

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/removeFromCart
```

Request:

```json
{
  "variantIds": ["V001-SKU-A"]
}
```

### 7.4 Get Private Inventory Order Confirmation

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/getConfirmation
```

Direct mode request:

```json
{
  "variants": [
    {
      "variantId": "V001-SKU-A",
      "productId": "422C91F3-B7D0-47F3-BC66-5E1FE3208BBA",
      "quantity": 100
    }
  ]
}
```

Important response fields:

```text
orders
availableStorehouseList
selectedStorageId
selectedStorehouse
totalProductPrice
currencyInfo
```

Warehouse fields:

```text
storageId
displayName
countryCode
areaId
addresses
address
zipCode
selected
```

Confirmed product fields:

```text
variantId
id
productId
sku
productName
productImage
quantity
count
itemCount
price
nowPrice
weight
```

### 7.5 Get Private Inventory Available Logistics

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/logistics/list
```

Request:

```json
{
  "storageId": "WAREHOUSE-HZ-001",
  "variantInfoList": [
    {
      "id": "V001-SKU-A",
      "quantity": 100
    }
  ]
}
```

Important response fields:

```text
storageId
availableLogisticList
selectedLogisticName
logisticInfoMessage
```

Logistics fields:

```text
logisticName
displayName
logisticCode
shippingCost
estimateDays
freightIndex
selected
```

### 7.6 Get Private Inventory Cost Details

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/getCostInfo
```

Request fields:

```text
storageId
variantInfoList
variantInfoList[].id
variantInfoList[].quantity
logisticName
```

Important response fields:

```text
freightAmount
logisticsCost
shippingCost
warehouseFee
storehouseCost
serviceFee
freightTrialList
costDetails
errorEnList
errorSuggestionList
```

Project usage:

1. Display exact cost before private inventory order creation.
2. Select logistics by cost and delivery time.
3. Block orders when errors or suggestions indicate invalid products.

### 7.7 Get Confirmation with Cost Details

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/getConfirmationWithCost
```

Request:

```json
{
  "storageId": "WAREHOUSE-HZ-001",
  "logisticName": "CJ Packet Ordinary",
  "variants": [
    {
      "variantId": "V001-SKU-A",
      "productId": "422C91F3-B7D0-47F3-BC66-5E1FE3208BBA",
      "quantity": 100
    }
  ]
}
```

Call sequence:

```text
First call without storageId to get warehouses.
Second call with storageId to get cost details.
Third call with storageId and logisticName to get final amount.
```

Important response groups:

```text
confirmation
availableStorehouseList
selectedStorageId
selectedStorehouse
costInfo
amountDetail
costInfoMessage
```

Amount detail fields:

```text
productAmountList
productAmountList[].variantId
productAmountList[].productId
productAmountList[].sku
productAmountList[].quantity
productAmountList[].unitPrice
productAmountList[].productAmount
productAmount
serviceFee
requestedLogisticName
selectedFreight
shippingCost
totalAmount
totalAmountCalculated
missingAmountItems
```

Project usage:

1. Preferred confirmation endpoint for private inventory ordering.
2. Use to collect warehouse, logistics, and total cost in one workflow.
3. Only create an order when `totalAmountCalculated` is true.

### 7.8 Create Private Inventory Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/createOrder
```

Request:

```json
{
  "productList": [
    {
      "variantId": "V001-SKU-A",
      "productId": "422C91F3-B7D0-47F3-BC66-5E1FE3208BBA",
      "sku": "CJJJJTJT00873-Black",
      "quantity": 100
    }
  ],
  "logisticName": "CJ Packet Ordinary",
  "storageId": "WAREHOUSE-HZ-001",
  "payType": 1
}
```

Required fields:

```text
productList
productList[].variantId
productList[].productId
productList[].sku
productList[].quantity
logisticName
storageId
```

Payment values:

```text
payType 1 - page payment, returns payment URL
payType 2 - balance payment
```

Important response fields:

```text
orderId
orderCode
payId
cjPayUrl
price
riskInterceptOrderList
checkPlaceOrderInfo
availableLogisticList
requestedLogisticName
```

Project usage:

1. Create private inventory purchase orders.
2. Use page payment URL or Pay Balance V2 with orderType=9.
3. Handle unavailable logistics and risk intercepts before retrying.

### 7.9 Balance Payment V2 for Private Inventory

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalanceV2
```

Request:

```json
{
  "shipmentOrderId": "SY1234567890",
  "orderType": 9,
  "payId": "PAY1234567890"
}
```

Rules:

```text
Use orderType=9 for private inventory orders.
shipmentOrderId should be the private inventory orderId or orderCode returned by createOrder.
payId is optional for private inventory.
```

### 7.10 Query Private Inventory Order List

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/order/list
```

Request:

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "orderContent": "SY1234567890",
  "createOrderDateStart": 1717200000000,
  "createOrderDateEnd": 1719791999000
}
```

Request parameters:

```text
pageNum
pageSize
orderContent
orderStatus
payStatus
createOrderDateStart
createOrderDateEnd
isAmountDifference
```

Common order status values:

```text
3 - Awaiting Payment
11 - Payment Incoming
10 - Pending
6 - Awaiting Dispatch
12 - Dispatched
7 - Completed
13 - Closed
8 - Canceled
```

Important order response fields:

```text
orderCode
status
statusDesc
disputeStatus
storageId
storageNo2Name
stockout
logisticName
logisticsMode
postage
trackingNumber
cjTrackingNumber
paymentExpirationTime
inventoryReserved
createDate
paymentDate
orderAmount
amount
serviceFee
iossNumber
iossType
iossTaxes
orderQuantity
stockoutRefundStatus
refundAmount
refundStatus
openDispute
canViewWarehouseVideo
```

Supplier and product fields:

```text
supplierId
supplierName
productList
productId
productVariantListList
stanProductId
sku
cjProductId
cjProductName
cjImage
variantKey
quantity
allocateNum
originalPrice
price
weight
refundStatus
stockout
groupProduct
isPod
productGroupChildList
```

Project usage:

1. Monitor private inventory orders.
2. Track stockouts, refunds, payment status, and tracking numbers.
3. Sync private inventory order status into internal dashboards.

## 8. Private Inventory Outbound Orders

Private inventory outbound APIs create OMS private inventory outbound orders. They let the system query outboundable inventory, lock inventory, create an outbound order, submit it, and poll progress.

Do not pass internal identity fields such as:

```text
userNum
userId
merchantId
permissionCode
systemInvoke
createUserId
createUserName
thirdStorage
deliveryType
```

Recommended outbound flow:

```text
POST /shopping/privateInventory/outbound/address/list
      ↓
POST /shopping/privateInventory/outbound/product/query
      ↓
POST /shopping/privateInventory/outbound/product/batch-refresh
      ↓
POST /shopping/privateInventory/outbound/create
      ↓
Poll POST /shopping/privateInventory/outbound/progress
      ↓
POST /shopping/privateInventory/outbound/submit
      ↓
Poll progress for payment or parent order status
```

### 8.1 API List

```text
POST /shopping/privateInventory/outbound/address/list
POST /shopping/privateInventory/outbound/product/query
POST /shopping/privateInventory/outbound/product/batch-refresh
POST /shopping/privateInventory/outbound/create
POST /shopping/privateInventory/outbound/progress
POST /shopping/privateInventory/outbound/submit
POST /shopping/privateInventory/outbound/detail
POST /shopping/privateInventory/outbound/cancel
```

### 8.2 Address List

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/address/list
```

Request:

```json
{}
```

Important response fields:

```text
id
name
firstName
lastName
country
countryCode
province
city
countyTown
address
addressNew
zip
phone
mail
consigneeId
```

Project usage:

1. Fill the `address` object for outbound create.
2. Reuse address book entries for private inventory outbound orders.

### 8.3 Query Outboundable Products

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/product/query
```

Request parameters:

```text
storageId - required selected outbound warehouse
skuOrSpu - optional SKU or SPU keyword
privateOrderId - optional private inventory order number
orderId - optional outbound order number when updating
```

Rules:

```text
Pass at least one of skuOrSpu or privateOrderId.
```

Important response fields:

```text
id
uid
productId
spu
sku
stanProductId
productName
productImg
value1
value2
value3
price
privateOrderId
availableQuantity
lockQuantity
```

### 8.4 Batch Refresh Selected Inventory

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/product/batch-refresh
```

Request fields:

```text
storageId
orderId
products
products[].privateOrderId
products[].stanProductId
products[].price
```

Important response fields:

```text
privateOrderId
stanProductId
uid
availableQuantity
```

Project usage:

1. Refresh inventory before creating outbound order.
2. Prevent stale inventory quantities.
3. Use `/product/query` or outbound detail for full display fields.

### 8.5 Create Private Inventory Outbound Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/create
```

Request body core fields:

```text
orderId - required when updating, omit when creating
orderNumber
storageId
platform
storeName
postagePayNode
reason
reasonEn
address
productList
submit
```

Postage payment node values:

```text
4 - pay before outbound
5 - pay after outbound
6 - no payment required, reason required
```

Address fields:

```text
customerName
shippingAddress
shippingAddress2
city
province
town
countryCode
country
zipCode
phone
email
taxId
consigneeId
```

Product fields:

```text
id
uid
sku
stanProductId
price
privateOrderId
quantity
```

Important response fields:

```text
orderId
createTaskStarted
submitRequested
nextAction
```

Project usage:

1. Create or update private inventory outbound orders.
2. Use `submit=true` only when ready to auto submit.
3. Poll progress after creation.

### 8.6 Query Progress

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/progress
```

Request:

```json
{
  "orderId": "SD260526000001"
}
```

Important response fields:

```text
orderId
progress
createProgress
createStatus
lockFails
nextAction
submitStatus
paymentStatus
```

Create status values:

```text
PROCESSING
CREATE_SUB_ORDER_SUCCESS
TASK_COMPLETE
LOCK_FAIL
```

Next action values:

```text
WAIT_CREATE
WAIT_LOCK_ARRIVE
ADJUST_LOCK_FAIL_PRODUCTS
SUBMIT_ORDER
POLL_CREATE_PROGRESS
POLL_SUBMIT_PROGRESS
WAIT_APPROVAL
PAY
FINISHED
```

Lock failure handling:

```text
If createStatus=LOCK_FAIL, nextAction=ADJUST_LOCK_FAIL_PRODUCTS, or lockFails is not empty:
1. Do not submit directly.
2. Query detail.
3. Reduce failed quantities or remove failed product lines.
4. Call create again with the same orderId.
5. Poll progress until submit ready.
```

### 8.7 Submit Outbound Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/submit
```

Request parameter:

```text
orderId - required
```

Important response fields:

```text
orderId
submitAccepted
nextAction
lockFails
actionRequired
suggestedSteps
```

Project usage:

1. Submit only when progress says `SUBMIT_ORDER`.
2. If insufficient inventory is returned, adjust and resubmit.
3. Do not keep retrying the same failed request.

### 8.8 Query Outbound Order Detail

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/detail
```

Request parameter:

```text
orderId - required
```

Main response fields:

```text
orderId
orderNumber
storageId
platform
storeName
postagePayNode
address
productList
orderStatus
submitStatus
availableQuantity
lockQuantity
price
```

Project usage:

1. Show outbound order detail.
2. Retry after lock failure.
3. Rebuild product list for update request.

### 8.9 Cancel Outbound Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/privateInventory/outbound/cancel
```

Request parameters:

```text
orderId - required
reason - optional cancel reason
```

Important response fields:

```text
orderId
cancelled
```

Project usage:

1. Cancel unfinished outbound orders.
2. Store cancel reason.
3. Respect CJ status rules if operation is not allowed.

## 9. Makeup and Supplement Payments

Makeup bill API prefix:

```text
/api2.0/v1/shopping/makeup/*
```

Purpose:

1. List unpaid supplement bills.
2. Create makeup payment orders.
3. Pay makeup orders by balance using Pay Balance V2 with `orderType=24`.

Type values:

```text
0 - Make-up Orders
1 - Other Make-up
```

Diff use type values:

```text
0 - order supplement payment
1 - Balance Top-up
2 - Repayment
3 - Transfer Shipping Fee
```

### 9.1 Makeup Payment Flow

```text
POST /shopping/makeup/list
      ↓
POST /shopping/makeup/createPayOrder
      ↓
Either redirect to cjPayUrl or call POST /shopping/pay/payBalanceV2 with orderType=24
      ↓
POST /shopping/makeup/list to refresh status
```

### 9.2 Get Makeup List

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/makeup/list
```

Request:

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "type": 0
}
```

Request fields:

```text
pageNum - default 1
pageSize - default 10, maximum 200
type - 0 make up orders, 1 other make up
diffUseType - for type 1 only: 1 balance top up, 2 repayment, 3 transfer shipping fee
```

Important response fields:

```text
type
totalAmount
unPaymentCountList
pageData
pageData.content[].orderCode
pageData.content[].cjOrderCode
pageData.content[].status
pageData.content[].amount
pageData.content[].reason
pageData.content[].orderType
pageData.content[].diffUseType
pageData.content[].createAt
```

Makeup status values:

```text
0 - to submit
1 - processing
2 - failed
3 - cancelled
4 - completed
5 - paying
```

### 9.3 Create Makeup Payment Order

Endpoint:

```text
POST https://developers.cjdropshipping.com/api2.0/v1/shopping/makeup/createPayOrder
```

Request:

```json
{
  "orderCodes": ["BK260526000001"],
  "type": 0
}
```

Request fields:

```text
orderCodes - required, makeup bill numbers from makeup list
type - default 0. 0 make up orders, 1 other make up
diffUseType - required when type=1
```

Important response fields:

```text
payOrderCode
payId
amount
cjPayUrl
paymentPagePath
```

Project usage:

1. Create payment order for supplement bills.
2. Redirect to `cjPayUrl` for page payment or pay by balance.
3. Use Pay Balance V2 with `shipmentOrderId=payOrderCode`, `payId`, and `orderType=24` for direct balance payment.

## Automation Notes

For Shopify integration, the most important Shopping APIs are:

```text
/shopping/order/createOrderV3
/shopping/order/list
/shopping/order/getOrderDetail
/shopping/pay/getBalance
/shopping/pay/payBalanceV2
/shopping/sandbox/simulatePay
/shopping/sandbox/updateStatus
```

For private inventory support, the most important APIs are:

```text
/shopping/privateInventory/getConfirmationWithCost
/shopping/privateInventory/createOrder
/shopping/privateInventory/order/list
/shopping/pay/payBalanceV2
```

For profit analytics, the most important APIs are:

```text
/shopping/order/queryCogsBasicDataOrderInfoList
/shopping/order/getOrderDetail
/shopping/order/list
```

Recommended safety rules:

```text
Never auto pay live orders until balance, product mapping, shipping cost, and customer address are validated.
Always test Create Order V3 with isSandbox=1 before live mode.
Store requestId for every failed CJ request.
Do not delete, cancel, confirm, or pay live orders without explicit automation rules.
```
