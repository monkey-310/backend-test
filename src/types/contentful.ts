export interface ContentfulEntry {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    sku?: string;
    name?: string;
    brand?: string;
    model?: string;
    category: string;
    color?: string;
    price?: number;
    currency?: string;
    stock?: number;
  };
}

export interface ContentfulResponse {
  items: ContentfulEntry[];
}
