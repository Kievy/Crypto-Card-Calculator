import { NextResponse } from "next/server";

const coingeckoUrl =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h";

export const dynamic = "force-dynamic";

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
};

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(coingeckoUrl, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoMarket[];

    return NextResponse.json({
      source: "CoinGecko",
      updatedAt: new Date().toISOString(),
      coins: data.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
        priceUsd: coin.current_price,
        change24h: coin.price_change_percentage_24h ?? 0,
      })),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch crypto ticker prices",
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
