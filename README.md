# Crypto Card Calculator

Crypto Card Calculator é uma aplicação em Next.js para comparar o custo real de compras feitas com cartões cripto. A ideia é responder uma pergunta simples: depois de converter o valor pago em BRL, o USDC descontado, a cotação do dólar e o cashback recebido, a compra saiu melhor ou pior do que pagar diretamente em reais?

O projeto também inclui uma lista pesquisável de cartões cripto e um ticker com as 10 principais criptomoedas em dólar.

## Principais Recursos

- Calculadora de custo real para compras com cartão cripto.
- Entrada de valor da compra em BRL, USDC descontado, cotação do dólar e cashback em USD.
- Cálculo de custo cobrado, cashback convertido em BRL, custo final, USDC ideal, taxa efetiva e diferença sem cashback.
- Resumo visual da compra em formato de cartão, mostrando ganho ou perda em reais e porcentagem.
- Registro de compras salvo localmente no navegador via `localStorage`.
- Cotação USD/BRL em tempo real via Google Finance.
- Cotação histórica por data e hora via TradingView, usando o símbolo `FX_IDC:USDBRL`.
- Ticker infinito no topo com preço em dólar das top 10 criptomoedas via CoinGecko.
- Página `Card List` com cartões cripto, descrições, custódia, redes, taxas e recompensas.
- Busca por nome de cartão na lista.
- Suporte a PT-BR e inglês, com PT-BR como idioma padrão.
- Modo claro e modo escuro.
- Layout responsivo, com conteúdo centralizado e largura máxima de `1590px` no desktop.
- Preparado para deploy com Nixpacks.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- App Router
- API Routes do Next.js

## Como a Calculadora Funciona

A calculadora usa os dados preenchidos pelo usuário para comparar o preço original da compra com o custo real após a cobrança em USDC e o cashback.

Campos principais:

- `Valor da compra em reais`: preço original da compra em BRL.
- `USDC descontado`: quanto foi debitado do cartão em USDC.
- `Dólar atual`: cotação usada para converter USDC para BRL.
- `Cashback em dólar`: cashback recebido em USD.
- `Nome do cartão`: nome opcional para salvar a compra no histórico local.

Cálculos:

- `Custo cobrado`: `USDC descontado * cotação do dólar`.
- `Cashback BRL`: `cashback em USD * cotação do dólar`.
- `Custo final`: `custo cobrado - cashback BRL`.
- `Ganho total`: `valor da compra em BRL - custo final`.
- `Percentual ganho/perdido`: `ganho total / valor da compra em BRL`.
- `Diferença sem cashback`: comparação antes de aplicar o cashback.
- `Taxa efetiva`: custo final dividido pelo USDC descontado.

## Fontes de Dados

### USD/BRL em tempo real

A rota `app/api/google-usd-brl/route.ts` consulta o Google Finance para buscar a cotação atual de USD/BRL.

Fonte usada:

- Google Finance: `USD-BRL`

### USD/BRL histórico por data e hora

Quando o usuário seleciona uma data e hora no modo histórico, a mesma rota consulta o feed público de candles do TradingView usando o símbolo `FX_IDC:USDBRL`. A API busca candles de 5 minutos e retorna a cotação mais próxima, com 4 casas decimais.

Fonte usada:

- TradingView: `FX_IDC:USDBRL`

### Top 10 criptomoedas

A rota `app/api/crypto-ticker/route.ts` usa CoinGecko para buscar as 10 maiores criptomoedas por market cap, com preço em USD e variação de 24 horas.

Fonte usada:

- CoinGecko Markets API

## Páginas

### `/`

Página principal da calculadora.

Inclui:

- Ticker de criptomoedas.
- Alternância de idioma.
- Alternância de tema.
- Cotação do dólar em tempo real ou histórica.
- Formulário de compra.
- Resumo visual da compra.
- Histórico local de compras registradas.

### `/card-list`

Página com a lista de cartões cripto baseada no artigo de DeFi Warhol.

Inclui:

- Cartões separados em cards individuais.
- Descrição resumida de cada produto.
- Rede, custódia, regiões, taxas, cashback e benefícios quando disponíveis.
- Busca por nome do cartão.
- Link para o artigo fonte.

Fonte da lista:

- [DeFi Warhol no X](https://x.com/Defi_Warhol/status/2057122749345153319)

## Armazenamento Local

O histórico de compras é salvo somente no navegador do usuário usando `localStorage`.

Chaves usadas:

- `crypto-card-calculator:purchases`
- `crypto-card-calculator:theme`
- `crypto-card-calculator:language`

Nenhum dado de compra é enviado para um banco de dados.

## Rodando Localmente

Requisitos:

- Node.js 22
- npm

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra:

```bash
http://127.0.0.1:3000
```

## Scripts

```bash
npm run dev
```

Inicia o servidor local de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Inicia a aplicação em modo produção após o build.

```bash
npm run lint
```

Executa o lint configurado no projeto.

## Deploy com Nixpacks

O projeto já inclui configuração para deploy com Nixpacks:

- `nixpacks.toml`
- `.nvmrc`
- `engines.node` no `package.json`

Fluxo configurado:

```bash
npm ci
npm run build
npm run start -- -H 0.0.0.0 -p ${PORT:-3000}
```

Em plataformas como Railway, Easypanel ou similares, use o builder padrão do Nixpacks e deixe a variável `PORT` ser gerenciada pela plataforma.

## Estrutura do Projeto

```text
app/
  api/
    crypto-ticker/
      route.ts
    google-usd-brl/
      route.ts
  card-list/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  CryptoTicker.tsx
```

## Observações

Este projeto é uma ferramenta de comparação e organização pessoal. As cotações vêm de fontes públicas e podem variar em relação à cotação final usada pelo emissor do cartão, exchange, processador de pagamento ou banco.

Os dados exibidos não são recomendação financeira.
