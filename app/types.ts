export interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  discount: number;
  dealScore: "bug" | "incredible" | "great" | "good" | "normal";
  thumbnail: string;
  permalink: string;
  condition: "new" | "used";
  availableQuantity: number;
  soldQuantity: number;
  seller: {
    nickname: string;
  };
  freeShipping: boolean;
}

export interface SearchResponse {
  results: Deal[];
  total: number;
  query: string;
  error?: string;
}
