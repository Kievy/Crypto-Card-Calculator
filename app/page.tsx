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

const purchasesStorageKey = "crypto-card-calculator:purchases";
const themeStorageKey = "crypto-card-calculator:theme";

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
  const [saveLabel, setSaveLabel] = useState("Registrar compra");
  const [copyLabel, setCopyLabel] = useState("Copiar resultado");
  const [needsValues, setNeedsValues] = useState(false);

  useEffect(() => {
    const storedPurchases = localStorage.getItem(purchasesStorageKey);
    const storedTheme = localStorage.getItem(themeStorageKey);

    if (storedPurchases) {
      try {
        setPurchases(JSON.parse(storedPurchases));
      } catch {
        setPurchases([]);
      }
    }

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }

    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(purchasesStorageKey, JSON.stringify(purchases));
  }, [purchases]);

  const result = useMemo(() => {
    const cardName = form.cardName.trim() || "Cartao sem nome";
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
  }, [form]);

  const statusText = useMemo(() => {
    if (needsValues) return "Preencha a compra";
    if (!result.purchaseBrl || !result.dollarRate) return "Aguardando valores";
    if (result.netGain > 0) return "Voce ganhou na compra";
    if (result.netGain < 0) return "Voce pagou mais caro";
    return "Compra empatada";
  }, [needsValues, result.dollarRate, result.netGain, result.purchaseBrl]);

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

    setSaveLabel("Compra registrada");
    window.setTimeout(() => setSaveLabel("Registrar compra"), 1400);
  }

  async function copyResult() {
    const text = [
      "Crypto Card Calculator",
      `Cartao: ${result.cardName}`,
      `Compra em reais: ${money.format(result.purchaseBrl)}`,
      `USDC descontado: ${result.usdcCharged.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}`,
      `Dolar atual: ${money.format(result.dollarRate)}`,
      `Cashback: ${money.format(result.cashbackBrl)}`,
      `Custo final: ${money.format(result.finalCost)}`,
      `Ganho liquido: ${signedMoney(result.netGain)} (${percent.format(result.netPercent)})`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar resultado"), 1400);
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
          <button
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-panel px-3.5 py-1.5 pl-1.5 font-extrabold shadow-[0_8px_24px_rgb(20_20_20/0.06)]"
            type="button"
            aria-label={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span
              className={`h-[30px] w-[30px] rounded-full ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[#f7d65a] to-[#ff9f43]"
                  : "bg-gradient-to-br from-[#111] to-[#4a4a53]"
              }`}
            />
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <Button onClick={copyResult}>{copyLabel}</Button>
          <Button onClick={clearForm}>Limpar</Button>
        </div>
      </nav>

      <section className="mx-auto grid w-[min(1590px,calc(100%_-_48px))] grid-cols-[minmax(0,1.06fr)_minmax(320px,0.74fr)] gap-8 py-14 max-lg:w-[min(680px,calc(100%_-_48px))] max-lg:grid-cols-1 max-lg:py-8 max-sm:w-[calc(100%_-_28px)]">
        <div className="rounded-[28px] border border-line bg-[linear-gradient(145deg,rgb(var(--panel)/0.95),rgb(var(--panel)/0.78))] p-8 max-sm:p-5">
          <div className="relative pr-32 max-sm:pr-0">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">
              Compra cripto x custo real
            </p>
            <div className="absolute right-0 top-1.5 h-[74px] w-[118px] rotate-[10deg] rounded-[18px] bg-gradient-to-br from-[#22c5e8] to-[#7955e8] shadow-[0_16px_34px_rgb(85_82_210/0.22)] max-sm:static max-sm:mb-7 max-sm:ml-auto" />
            <h1 className="mb-3 max-w-[560px] text-[clamp(38px,5vw,64px)] font-extrabold leading-none">
              Compare o preço real da sua compra.
            </h1>
            <p className="mb-8 max-w-[520px] leading-7 text-muted">
              Informe o valor em reais, o USDC descontado, o dolar atual e o cashback recebido
              para ver o custo final e o ganho liquido.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
            <Field label="Nome do cartão" prefix="Card" className="col-span-full">
              <input
                className="w-full bg-transparent text-[17px] font-extrabold outline-none placeholder:text-muted/60"
                value={form.cardName}
                placeholder="Ex: Ether.fi, OKX, Kast"
                onChange={(event) => updateField("cardName", event.target.value)}
              />
            </Field>
            <NumberField
              id="purchaseBrl"
              label="Valor da compra em reais"
              prefix="R$"
              value={form.purchaseBrl}
              placeholder="0,00"
              onChange={(value) => updateField("purchaseBrl", value)}
            />
            <NumberField
              id="usdcCharged"
              label="USDC descontado"
              prefix="USDC"
              value={form.usdcCharged}
              placeholder="0,0000"
              onChange={(value) => updateField("usdcCharged", value)}
            />
            <NumberField
              id="dollarRate"
              label="Dolar atual"
              prefix="R$"
              value={form.dollarRate}
              placeholder="0,00"
              onChange={(value) => updateField("dollarRate", value)}
            />
            <NumberField
              id="cashbackUsd"
              label="Cashback em dolar"
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
              {saveLabel}
            </button>
          </div>
        </div>

        <aside className="grid content-start gap-[18px]" aria-live="polite">
          <div className="grid min-h-[142px] content-center gap-2 rounded-3xl bg-[rgb(var(--result-bg))] p-7 text-[rgb(var(--result-text))] shadow-[0_18px_42px_rgb(20_20_20/0.18)]">
            <span className="text-xs font-extrabold text-[rgb(var(--result-muted))]">Resultado liquido</span>
            <strong className={`text-[clamp(36px,5vw,54px)] leading-none ${toneClass(result.netGain)}`}>
              {signedMoney(result.netGain)}
            </strong>
            <small className="font-bold text-[rgb(var(--result-muted))]">
              {percent.format(result.netPercent)} sobre a compra
            </small>
          </div>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Summary label="Custo cobrado" value={money.format(result.chargedBrl)} />
            <Summary label="Cashback BRL" value={money.format(result.cashbackBrl)} />
            <Summary label="Custo final" value={money.format(result.finalCost)} />
            <Summary
              label="USDC ideal"
              value={result.idealUsdc.toLocaleString("pt-BR", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-[18px] border border-line bg-panel p-5 max-sm:grid-cols-1">
            <SummaryInline
              label="Diferenca sem cashback"
              value={`${signedMoney(result.grossDiff)} (${percent.format(result.grossDiffPercent)})`}
              tone={result.grossDiff}
            />
            <SummaryInline label="Taxa efetiva" value={money.format(result.effectiveRate)} />
          </div>
        </aside>
      </section>

      <section className="mx-auto mb-6 w-[min(1590px,calc(100%_-_48px))] rounded-[18px] border border-line bg-panel p-6 max-lg:w-[min(680px,calc(100%_-_48px))] max-sm:w-[calc(100%_-_28px)] max-sm:p-5">
        <div className="mb-[18px] flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">Resumo da compra</p>
            <h2 className="text-[28px] font-extrabold">Leitura final</h2>
          </div>
          <span className={`inline-flex min-h-[34px] items-center whitespace-nowrap rounded-full px-3 text-xs font-extrabold ${statusClass}`}>
            {statusText}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <Summary label="Voce pagou de fato" value={money.format(result.finalCost)} />
          <Summary label="Comparado ao preço em reais" value={signedMoney(result.netGain)} tone={result.netGain} />
          <Summary
            label="Ganho total"
            value={`${signedMoney(result.netGain)} (${percent.format(result.netPercent)})`}
            tone={result.netGain}
          />
        </div>
      </section>

      <section className="mx-auto mb-14 w-[min(1590px,calc(100%_-_48px))] rounded-[18px] border border-line bg-panel p-6 max-lg:w-[min(680px,calc(100%_-_48px))] max-sm:w-[calc(100%_-_28px)] max-sm:p-5">
        <div className="mb-[18px] flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-brand">Compras salvas</p>
            <h2 className="text-[28px] font-extrabold">Histórico local</h2>
          </div>
          <Button danger onClick={() => setPurchases([])}>
            Apagar histórico
          </Button>
        </div>

        <div className="grid gap-3">
          {purchases.length === 0 ? (
            <p className="m-0 rounded-2xl border border-dashed border-line bg-panel p-7 text-center font-extrabold text-muted">
              Nenhuma compra registrada ainda.
            </p>
          ) : (
            purchases.map((purchase) => (
              <article
                className="grid grid-cols-[minmax(160px,1.2fr)_repeat(4,minmax(110px,1fr))_auto] items-center gap-3 rounded-2xl border border-line bg-panel p-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
                key={purchase.id}
              >
                <div className="min-w-0 max-lg:col-span-full">
                  <HistoryLabel>Cartao</HistoryLabel>
                  <strong className="block [overflow-wrap:anywhere] text-[17px]">{purchase.cardName}</strong>
                  <small className="font-bold text-muted">{formatDate(purchase.createdAt)}</small>
                </div>
                <HistoryMetric label="Compra" value={money.format(purchase.purchaseBrl)} />
                <HistoryMetric
                  label="USDC"
                  value={purchase.usdcCharged.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}
                />
                <HistoryMetric label="Custo final" value={money.format(purchase.finalCost)} />
                <HistoryMetric
                  label="Ganho"
                  value={`${signedMoney(purchase.netGain)} (${percent.format(purchase.netPercent)})`}
                  tone={purchase.netGain}
                />
                <button
                  className="h-[38px] w-[38px] rounded-xl border border-line bg-panel font-extrabold text-danger"
                  type="button"
                  aria-label="Excluir compra"
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
