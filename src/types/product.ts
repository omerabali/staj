export interface RawProduct {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  // Category might come correctly, as an array, or missing
  category: string | string[] | null;
  updatedAt: string;
}

export interface GlitchIssue {
  field: keyof RawProduct;
  message: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  updatedAt: string | null;
  glitchScore: number;
  glitchReport: GlitchIssue[];
}
