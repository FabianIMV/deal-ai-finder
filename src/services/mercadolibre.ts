const BASE_URL = "https://api.mercadolibre.com";
const SITE_ID = "MLC"; // Chile

export interface MLProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  original_price: number | null;
  thumbnail: string;
  permalink: string;
  condition: string;
  available_quantity: number;
  seller: {
    id: number;
    nickname: string;
  };
}

export interface MLSearchResult {
  results: MLProduct[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

export async function searchProducts(
  query: string,
  limit = 20
): Promise<MLSearchResult> {
  const url = `${BASE_URL}/sites/${SITE_ID}/search?q=${encodeURIComponent(
    query
  )}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al buscar: ${response.status}`);
  }
  const data = await response.json();
  return data as MLSearchResult;
}

export function calcDiscount(
  price: number,
  originalPrice: number | null
): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatPrice(price: number, currency = "CLP"): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
