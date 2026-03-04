import { NextRequest, NextResponse } from "next/server";
import { Deal } from "@/app/types";

const MLC_API = "https://api.mercadolibre.com";

type MLCItem = {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail: string;
  permalink: string;
  condition: "new" | "used";
  available_quantity: number;
  sold_quantity: number;
  seller?: { nickname: string };
  shipping?: { free_shipping: boolean };
};

function calculateDealScore(
  discount: number
): Deal["dealScore"] {
  if (discount >= 80) return "bug";
  if (discount >= 60) return "incredible";
  if (discount >= 40) return "great";
  if (discount >= 20) return "good";
  return "normal";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const maxPrice = searchParams.get("maxPrice");
  const minDiscount = parseInt(searchParams.get("minDiscount") ?? "0");

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Se requiere el parámetro de búsqueda." },
      { status: 400 }
    );
  }

  try {
    let url = `${MLC_API}/sites/MLC/search?q=${encodeURIComponent(query.trim())}&limit=${limit}&offset=${offset}&sort=price_asc`;

    if (maxPrice) {
      const max = parseInt(maxPrice);
      if (!isNaN(max) && max > 0) {
        url += `&price=*-${max}`;
      }
    }

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al consultar MercadoLibre Chile." },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      results: MLCItem[];
      paging: { total: number };
    };

    const results: Deal[] = data.results.map((item) => {
      const discount =
        item.original_price && item.price < item.original_price
          ? Math.round((1 - item.price / item.original_price) * 100)
          : 0;

      return {
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.original_price,
        discount,
        dealScore: calculateDealScore(discount),
        thumbnail: (item.thumbnail ?? "").replace("http://", "https://"),
        permalink: item.permalink,
        condition: item.condition,
        availableQuantity: item.available_quantity,
        soldQuantity: item.sold_quantity,
        seller: { nickname: item.seller?.nickname ?? "" },
        freeShipping: item.shipping?.free_shipping ?? false,
      };
    });

    const filtered =
      minDiscount > 0
        ? results.filter((r) => r.discount >= minDiscount)
        : results;

    return NextResponse.json({
      results: filtered,
      total: data.paging.total,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
