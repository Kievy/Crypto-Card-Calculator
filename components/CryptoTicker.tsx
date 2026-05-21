"use client";

import { useEffect, useMemo, useState } from "react";

type TickerCoin = {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number;
  change24h: number;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatUsd(value: number) {
  return value >= 100000 ? compactUsd.format(value) : usd.format(value);
}

export function CryptoTicker() {
  const [coins, setCoins] = useState<TickerCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTicker() {
      try {
        const response = await fetch("/api/crypto-ticker", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          coins?: TickerCoin[];
        };

        if (!ignore && data.coins?.length) {
          setCoins(data.coins);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchTicker();
    const interval = window.setInterval(fetchTicker, 30000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, []);

  const tickerItems = useMemo(() => {
    if (coins.length) return [...coins, ...coins];

    return [];
  }, [coins]);

  return (
    <section className="w-full overflow-hidden border-b border-line bg-[rgb(var(--result-bg))] text-[rgb(var(--result-text))]">
      <div className="flex min-h-11 items-center gap-4">
        <div className="z-10 flex h-11 shrink-0 items-center border-r border-[rgb(var(--result-muted)/0.25)] bg-[rgb(var(--result-bg))] px-6 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">
          Top 10 Crypto
        </div>

        {isLoading && !coins.length ? (
          <div className="text-sm font-bold text-[rgb(var(--result-muted))]">Loading live USD prices...</div>
        ) : (
          <div className="flex min-w-max animate-crypto-ticker items-center gap-3">
            {tickerItems.map((coin, index) => {
              const positive = coin.change24h >= 0;

              return (
                <div
                  className="flex items-center gap-2 rounded-full border border-[rgb(var(--result-muted)/0.18)] bg-[rgb(var(--result-text)/0.06)] px-4 py-2 text-sm font-extrabold"
                  key={`${coin.id}-${index}`}
                >
                  <span>{coin.symbol}</span>
                  <span className="text-[rgb(var(--result-muted))]">{formatUsd(coin.priceUsd)}</span>
                  <span className={positive ? "text-success" : "text-danger"}>
                    {positive ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
