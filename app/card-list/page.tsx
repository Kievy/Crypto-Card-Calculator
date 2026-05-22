"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CryptoTicker } from "../../components/CryptoTicker";

type CryptoCard = {
  name: string;
  description: string;
  details: Record<string, string>;
};

const cards: CryptoCard[] = [
  {
    name: "Etherfi Cash",
    description: "Non-custodial Visa card with global availability, lounge-style perks, referrals, and up to 3% cashback.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "Up to 3% cashback",
      Perks: "Referrals, lounge perks, concierge benefits",
    },
  },
  {
    name: "KAST",
    description: "Global non-custodial Visa card focused on VIP tiers, concierge benefits, points, and high cashback potential.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free to $10,000 depending on tier",
      "FX fees": "0%-1.75%",
      Rewards: "Up to 8% cashback",
      Perks: "VIP tiers, concierge, points, referrals",
    },
  },
  {
    name: "RedotPay",
    description: "Custodial global Visa card with simple annual pricing, a signup bonus, and up to 3% cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "1.20%",
      Rewards: "Up to 3% cashback",
      "Signup bonus": "$5",
    },
  },
  {
    name: "Avici",
    description: "Europe-focused non-custodial Visa card with no FX fee and no direct cashback.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Europe",
      "Annual fee": "Free to $10",
      "FX fees": "0%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "Binance Card",
    description: "LATAM custodial Visa card with free annual fee and up to 3% cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "LATAM",
      "Annual fee": "Free",
      "FX fees": "1%-2%",
      Rewards: "Up to 3% cashback",
    },
  },
  {
    name: "Bitget Wallet Card",
    description: "Non-custodial global card supporting Visa or Mastercard rails with free annual fee.",
    details: {
      Network: "Visa/Mastercard",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0% or 1.70%",
    },
  },
  {
    name: "Bitpanda Card",
    description: "European custodial Visa card with no annual or FX fees and up to 1% cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 1% cashback",
    },
  },
  {
    name: "BitPay Card",
    description: "US custodial Mastercard with free annual fee and a higher listed FX fee.",
    details: {
      Network: "Mastercard",
      Custody: "Custodial",
      Regions: "United States",
      "Annual fee": "Free",
      "FX fees": "3%",
      Rewards: "Up to 15% cashback",
    },
  },
  {
    name: "Bitrefill Card",
    description: "European custodial Visa card tied into Bitrefill services like gift cards, refills, and travel eSIMs.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 1% cashback",
      Perks: "Bitrefill credit, gift cards, refills, travel eSIMs",
    },
  },
  {
    name: "Bleap",
    description: "European non-custodial Mastercard with no annual or FX fees and up to 2% cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 2% cashback",
    },
  },
  {
    name: "Brighty",
    description: "European custodial Visa card with tiered annual fees, cashback, daily interest, and APY tools.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Europe",
      "Annual fee": "EUR 0-EUR 216",
      "FX fees": "0%",
      Rewards: "Up to 1.75% cashback",
      Perks: "Daily interest, APY products, AI wealth tools",
    },
  },
  {
    name: "Bybit Card",
    description: "Custodial Mastercard for Europe, LATAM, and APAC with cashback, signup bonus, and Auto-Earn perks.",
    details: {
      Network: "Mastercard",
      Custody: "Custodial",
      Regions: "Europe, LATAM, APAC",
      "Annual fee": "Free",
      "FX fees": "0.50%",
      Rewards: "Up to 10% cashback",
      "Signup bonus": "20 USDT",
      Perks: "Auto-Earn on idle assets",
    },
  },
  {
    name: "COCA",
    description: "Global non-custodial Visa card with direct-pair FX advantages, cashback, and APY features.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0% on direct pairs, 0%-1.5% on indirect pairs",
      Rewards: "Up to 8% cashback",
      Perks: "APY features",
    },
  },
  {
    name: "Coinbase Card",
    description: "US custodial Visa card with free annual fee and up to 4% cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "United States",
      "Annual fee": "Free",
      Rewards: "Up to 4% cashback",
    },
  },
  {
    name: "Cryptocom",
    description: "Global custodial Visa card with tier-based benefits, CRO signup bonus, and travel perks.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Global",
      "Annual fee": "Staking/tier-based",
      Rewards: "Up to 8% cashback",
      "Signup bonus": "$25 in CRO",
      Perks: "Lounge access, travel perks, tiered benefits",
    },
  },
  {
    name: "Cypher",
    description: "Global non-custodial Visa card with basic and premium tiers and high listed cashback potential.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "$0 Basic or $199 Premium",
      "FX fees": "0.75%-1.75%",
      Rewards: "Up to 35% cashback",
      "Signup bonus": "100 CYPR with referral code",
    },
  },
  {
    name: "Deblock",
    description: "European non-custodial Visa card with 0% FX, premium option, and signup premium bonus.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Europe",
      "Annual fee": "Free or around EUR 10/month",
      "FX fees": "0%",
      Rewards: "Up to 1% cashback",
      "Signup bonus": "3 months Premium",
    },
  },
  {
    name: "Fiat24",
    description: "Hybrid Mastercard-style account for Europe, Asia, Oceania, and North America with no direct cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Hybrid",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "Fold",
    description: "US custodial Visa card centered on BTC rewards and sats signup incentives.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "United States",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 15% cashback in BTC",
      "Signup bonus": "Around 5,000 sats",
    },
  },
  {
    name: "Gemini Card",
    description: "US custodial Mastercard with no annual or FX fees and up to 4% cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Custodial",
      Regions: "United States",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 4% cashback",
    },
  },
  {
    name: "Gnosis Pay",
    description: "European self-custody Visa card with no annual or FX fees and up to 5% cashback.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 5% cashback",
    },
  },
  {
    name: "imToken Card",
    description: "Non-custodial Mastercard for multiple regions with usually 0% FX and no direct cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free",
      "FX fees": "Usually 0%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "Kleos",
    description: "European self-custody Visa card with tiered annual pricing, vault rewards, fee discounts, and events.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "Europe",
      "Annual fee": "Free to EUR 120",
      "FX fees": "0.5%-1.5%",
      Rewards: "No direct cashback",
      Perks: "Vault rewards, fee discounts, events, travel-style perks",
    },
  },
  {
    name: "Kripicard",
    description: "Global self-custody Visa card with low annual fee range and no FX fee.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "Global",
      "Annual fee": "$0-$18",
      "FX fees": "0%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "Ledger CL",
    description: "European self-custody Visa card connected to the Ledger ecosystem with up to 1% cashback.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "1.75%",
      Rewards: "Up to 1% cashback",
    },
  },
  {
    name: "Lemon Cash",
    description: "Argentina-focused custodial Visa card with free annual fee and up to 2% cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Argentina",
      "Annual fee": "Free",
      Rewards: "Up to 2% cashback",
    },
  },
  {
    name: "Liminal",
    description: "Virtual account and local rails product with non-custodial design, DeFi yield, AI agent, and tokenized equities.",
    details: {
      "Product type": "Virtual account / local rails",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0.1%-0.45%",
      Rewards: "No direct cashback",
      Perks: "DeFi yield, AI agent, tokenized equities",
    },
  },
  {
    name: "MetaMask Card",
    description: "Self-custody Mastercard spanning the US, LATAM, and Europe with rewards points and premium tier option.",
    details: {
      Network: "Mastercard",
      Custody: "Self-custody",
      Regions: "United States, LATAM, Europe",
      "Annual fee": "Free virtual or $199 Premium",
      "FX fees": "0%",
      Rewards: "Up to 3% cashback",
      Perks: "MetaMask rewards points",
    },
  },
  {
    name: "Moto",
    description: "Global non-custodial Visa card with tiered FX coverage, travel perks, and an airdrop angle.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "TBA",
      "FX fees": "Standard Visa FX on Access tier, first $10,000 covered on Private tier",
      Rewards: "Up to 5% cashback",
      Perks: "Lounge/travel perks, airdrop angle",
    },
  },
  {
    name: "Nexo Card",
    description: "European custodial Mastercard with balance interest, ATM benefits, and up to 2% cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0.2%-2.5%",
      Rewards: "Up to 2% cashback",
      Perks: "Interest on balances, ATM benefits",
    },
  },
  {
    name: "Oobit",
    description: "Non-custodial Visa card available across Europe, the US, Brazil, and South Africa with welcome bonus.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Europe, United States, Brazil, South Africa",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "Up to 10% cashback",
      "Signup bonus": "Welcome bonus",
    },
  },
  {
    name: "Pexx",
    description: "Global custodial Visa/Mastercard option with free annual fee and up to 1% cashback.",
    details: {
      Network: "Visa/Mastercard",
      Custody: "Custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "2.6%",
      Rewards: "Up to 1% cashback",
    },
  },
  {
    name: "Picnic",
    description: "Brazil-focused self-custody Visa card with low FX range and a signup bonus.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "Brazil",
      "Annual fee": "Free",
      "FX fees": "0%-0.5%",
      Rewards: "No direct cashback",
      "Signup bonus": "$10",
    },
  },
  {
    name: "Plutus",
    description: "European non-custodial Visa card with PLU bonus, merchant perks, and high listed cashback.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 9% cashback",
      "Signup bonus": "$10 in PLU",
      Perks: "Monthly merchant perks",
    },
  },
  {
    name: "Ready",
    description: "Global self-custody Mastercard with free annual fee and up to 3% cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Self-custody",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0%-1%",
      Rewards: "Up to 3% cashback",
    },
  },
  {
    name: "Solid",
    description: "Global non-custodial Visa card with crypto cashback plus points.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "Up to 3% crypto cashback + points",
    },
  },
  {
    name: "Safe",
    description: "Non-custodial Mastercard for Europe, Asia, Oceania, and North America with no direct cashback.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "SavePay",
    description: "Non-custodial Mastercard with broad regional support and standard FX or crypto-to-fiat marks.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free or around $40",
      "FX fees": "Standard FX/crypto-to-fiat marks",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "TapX",
    description: "Global self-custody Visa/Mastercard card with no annual or FX fees listed.",
    details: {
      Network: "Visa/Mastercard",
      Custody: "Self-custody",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0%",
    },
  },
  {
    name: "THORWallet",
    description: "Non-custodial Mastercard for Europe, Asia, Oceania, and North America with low FX range.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free",
      "FX fees": "0%-1%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "TokenPocket",
    description: "Non-custodial Visa card with broad regional availability and low FX fees.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free",
      "FX fees": "Low FX fees",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "Tria",
    description: "Global non-custodial Visa card with flexible FX range, cashback, and token rewards.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0%-3%",
      Rewards: "Up to 6% cashback",
      Perks: "Token rewards",
    },
  },
  {
    name: "Tuyo",
    description: "Self-custody Visa card for USA, Europe, and global users with 1% FX and no direct cashback.",
    details: {
      Network: "Visa",
      Custody: "Self-custody",
      Regions: "USA, Europe, Global",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "No direct cashback",
    },
  },
  {
    name: "UGLYCASH",
    description: "Hybrid Visa card with global, LATAM, USA, and Africa availability, APY, and social trading-style perks.",
    details: {
      Network: "Visa",
      Custody: "Hybrid",
      Regions: "Global, LATAM, USA, Africa",
      "Annual fee": "Free",
      "FX fees": "1%",
      Rewards: "Up to 6% cashback",
      Perks: "APY, social/copy-trading style features",
    },
  },
  {
    name: "UR",
    description: "Non-custodial Mastercard with broad regional support, off-ramp promos, USDe rewards, and broad token coverage.",
    details: {
      Network: "Mastercard",
      Custody: "Non-custodial",
      Regions: "Europe, Asia, Oceania, North America",
      "Annual fee": "Free or around $24/month",
      Rewards: "No direct cashback",
      Perks: "Off-ramp promos, USDe rewards, broad token coverage",
    },
  },
  {
    name: "Wayex",
    description: "Global custodial Visa card with automatic rewards and different USD versus non-USD spend FX treatment.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0% on USD spend, 1.5% on non-USD spend",
      Rewards: "Automatic rewards",
    },
  },
  {
    name: "WhiteBIT Card",
    description: "European custodial Visa card with no annual or FX fees and up to 10% BTC cashback.",
    details: {
      Network: "Visa",
      Custody: "Custodial",
      Regions: "Europe",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 10% BTC cashback",
    },
  },
  {
    name: "Wirex",
    description: "Global custodial Mastercard with no annual or FX fees, Cryptoback rewards, and WXT signup bonus.",
    details: {
      Network: "Mastercard",
      Custody: "Custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "0%",
      Rewards: "Up to 8% Cryptoback",
      "Signup bonus": "1,000 WXT",
    },
  },
  {
    name: "Zypto",
    description: "Global non-custodial Visa card with lifestyle and travel benefits, concierge, and up to 1% cashback.",
    details: {
      Network: "Visa",
      Custody: "Non-custodial",
      Regions: "Global",
      "Annual fee": "Free",
      "FX fees": "1.75%-2.75%",
      Rewards: "Up to 1% cashback",
      Perks: "Concierge, travel, lifestyle benefits",
    },
  },
];

const sourceUrl = "https://x.com/Defi_Warhol/status/2057122749345153319";

export default function CardListPage() {
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCards = useMemo(() => {
    if (!normalizedSearch) return cards;

    return cards.filter((card) => card.name.toLowerCase().includes(normalizedSearch));
  }, [normalizedSearch]);

  return (
    <main className="min-h-screen bg-surface text-ink">
      <CryptoTicker />

      <nav className="mx-auto grid min-h-[76px] w-[min(1590px,calc(100%_-_48px))] items-center gap-4 border-b border-line py-[18px] sm:flex sm:justify-between max-sm:w-[calc(100%_-_28px)]">
        <div className="flex items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-3 font-extrabold" href="/">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-gradient-to-br from-brand to-[#35d2b3] text-white">
              C
            </span>
            <span>Crypto Card Calculator</span>
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel text-ink shadow-[0_8px_24px_rgb(20_20_20/0.06)] sm:hidden"
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <MenuGlyph open={isMobileMenuOpen} />
          </button>
        </div>

        <div
          className={`gap-2.5 sm:flex ${
            isMobileMenuOpen ? "grid" : "hidden"
          } max-sm:rounded-2xl max-sm:border max-sm:border-line max-sm:bg-panel max-sm:p-3 max-sm:shadow-[0_14px_32px_rgb(20_20_20/0.08)]`}
        >
          <Link
            className="rounded-xl border border-line bg-panel px-4 py-2.5 text-center font-bold shadow-[0_8px_24px_rgb(20_20_20/0.06)]"
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Calculator
          </Link>
          <a
            className="rounded-xl border border-line bg-panel px-4 py-2.5 text-center font-bold text-brand shadow-[0_8px_24px_rgb(20_20_20/0.06)]"
            href={sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Source article
          </a>
        </div>
      </nav>

      <section className="mx-auto w-[min(1590px,calc(100%_-_48px))] py-14 max-sm:w-[calc(100%_-_28px)] max-sm:py-8">
        <div className="mb-8 grid gap-6 rounded-[28px] border border-line bg-[linear-gradient(145deg,rgb(var(--panel)/0.95),rgb(var(--panel)/0.78))] p-8 max-sm:p-5">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">
              Card List
            </p>
            <h1 className="max-w-[880px] text-[clamp(40px,5vw,76px)] font-extrabold leading-none">
              Crypto cards separated by product, custody, fees, and rewards.
            </h1>
          </div>
          <p className="max-w-[900px] text-lg font-semibold leading-8 text-muted">
            Based on DeFi Warhol&apos;s article &quot;The Only Neobank List You&apos;ll Ever Need&quot;.
            Each card below keeps the source details grouped into a scannable UI for comparison.
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
                Search by card name
              </span>
              <div className="flex min-h-[54px] items-center rounded-xl border border-line bg-panelSoft px-4">
                <input
                  className="w-full bg-transparent text-[17px] font-extrabold outline-none placeholder:text-muted/60"
                  placeholder="Search Etherfi, KAST, RedotPay..."
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </label>

            <div className="rounded-xl border border-line bg-panel px-4 py-3 text-sm font-extrabold text-muted">
              {filteredCards.length} of {cards.length} cards
            </div>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-line bg-panel p-8 text-center">
            <h2 className="text-2xl font-extrabold">No cards found</h2>
            <p className="mt-2 font-semibold text-muted">Try another card name.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((card) => (
            <article
              className="grid gap-5 rounded-[18px] border border-line bg-panel p-5 shadow-[0_18px_42px_rgb(20_20_20/0.05)]"
              key={card.name}
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-extrabold">{card.name}</h2>
                  <span className="rounded-full bg-panelSoft px-3 py-1 text-xs font-extrabold text-muted">
                    {card.details.Network ?? card.details["Product type"] ?? "Card"}
                  </span>
                </div>
                <p className="font-semibold leading-7 text-muted">{card.description}</p>
              </div>

              <dl className="grid gap-2">
                {Object.entries(card.details).map(([label, value]) => (
                  <div
                    className="grid grid-cols-[118px_1fr] gap-3 rounded-xl border border-line bg-panelSoft p-3"
                    key={label}
                  >
                    <dt className="text-xs font-extrabold uppercase tracking-[0.04em] text-muted">{label}</dt>
                    <dd className="text-sm font-extrabold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[10px] h-0.5 w-5 rounded-full bg-current transition ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[17px] h-0.5 w-5 rounded-full bg-current transition ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}
