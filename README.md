# Burger District

Site de portfólio para uma hamburgueria fictícia: hero com hambúrguer 3D, vista explodida guiada pelo scroll, cardápio digital, personalizador 3D, carrinho e checkout demonstrativo com envio pelo WhatsApp.

> Projeto demonstrativo. Marca, endereço, contatos, preços, promoções e depoimentos são fictícios.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Three.js · GSAP + ScrollTrigger · Framer Motion · Lucide · Fontsource (fontes locais)

## Rodando

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # build de produção em dist/
npm run preview    # serve o build
```

## Estrutura

```
src/
  config/site.ts        → dados da marca (endereço, WhatsApp, horários, taxa de entrega)
  data/                 → cardápio, opções do personalizador, textos e depoimentos
  types/                → tipos do domínio
  context/              → carrinho (persistido em localStorage) e estado de UI
  hooks/                → scrollspy, trava de rolagem, movimento reduzido, adição rápida
  lib/                  → formatação BRL, horário de funcionamento, mensagem de WhatsApp
  three/                → motor 3D: ingredientes procedurais, BurgerModel, Stage, estúdio de renders
  components/
    three/              → hero 3D e visualizador do personalizador
    sections/           → Hero, História, Anatomia, Favoritos, Promoções, Experiência, Avaliações, Localização, Contato
    menu/               → cardápio, card e modal de produto
    builder/            → Monte seu burger
    cart/               → carrinho lateral e checkout
    layout/             → header, menu mobile, footer, toasts, cursor, preloader
    ui/                 → componentes reutilizáveis
scripts/render-products.mjs → gera as imagens dos produtos a partir dos modelos 3D
```

## Personalizar para um cliente real

- **Dados da loja**: edite `src/config/site.ts` (o número do WhatsApp recebe os pedidos).
- **Cardápio e preços**: `src/data/products.ts`.
- **Fotografia real**: coloque as fotos em `public/images/` e troque o campo `image` de cada produto (ex.: `images/bacon-rush.jpg`). Sem foto, o site usa os renders 3D de `public/renders/`.
- **Mapa real**: cole a URL de incorporação do Google Maps em `site.mapEmbedUrl`.

## Renders dos produtos

As imagens em `public/renders/` são geradas pelo mesmo código 3D do site (`src/three/studio.ts`), em um Chrome headless:

```bash
npm run build && npm run render:products && npm run build
```

Requer Google Chrome instalado (caminho configurável em `CHROME_PATH`).

## Qualidade

- WebGL ausente ou falhando → as cenas 3D caem para imagens estáticas automaticamente.
- `prefers-reduced-motion` → sem preloader, sem rotação automática e animações reduzidas.
- Navegação por teclado, foco visível, modais com Esc e retenção de foco, HTML semântico e metadados de SEO.
- Checkout é uma **simulação**: não processa pagamentos; gera o pedido formatado para o WhatsApp.
