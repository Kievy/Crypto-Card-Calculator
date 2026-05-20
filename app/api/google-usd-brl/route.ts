import { NextResponse } from "next/server";

const googleFinanceUrl = "https://www.google.com/finance/beta/quote/USD-BRL?hl=pt";

export const dynamic = "force-dynamic";

function parseNumber(value: string) {
  const trimmed = value.trim();
  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function textFromHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGooglePrice(html: string) {
  const dataPrice = html.match(/data-last-price="([^"]+)"/)?.[1];
  const visiblePrice = html.match(/class="YMlKec[^"]*">([^<]+)</)?.[1];
  const directPrice = dataPrice ?? visiblePrice;

  if (directPrice) {
    return parseNumber(directPrice);
  }

  const text = textFromHtml(html);
  const marker =
    text.match(/Dólar americano\s*\/\s*Real brasileiro([\s\S]{0,120})/) ??
    text.match(/United States Dollar\s*\/\s*Brazilian Real([\s\S]{0,120})/) ??
    text.match(/USD\s*\/\s*BRL([\s\S]{0,180})/);

  const rawPrice = marker?.[1]?.match(/\b\d+[,.]\d{3,5}\b/)?.[0];

  return rawPrice ? parseNumber(rawPrice) : null;
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
