export type StoreCategory = "Pet" | "Home" | "Beauty";

export type ProductDecision = "publish" | "review" | "reject";

export interface NormalizedProduct {
  id: string;
  title: string;
  description?: string;
  category?: StoreCategory;
  images: string[];
  costPrice?: number;
  suggestedPrice?: number;
  shippingCost?: number;
  shippingDaysMin?: number;
  shippingDaysMax?: number;
  inventoryQuantity?: number;
  reviewCount?: number;
  rating?: number;
  sourceUrl?: string;
  raw?: unknown;
}

export interface ProductScore {
  productId: string;
  total: number;
  decision: ProductDecision;
  margin: number;
  shippingCost: number;
  shippingTime: number;
  inventory: number;
  demand: number;
  listingQuality: number;
  categoryFit: number;
  notes: string[];
}

export interface ShopifyProductDraft {
  title: string;
  body_html: string;
  vendor: string;
  product_type: StoreCategory;
  tags: string[];
  status: "draft" | "active";
  images: Array<{ src: string }>;
  variants: Array<{
    price: string;
    sku?: string;
    inventory_management?: "shopify";
  }>;
}
