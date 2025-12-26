export interface ProductImage {
  id: number;
  image_url: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color_name: string;
  color_hex: string;
  size: string;
  gender: "male" | "female" | "unisex";
  stock: number;
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