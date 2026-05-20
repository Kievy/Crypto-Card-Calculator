import { NextResponse } from "next/server";

const googleFinanceUrl = "https://www.google.com/finance/quote/USD-BRL?hl=pt";

export const dynamic = "force-dynamic";

function parseGooglePrice(html: string) {
  const dataPrice = html.match(/data-last-price="([^"]+)"/)?.[1];
  const visiblePrice = html.match(/class="YMlKec fxKbKc">([^<]+)</)?.[1];
  const rawPrice = dataPrice ?? visiblePrice;

  if (!rawPrice) return null;

  const normalized = rawPrice.replace(/\./g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);

  return Number.isFinite(value) ? value : null;
}

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(googleFinanceUrl, {
      headers: {
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Google Finance responded with ${response.status}`);
    }

    const html = await response.text();
    const value = parseGooglePrice(html);

    if (!value) {
      throw new Error("Could not parse Google Finance USD/BRL rate");
    }

    return NextResponse.json({
      source: "Google Finance",
      sourceUrl: googleFinanceUrl,
      updatedAt: new Date().toISOString(),
      value,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch Google Finance USD/BRL rate",
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
