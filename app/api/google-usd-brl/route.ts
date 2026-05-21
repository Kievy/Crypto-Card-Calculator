import { NextRequest, NextResponse } from "next/server";

const googleFinanceUrl = "https://www.google.com/finance/beta/quote/USD-BRL?hl=pt";
const yahooFinanceSymbol = "USDBRL=X";

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

function saoPauloTimestamp(date: string, time: string) {
  return Math.floor(new Date(`${date}T${time || "13:00"}:00-03:00`).getTime() / 1000);
}

async function fetchHistoricalRate(date: string, time: string) {
  const selectedTimestamp = saoPauloTimestamp(date, time);
  const period1 = selectedTimestamp - 60 * 60 * 2;
  const period2 = selectedTimestamp + 60 * 60 * 2;
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooFinanceSymbol)}` +
    `?period1=${period1}&period2=${period2}&interval=5m`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance responded with ${response.status}`);
  }

  const data = (await response.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[];
        indicators?: {
          quote?: Array<{
            close?: Array<number | null>;
          }>;
        };
      }>;
      error?: unknown;
    };
  };
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closePrices = result?.indicators?.quote?.[0]?.close ?? [];
  const quotes = timestamps
    .map((timestamp, index) => ({
      timestamp,
      value: closePrices[index],
    }))
    .filter((quote): quote is { timestamp: number; value: number } => Number.isFinite(quote.value));

  if (!quotes.length) {
    throw new Error("No Yahoo Finance intraday quotes found for selected date");
  }

  const closest = quotes.reduce((best, quote) => {
    return Math.abs(quote.timestamp - selectedTimestamp) < Math.abs(best.timestamp - selectedTimestamp)
      ? quote
      : best;
  }, quotes[0]);

  return NextResponse.json({
    source: "Yahoo Finance",
    sourceUrl: url,
    updatedAt: new Date(closest.timestamp * 1000).toISOString(),
    requestedAt: `${date}T${time}:00`,
    value: Number(closest.value.toFixed(4)),
  });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const time = request.nextUrl.searchParams.get("time") ?? "13:00";

  if (date) {
    try {
      return await fetchHistoricalRate(date, time);
    } catch {
      return NextResponse.json(
        {
          error: "Unable to fetch historical Yahoo Finance USD/BRL rate",
        },
        {
          status: 502,
        },
      );
    }
  }

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
