"use client";

import { useEffect, useMemo, useState } from "react";

type TickerCoin = {
  id: string;
  name: string;
  symbol: string;
  image: string;
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
    <section className="crypto-ticker-shell w-full overflow-hidden border-b border-line bg-panel text-ink">
      <div className="flex min-h-12 items-center gap-4">
        {isLoading && !coins.length ? (
          <div className="px-6 text-sm font-bold text-muted">Loading live USD prices...</div>
        ) : (
          <div className="flex min-w-max animate-crypto-ticker items-center gap-10">
            {tickerItems.map((coin, index) => {
              const positive = coin.change24h >= 0;

              return (
                <div
                  className="flex items-center gap-2 text-sm font-extrabold"
                  key={`${coin.id}-${index}`}
                >
                  {coin.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-6 w-6 rounded-full" src={coin.image} />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-panelSoft" />
                  )}
                  <span className="crypto-ticker-symbol text-ink">{coin.symbol}</span>
                  <span className="crypto-ticker-price text-muted">{formatUsd(coin.priceUsd)}</span>
                  <span className={`rounded-md px-2 py-1 ${positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
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
