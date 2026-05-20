"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type FormState = {
  cardName: string;
  purchaseBrl: string;
  usdcCharged: string;
  dollarRate: string;
  cashbackUsd: string;
};

type Purchase = {
  id: string;
  createdAt: string;
  cardName: string;
  purchaseBrl: number;
  usdcCharged: number;
  dollarRate: number;
  cashbackUsd: number;
  chargedBrl: number;
  cashbackBrl: number;
  finalCost: number;
  netGain: number;
  netPercent: number;
};

type Language = "pt-BR" | "en";

const copy = {
  "pt-BR": {
    themeLight: "Claro",
    themeDark: "Escuro",
    switchToLight: "Alternar para modo claro",
    switchToDark: "Alternar para modo escuro",
    copyResult: "Copiar resultado",
    copied: "Copiado",
    clear: "Limpar",
    eyebrow: "Compra cripto x custo real",
    title: "Compare o preço real da sua compra.",
    subtitle:
      "Informe o valor em reais, o USDC descontado, o dolar atual e o cashback recebido para ver o custo final e o ganho liquido.",
    cardName: "Nome do cartão",
    cardPlaceholder: "Ex: Ether.fi, OKX, Kast",
    purchaseBrl: "Valor da compra em reais",
    usdcCharged: "USDC descontado",
    dollarRate: "Dolar atual",
    cashbackUsd: "Cashback em dolar",
    savePurchase: "Registrar compra",
    saved: "Compra registrada",
    unnamedCard: "Cartao sem nome",
    fillPurchase: "Preencha a compra",
    waiting: "Aguardando valores",
    gained: "Voce ganhou na compra",
    paidMore: "Voce pagou mais caro",
    breakEven: "Compra empatada",
    netResult: "Resultado liquido",
    onPurchase: "sobre a compra",
    chargedCost: "Custo cobrado",
    cashbackBrl: "Cashback BRL",
    finalCost: "Custo final",
    idealUsdc: "USDC ideal",
    diffNoCashback: "Diferenca sem cashback",
    effectiveRate: "Taxa efetiva",
    summaryEyebrow: "Resumo da compra",
    finalReading: "Leitura final",
    paidActually: "Voce pagou de fato",
    comparedToBrl: "Comparado ao preço em reais",
    totalGain: "Ganho total",
    savedPurchases: "Compras salvas",
    localHistory: "Histórico local",
    clearHistory: "Apagar histórico",
    emptyHistory: "Nenhuma compra registrada ainda.",
    card: "Cartao",
    purchase: "Compra",
    gain: "Ganho",
    deletePurchase: "Excluir compra",
    clipboardCard: "Cartao",
    clipboardPurchase: "Compra em reais",
    clipboardUsdc: "USDC descontado",
    clipboardDollar: "Dolar atual",
    clipboardFinalCost: "Custo final",
    clipboardNetGain: "Ganho liquido",
  },
  en: {
    themeLight: "Light",
    themeDark: "Dark",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    copyResult: "Copy result",
    copied: "Copied",
    clear: "Clear",
    eyebrow: "Crypto purchase x real cost",
    title: "Compare the real cost of your purchase.",
    subtitle:
      "Enter the BRL purchase amount, USDC charged, current dollar rate, and cashback received to see final cost and net gain.",
    cardName: "Card name",
    cardPlaceholder: "Ex: Ether.fi, OKX, Kast",
    purchaseBrl: "Purchase amount in BRL",
    usdcCharged: "USDC charged",
    dollarRate: "Current dollar rate",
    cashbackUsd: "Cashback in dollars",
    savePurchase: "Save purchase",
    saved: "Purchase saved",
    unnamedCard: "Unnamed card",
    fillPurchase: "Fill purchase data",
    waiting: "Waiting for values",
    gained: "You gained on this purchase",
    paidMore: "You paid more",
    breakEven: "Break even",
    netResult: "Net result",
    onPurchase: "on purchase",
    chargedCost: "Charged cost",
    cashbackBrl: "Cashback BRL",
    finalCost: "Final cost",
    idealUsdc: "Ideal USDC",
    diffNoCashback: "Difference without cashback",
    effectiveRate: "Effective rate",
    summaryEyebrow: "Purchase summary",
    finalReading: "Final reading",
    paidActually: "You actually paid",
    comparedToBrl: "Compared to BRL price",
    totalGain: "Total gain",
    savedPurchases: "Saved purchases",
    localHistory: "Local history",
    clearHistory: "Clear history",
    emptyHistory: "No purchases saved yet.",
    card: "Card",
    purchase: "Purchase",
    gain: "Gain",
    deletePurchase: "Delete purchase",
    clipboardCard: "Card",
    clipboardPurchase: "Purchase in BRL",
    clipboardUsdc: "USDC charged",
    clipboardDollar: "Current dollar rate",
    clipboardFinalCost: "Final cost",
    clipboardNetGain: "Net gain",
  },
} satisfies Record<Language, Record<string, string>>;

const purchasesStorageKey = "crypto-card-calculator:purchases";
const themeStorageKey = "crypto-card-calculator:theme";
const languageStorageKey = "crypto-card-calculator:language";

const initialForm: FormState = {
  cardName: "",
  purchaseBrl: "",
  usdcCharged: "",
  dollarRate: "",
  cashbackUsd: "",
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function numericValue(value: string) {
  return Number.parseFloat(value.replace(",", ".")) || 0;
}

function signedMoney(value: number) {
  return `${value > 0 ? "+" : ""}${money.format(value)}`;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<Language>("pt-BR");
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [needsValues, setNeedsValues] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const storedPurchases = localStorage.getItem(purchasesStorageKey);
    const storedTheme = localStorage.getItem(themeStorageKey);
    const storedLanguage = localStorage.getItem(languageStorageKey);

    if (storedPurchases) {
      try {
        setPurchases(JSON.parse(storedPurchases));
      } catch {
        setPurchases([]);
      }
    }

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    if (storedLanguage === "pt-BR" || storedLanguage === "en") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(purchasesStorageKey, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(languageStorageKey, language);
  }, [language]);

  const result = useMemo(() => {
    const cardName = form.cardName.trim() || t.unnamedCard;
    const purchaseBrl = numericValue(form.purchaseBrl);
    const usdcCharged = numericValue(form.usdcCharged);
    const dollarRate = numericValue(form.dollarRate);
    const cashbackUsd = numericValue(form.cashbackUsd);
    const chargedBrl = usdcCharged * dollarRate;
    const cashbackBrl = cashbackUsd * dollarRate;
    const finalCost = chargedBrl - cashbackBrl;
    const idealUsdc = dollarRate > 0 ? purchaseBrl / dollarRate : 0;
    const grossDiff = purchaseBrl - chargedBrl;
    const grossDiffPercent = purchaseBrl > 0 ? grossDiff / purchaseBrl : 0;
    const netGain = purchaseBrl - finalCost;
    const netPercent = purchaseBrl > 0 ? netGain / purchaseBrl : 0;
    const effectiveRate = usdcCharged > 0 ? finalCost / usdcCharged : 0;

    return {
      cardName,
      purchaseBrl,
      usdcCharged,
      dollarRate,
      cashbackUsd,
      chargedBrl,
      cashbackBrl,
      finalCost,
      idealUsdc,
      grossDiff,
      grossDiffPercent,
      netGain,
      netPercent,
      effectiveRate,
    };
  }, [form, t.unnamedCard]);

  const statusText = useMemo(() => {
    if (needsValues) return t.fillPurchase;
    if (!result.purchaseBrl || !result.dollarRate) return t.waiting;
    if (result.netGain > 0) return t.gained;
    if (result.netGain < 0) return t.paidMore;
    return t.breakEven;
  }, [needsValues, result.dollarRate, result.netGain, result.purchaseBrl, t]);

  const statusClass =
    !needsValues && result.netGain > 0
      ? "bg-success text-white"
      : !needsValues && result.netGain < 0
        ? "bg-danger text-white"
        : "bg-[rgb(var(--result-bg))] text-[rgb(var(--result-text))]";

  function updateField(field: keyof FormState, value: string) {
    setNeedsValues(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearForm() {
    setForm(initialForm);
    setNeedsValues(false);
  }

  function savePurchase() {
    if (!result.purchaseBrl || !result.usdcCharged || !result.dollarRate) {
      setNeedsValues(true);
      return;
    }

    setPurchases((current) => [
      {
        id: createId(),
        createdAt: new Date().toISOString(),
        cardName: result.cardName,
        purchaseBrl: result.purchaseBrl,
        usdcCharged: result.usdcCharged,
        dollarRate: result.dollarRate,
        cashbackUsd: result.cashbackUsd,
        chargedBrl: result.chargedBrl,
        cashbackBrl: result.cashbackBrl,
        finalCost: result.finalCost,
        netGain: result.netGain,
        netPercent: result.netPercent,
      },
      ...current,
    ]);

    setSaveFeedback(true);
    window.setTimeout(() => setSaveFeedback(false), 1400);
  }

  async function copyResult() {
    const text = [
      "Crypto Card Calculator",
      `${t.clipboardCard}: ${result.cardName}`,
      `${t.clipboardPurchase}: ${money.format(result.purchaseBrl)}`,
      `${t.clipboardUsdc}: ${result.usdcCharged.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}`,
      `${t.clipboardDollar}: ${money.format(result.dollarRate)}`,
      `Cashback: ${money.format(result.cashbackBrl)}`,
      `${t.clipboardFinalCost}: ${money.format(result.finalCost)}`,
      `${t.clipboardNetGain}: ${signedMoney(result.netGain)} (${percent.format(result.netPercent)})`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 1400);
    } catch {
      window.alert(text);
    }
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <nav className="mx-auto flex min-h-[76px] w-[min(1590px,calc(100%_-_48px))] items-center justify-between gap-4 border-b border-line py-[18px] max-sm:w-[calc(100%_-_28px)] max-sm:flex-col max-sm:items-stretch">
        <div className="inline-flex items-center gap-3 font-extrabold">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-gradient-to-br from-brand to-[#35d2b3] text-white">
            C
          </span>
          <span>Crypto Card Calculator</span>
        </div>

        <div className="flex gap-2.5 max-sm:grid">
          <div className="grid grid-cols-2 rounded-xl border border-line bg-panel p-1 font-extrabold shadow-[0_8px_24px_rgb(20_20_20/0.06)]">
            <button
              className={`rounded-lg px-3 py-2 ${language === "pt-BR" ? "bg-brand text-white" : "text-ink"}`}
              type="button"
              onClick={() => setLanguage("pt-BR")}
            >
              PT-BR
            </button>
            <button
              className={`rounded-lg px-3 py-2 ${language === "en" ? "bg-brand text-white" : "text-ink"}`}
              type="button"
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
          <button
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-panel px-3.5 py-1.5 pl-1.5 font-extrabold shadow-[0_8px_24px_rgb(20_20_20/0.06)]"
            type="button"
            aria-label={theme === "dark" ? t.switchToLight : t.switchToDark}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span
              className={`h-[30px] w-[30px] rounded-full ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[#f7d65a] to-[#ff9f43]"
                  : "bg-gradient-to-br from-[#111] to-[#4a4a53]"
              }`}
            />
            <span>{theme === "dark" ? t.themeLight : t.themeDark}</span>
          </button>
          <Button onClick={copyResult}>{copyFeedback ? t.copied : t.copyResult}</Button>
          <Button onClick={clearForm}>{t.clear}</Button>
        </div>
      </nav>

      <section className="mx-auto grid w-[min(1590px,calc(100%_-_48px))] grid-cols-[minmax(0,1.06fr)_minmax(320px,0.74fr)] gap-8 py-14 max-lg:w-[min(680px,calc(100%_-_48px))] max-lg:grid-cols-1 max-lg:py-8 max-sm:w-[calc(100%_-_28px)]">
        <div className="rounded-[28px] border border-line bg-[linear-gradient(145deg,rgb(var(--panel)/0.95),rgb(var(--panel)/0.78))] p-8 max-sm:p-5">
          <div className="relative pr-32 max-sm:pr-0">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">
              {t.eyebrow}
            </p>
            <div className="absolute right-0 top-1.5 h-[74px] w-[118px] rotate-[10deg] rounded-[18px] bg-gradient-to-br from-[#22c5e8] to-[#7955e8] shadow-[0_16px_34px_rgb(85_82_210/0.22)] max-sm:static max-sm:mb-7 max-sm:ml-auto" />
            <h1 className="mb-3 max-w-[560px] text-[clamp(38px,5vw,64px)] font-extrabold leading-none">
              {t.title}
            </h1>
            <p className="mb-8 max-w-[520px] leading-7 text-muted">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
            <Field label={t.cardName} prefix="Card" className="col-span-full">
              <input
                className="w-full bg-transparent text-[17px] font-extrabold outline-none placeholder:text-muted/60"
                value={form.cardName}
                placeholder={t.cardPlaceholder}
                onChange={(event) => updateField("cardName", event.target.value)}
              />
            </Field>
            <NumberField
              id="purchaseBrl"
              label={t.purchaseBrl}
              prefix="R$"
              value={form.purchaseBrl}
              placeholder="0,00"
              onChange={(value) => updateField("purchaseBrl", value)}
            />
            <NumberField
              id="usdcCharged"
              label={t.usdcCharged}
              prefix="USDC"
              value={form.usdcCharged}
              placeholder="0,0000"
              onChange={(value) => updateField("usdcCharged", value)}
            />
            <NumberField
              id="dollarRate"
              label={t.dollarRate}
              prefix="R$"
              value={form.dollarRate}
              placeholder="0,00"
              onChange={(value) => updateField("dollarRate", value)}
            />
            <NumberField
              id="cashbackUsd"
              label={t.cashbackUsd}
              prefix="US$"
              value={form.cashbackUsd}
              placeholder="0,00"
              onChange={(value) => updateField("cashbackUsd", value)}
            />
            <button
              className="col-span-full min-h-[54px] rounded-xl bg-gradient-to-br from-brand to-[#20c7aa] font-extrabold text-white shadow-[0_14px_30px_rgb(99_91_255/0.24)] active:translate-y-px"
              type="button"
              onClick={savePurchase}
            >
              {saveFeedback ? t.saved : t.savePurchase}
            </button>
          </div>
        </div>

        <aside className="grid content-start gap-[18px]" aria-live="polite">
          <div className="grid min-h-[142px] content-center gap-2 rounded-3xl bg-[rgb(var(--result-bg))] p-7 text-[rgb(var(--result-text))] shadow-[0_18px_42px_rgb(20_20_20/0.18)]">
            <span className="text-xs font-extrabold text-[rgb(var(--result-muted))]">{t.netResult}</span>
            <strong className={`text-[clamp(36px,5vw,54px)] leading-none ${toneClass(result.netGain)}`}>
              {signedMoney(result.netGain)}
            </strong>
            <small className="font-bold text-[rgb(var(--result-muted))]">
              {percent.format(result.netPercent)} {t.onPurchase}
            </small>
          </div>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Summary label={t.chargedCost} value={money.format(result.chargedBrl)} />
            <Summary label={t.cashbackBrl} value={money.format(result.cashbackBrl)} />
            <Summary label={t.finalCost} value={money.format(result.finalCost)} />
            <Summary
              label={t.idealUsdc}
              value={result.idealUsdc.toLocaleString("pt-BR", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-[18px] border border-line bg-panel p-5 max-sm:grid-cols-1">
            <SummaryInline
              label={t.diffNoCashback}
              value={`${signedMoney(result.grossDiff)} (${percent.format(result.grossDiffPercent)})`}
              tone={result.grossDiff}
            />
            <SummaryInline label={t.effectiveRate} value={money.format(result.effectiveRate)} />
          </div>
        </aside>
      </section>

      <section className="mx-auto mb-6 w-[min(1590px,calc(100%_-_48px))] rounded-[18px] border border-line bg-panel p-6 max-lg:w-[min(680px,calc(100%_-_48px))] max-sm:w-[calc(100%_-_28px)] max-sm:p-5">
        <div className="mb-[18px] flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">{t.summaryEyebrow}</p>
            <h2 className="text-[28px] font-extrabold">{t.finalReading}</h2>
          </div>
          <span className={`inline-flex min-h-[34px] items-center whitespace-nowrap rounded-full px-3 text-xs font-extrabold ${statusClass}`}>
            {statusText}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <Summary label={t.paidActually} value={money.format(result.finalCost)} />
          <Summary label={t.comparedToBrl} value={signedMoney(result.netGain)} tone={result.netGain} />
          <Summary
            label={t.totalGain}
            value={`${signedMoney(result.netGain)} (${percent.format(result.netPercent)})`}
            tone={result.netGain}
          />
        </div>
      </section>

      <section className="mx-auto mb-14 w-[min(1590px,calc(100%_-_48px))] rounded-[18px] border border-line bg-panel p-6 max-lg:w-[min(680px,calc(100%_-_48px))] max-sm:w-[calc(100%_-_28px)] max-sm:p-5">
        <div className="mb-[18px] flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">{t.savedPurchases}</p>
            <h2 className="text-[28px] font-extrabold">{t.localHistory}</h2>
          </div>
          <Button danger onClick={() => setPurchases([])}>
            {t.clearHistory}
          </Button>
        </div>

        <div className="grid gap-3">
          {purchases.length === 0 ? (
            <p className="m-0 rounded-2xl border border-dashed border-line bg-panel p-7 text-center font-extrabold text-muted">
              {t.emptyHistory}
            </p>
          ) : (
            purchases.map((purchase) => (
              <article
                className="grid grid-cols-[minmax(160px,1.2fr)_repeat(4,minmax(110px,1fr))_auto] items-center gap-3 rounded-2xl border border-line bg-panel p-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
                key={purchase.id}
              >
                <div className="min-w-0 max-lg:col-span-full">
                  <HistoryLabel>{t.card}</HistoryLabel>
                  <strong className="block [overflow-wrap:anywhere] text-[17px]">{purchase.cardName}</strong>
                  <small className="font-bold text-muted">{formatDate(purchase.createdAt)}</small>
                </div>
                <HistoryMetric label={t.purchase} value={money.format(purchase.purchaseBrl)} />
                <HistoryMetric
                  label="USDC"
                  value={purchase.usdcCharged.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}
                />
                <HistoryMetric label={t.finalCost} value={money.format(purchase.finalCost)} />
                <HistoryMetric
                  label={t.gain}
                  value={`${signedMoney(purchase.netGain)} (${percent.format(purchase.netPercent)})`}
                  tone={purchase.netGain}
                />
                <button
                  className="h-[38px] w-[38px] rounded-xl border border-line bg-panel font-extrabold text-danger"
                  type="button"
                  aria-label={t.deletePurchase}
                  onClick={() => setPurchases((current) => current.filter((item) => item.id !== purchase.id))}
                >
                  X
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Button({
  children,
  danger,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl border border-line bg-panel px-4 py-2.5 font-bold shadow-[0_8px_24px_rgb(20_20_20/0.06)] active:translate-y-px ${
        danger ? "text-danger" : "text-ink"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  prefix,
  children,
  className = "",
}: {
  label: string;
  prefix: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-xs font-extrabold text-muted">{label}</span>
      <div className="flex min-h-[54px] items-center gap-2.5 rounded-xl border border-line bg-panelSoft px-3.5">
        <span className="text-[13px] font-extrabold text-muted">{prefix}</span>
        {children}
      </div>
    </label>
  );
}

function NumberField({
  id,
  label,
  prefix,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  prefix: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} prefix={prefix}>
      <input
        id={id}
        className="w-full bg-transparent text-[17px] font-extrabold outline-none placeholder:text-muted/60"
        inputMode="decimal"
        min="0"
        placeholder={placeholder}
        step="0.0001"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div className="grid min-h-[92px] content-center gap-2 rounded-[18px] border border-line bg-panel p-[18px]">
      <span className="text-xs font-extrabold text-muted">{label}</span>
      <strong className={`text-xl ${toneClass(tone)}`}>{value}</strong>
    </div>
  );
}

function SummaryInline({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-extrabold text-muted">{label}</span>
      <strong className={`text-xl ${toneClass(tone)}`}>{value}</strong>
    </div>
  );
}

function HistoryLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted">
      {children}
    </span>
  );
}

function HistoryMetric({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div>
      <HistoryLabel>{label}</HistoryLabel>
      <strong className={`block text-[15px] ${toneClass(tone)}`}>{value}</strong>
    </div>
  );
}

function toneClass(value?: number) {
  if (!value) return "";
  return value > 0 ? "text-success" : "text-danger";
}
