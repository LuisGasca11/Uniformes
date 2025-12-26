export interface ProductVariant {
  id: number;
  color_name: string;
  color_hex: string;
  size: string;
  stock: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sold_info?: string;
  category_id?: number;
  category_name?: string;
  brand?: string;
  code?: string; 
  key_code?: string; 
  images?: Array<{ id: number; image_url: string }>;
  variants?: Array<any>;
  created_at?: string;
  updated_at?: string;
}