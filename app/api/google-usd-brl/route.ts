import { NextRequest, NextResponse } from "next/server";

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

function formatBcbDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${month}-${day}-${year}`;
}

function minutesFromTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

async function fetchHistoricalRate(date: string, time: string) {
  const bcbDate = formatBcbDate(date);
  const url =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
    `CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?` +
    `@dataInicial='${bcbDate}'&@dataFinalCotacao='${bcbDate}'&$top=100&$format=json`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`BCB responded with ${response.status}`);
  }

  const data = (await response.json()) as {
    value?: Array<{
      cotacaoCompra: number;
      cotacaoVenda: number;
      dataHoraCotacao: string;
    }>;
  };
  const quotes = data.value ?? [];

  if (!quotes.length) {
    throw new Error("No BCB PTAX quotes found for selected date");
  }

  const selectedMinutes = minutesFromTime(time);
  const closest = quotes.reduce((best, quote) => {
    const quoteDate = new Date(quote.dataHoraCotacao);
    const quoteMinutes = quoteDate.getHours() * 60 + quoteDate.getMinutes();
    const bestDate = new Date(best.dataHoraCotacao);
    const bestMinutes = bestDate.getHours() * 60 + bestDate.getMinutes();

    return Math.abs(quoteMinutes - selectedMinutes) < Math.abs(bestMinutes - selectedMinutes)
      ? quote
      : best;
  }, quotes[0]);

  return NextResponse.json({
    source: "Banco Central PTAX",
    sourceUrl: url,
    updatedAt: closest.dataHoraCotacao,
    requestedAt: `${date}T${time}:00`,
    value: closest.cotacaoVenda,
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
          error: "Unable to fetch historical BCB PTAX USD/BRL rate",
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
