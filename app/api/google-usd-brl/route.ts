import { NextRequest, NextResponse } from "next/server";

const tradingViewSocketUrl = "wss://data.tradingview.com/socket.io/websocket";

export const dynamic = "force-dynamic";

type CurrencyCode = "BRL" | "ARS" | "PYG";

const currencyConfigs: Record<CurrencyCode, { googleSymbol: string; tradingViewSymbol: string }> = {
  BRL: {
    googleSymbol: "USD-BRL",
    tradingViewSymbol: "FX_IDC:USDBRL",
  },
  ARS: {
    googleSymbol: "USD-ARS",
    tradingViewSymbol: "FX_IDC:USDARS",
  },
  PYG: {
    googleSymbol: "USD-PYG",
    tradingViewSymbol: "FX_IDC:USDPYG",
  },
};

function currencyFromParam(value: string | null): CurrencyCode {
  if (value === "ARS" || value === "PYG") return value;

  return "BRL";
}

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

function parseGooglePrice(html: string, currency: CurrencyCode) {
  const dataPrice = html.match(/data-last-price="([^"]+)"/)?.[1];
  const visiblePrice = html.match(/class="YMlKec[^"]*">([^<]+)</)?.[1];
  const directPrice = dataPrice ?? visiblePrice;

  if (directPrice) {
    return parseNumber(directPrice);
  }

  const text = textFromHtml(html);
  const symbol = currencyConfigs[currency].googleSymbol.replace("-", "\\s*[/-]\\s*");
  const marker = text.match(new RegExp(`${symbol}([\\s\\S]{0,180})`, "i"));
  const rawPrice = marker?.[1]?.match(/\b\d+[,.]\d{2,6}\b/)?.[0];

  return rawPrice ? parseNumber(rawPrice) : null;
}

function saoPauloTimestamp(date: string, time: string) {
  return Math.floor(new Date(`${date}T${time || "13:00"}:00-03:00`).getTime() / 1000);
}

function tradingViewSession(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
}

function tradingViewMessage(method: string, params: unknown[]) {
  const payload = JSON.stringify({ m: method, p: params });

  return `~m~${payload.length}~m~${payload}`;
}

function parseTradingViewFrames(data: string) {
  const frames: Array<{ m?: string; p?: unknown[] }> = [];
  let cursor = 0;

  while (cursor < data.length) {
    const markerStart = data.indexOf("~m~", cursor);

    if (markerStart === -1) break;

    const lengthStart = markerStart + 3;
    const lengthEnd = data.indexOf("~m~", lengthStart);

    if (lengthEnd === -1) break;

    const frameLength = Number(data.slice(lengthStart, lengthEnd));
    const payloadStart = lengthEnd + 3;
    const payloadEnd = payloadStart + frameLength;

    if (!Number.isFinite(frameLength) || payloadEnd > data.length) break;

    try {
      frames.push(JSON.parse(data.slice(payloadStart, payloadEnd)) as { m?: string; p?: unknown[] });
    } catch {
      // Ignore heartbeat and partial frames.
    }

    cursor = payloadEnd;
  }

  return frames;
}

function candlesFromTimescaleUpdate(frame: { p?: unknown[] }) {
  const payload = frame.p?.[1] as Record<string, { s?: unknown[] }> | undefined;
  const series = payload?.s1?.s ?? [];

  return series
    .map((item) => {
      const bar = item as { v?: unknown[] };
      const values = bar.v ?? [];
      const timestamp = Number(values[0]);
      const close = Number(values[4]);

      return { timestamp, value: close };
    })
    .filter((quote): quote is { timestamp: number; value: number } => {
      return Number.isFinite(quote.timestamp) && Number.isFinite(quote.value);
    });
}

async function fetchTradingViewRate({
  currency,
  selectedTimestamp,
  countBack,
}: {
  currency: CurrencyCode;
  selectedTimestamp: number;
  countBack: number;
}) {
  process.env.WS_NO_BUFFER_UTIL = "1";
  process.env.WS_NO_UTF_8_VALIDATE = "1";

  const { default: WebSocket } = await import("ws");
  const chartSession = tradingViewSession("cs");
  const tradingViewSymbol = currencyConfigs[currency].tradingViewSymbol;
  const symbolPayload = JSON.stringify({
    adjustment: "splits",
    session: "regular",
    symbol: tradingViewSymbol,
  });

  return await new Promise<{ sourceUrl: string; timestamp: number; value: number }>((resolve, reject) => {
    const socket = new WebSocket(tradingViewSocketUrl, {
      headers: {
        Origin: "https://www.tradingview.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      },
    });
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("TradingView historical quote request timed out"));
    }, 12000);

    socket.addEventListener("open", () => {
      socket.send(tradingViewMessage("set_auth_token", ["unauthorized_user_token"]));
      socket.send(tradingViewMessage("chart_create_session", [chartSession, ""]));
      socket.send(tradingViewMessage("resolve_symbol", [chartSession, "symbol_1", `=${symbolPayload}`]));
      socket.send(tradingViewMessage("create_series", [chartSession, "s1", "s1", "symbol_1", "5", countBack]));
    });

    socket.addEventListener("message", (event) => {
      const rawData = typeof event.data === "string" ? event.data : "";

      if (rawData.startsWith("~h~")) {
        socket.send(rawData);
        return;
      }

      const frames = parseTradingViewFrames(rawData);
      const timescaleFrame = frames.find((frame) => frame.m === "timescale_update");

      if (!timescaleFrame) return;

      const quotes = candlesFromTimescaleUpdate(timescaleFrame);

      if (!quotes.length) return;

      clearTimeout(timeout);
      socket.close();

      const closest = quotes.reduce((best, quote) => {
        return Math.abs(quote.timestamp - selectedTimestamp) < Math.abs(best.timestamp - selectedTimestamp)
          ? quote
          : best;
      }, quotes[0]);

      resolve({
        sourceUrl: `https://www.tradingview.com/symbols/${tradingViewSymbol.replace(":", "-")}/`,
        timestamp: closest.timestamp,
        value: Number(closest.value.toFixed(4)),
      });
    });

    socket.addEventListener("error", () => {
      clearTimeout(timeout);
      socket.close();
      reject(new Error("Unable to connect to TradingView"));
    });
  });
}

async function fetchHistoricalRate(date: string, time: string, currency: CurrencyCode) {
  const selectedTimestamp = saoPauloTimestamp(date, time);
  const nowTimestamp = Math.floor(Date.now() / 1000);
  const fiveMinuteBarsSinceDate = Math.ceil(Math.max(0, nowTimestamp - selectedTimestamp) / 300);
  const countBack = Math.min(Math.max(fiveMinuteBarsSinceDate + 80, 300), 10000);
  const quote = await fetchTradingViewRate({ currency, selectedTimestamp, countBack });

  return NextResponse.json({
    source: "TradingView",
    sourceUrl: quote.sourceUrl,
    updatedAt: new Date(quote.timestamp * 1000).toISOString(),
    requestedAt: `${date}T${time}:00`,
    currency,
    value: quote.value,
  });
}

async function fetchTradingViewLiveRate(currency: CurrencyCode) {
  const quote = await fetchTradingViewRate({
    currency,
    selectedTimestamp: Math.floor(Date.now() / 1000),
    countBack: 80,
  });

  return NextResponse.json({
    source: "TradingView",
    sourceUrl: quote.sourceUrl,
    updatedAt: new Date(quote.timestamp * 1000).toISOString(),
    currency,
    value: quote.value,
  });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const time = request.nextUrl.searchParams.get("time") ?? "13:00";
  const currency = currencyFromParam(request.nextUrl.searchParams.get("currency"));
  const googleFinanceUrl = `https://www.google.com/finance/beta/quote/${currencyConfigs[currency].googleSymbol}?hl=pt`;

  if (date) {
    try {
      return await fetchHistoricalRate(date, time, currency);
    } catch {
      return NextResponse.json(
        {
          error: `Unable to fetch historical TradingView USD/${currency} rate`,
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
    const value = parseGooglePrice(html, currency);

    if (!value) {
      throw new Error(`Could not parse Google Finance USD/${currency} rate`);
    }

    return NextResponse.json({
      source: "Google Finance",
      sourceUrl: googleFinanceUrl,
      updatedAt: new Date().toISOString(),
      currency,
      value,
    });
  } catch {
    try {
      return await fetchTradingViewLiveRate(currency);
    } catch {
      return NextResponse.json(
        {
          error: `Unable to fetch USD/${currency} rate`,
        },
        {
          status: 502,
        },
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
