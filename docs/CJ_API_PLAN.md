# CJ Dropshipping API Plan

This document summarizes the CJ Dropshipping API endpoints shared for this project and maps them to the product discovery, ranking, and store publishing workflow.

Important: API credentials must never be committed to this repository. Store credentials in environment variables only.

## Authentication

Use the CJ authentication endpoints to request and refresh access tokens.

Relevant endpoints:

```text
/authentication/getAccessToken
/authentication/refreshAccessToken
/authentication/logout
```

Planned environment variables:

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

Primary use cases:

1. Check whether products are available.
2. Check SKU level stock.
3. Avoid products with low or unstable inventory.
4. Improve product ranking using inventory confidence.

## Shipping and Logistics

These endpoints can support shipping cost, shipping time, and logistics template checks.

Relevant endpoints:

```text
/logistic/freightCalculate
/logistic/partnerFreightCalculate
/logistic/freightCalculateTip
/logistic/getSupplierLogisticsTemplate
/logistic/getTrackInfo
/logistic/trackInfo
```

Primary use cases:

1. Estimate shipping cost.
2. Estimate shipping time.
3. Check shipping options by destination country.
4. Penalize products with slow or expensive shipping.
5. Support order tracking later.

## Store and Listing Support

These endpoints can support store connection, category mapping, vendor data, delivery profiles, and product listing.

Relevant endpoints:

```text
/shop/getShops
/product/listed/getPlatformCategoryTree
/product/listed/getReceiverCountryInfo
/product/listed/queryVendors
/product/listed/queryDeliveryProfiles
/product/listed/listedByPids
```

Primary use cases:

1. Fetch connected shops.
2. Map products to platform categories.
3. Match products to store categories.
4. Check receiver country support.
5. Check vendor and delivery profile options.
6. List selected products by product ID.

## Store Categories

The store currently has three target categories:

```text
Pet
Home
Beauty
```

Each CJ product should be classified into one of these categories before scoring.

## Ranking Model Draft

Each product should receive a dropshipping score from 0 to 100.

Suggested scoring factors:

```text
Profit margin: 25 points
Shipping cost: 15 points
Shipping time: 15 points
Inventory availability: 15 points
Product demand or comments: 10 points
Listing quality: 10 points
Category fit: 10 points
```

Initial formula:

```text
Dropshipping Score = Margin Score + Shipping Cost Score + Shipping Time Score + Inventory Score + Demand Score + Listing Quality Score + Category Fit Score
```

## Product Decision Rules

Suggested decisions:

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
4. Add basic logging.
5. Add a safe `.env.example` file without secrets.

### Phase 2: Product Pull

1. Fetch products from CJ.
2. Fetch product details.
3. Fetch variants.
4. Fetch categories.
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
3. Publish selected products to the connected store.
4. Track which products were already listed.

### Phase 5: Automation

1. Run product discovery on a schedule.
2. Save top ranked products.
3. Notify before publishing or auto publish based on score.
4. Monitor stock and shipping changes.

## Security Notes

Never commit API keys, access tokens, refresh tokens, or customer data.

Use `.env` locally and keep it ignored by Git.

Recommended files:

```text
.env
.env.local
```

Recommended repository files:

```text
.env.example
.gitignore
```
