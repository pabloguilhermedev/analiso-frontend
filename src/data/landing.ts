export type BillingCycle = "mensal" | "anual";

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  tag: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PricingPlan {
  key: "essencial" | "premium" | "ilimitado";
  name: string;
  headline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualHelper: string;
  annualSavings: string;
  helper?: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  finePrint: string;
}

export const navLinks: NavLink[] = [
  { label: "Início", href: "#inicio" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Preços", href: "#planos" },
  { label: "Blog", href: "#blog" },
];

export const dataSources = ["CVM", "B3", "RI"];

export const features: Feature[] = [
  {
    title: "Resumo Inteligente",
    description:
      "Entenda o que mudou na sua watchlist em segundos, com contexto e evidências de CVM, B3 e RI.",
    tag: "Análise",
  },
  {
    title: "Pilares Financeiros",
    description:
      "5 pilares monitorados automaticamente: Dívida, Caixa, Margens, Retorno e Proventos com score 0–100.",
    tag: "Dados",
  },
  {
    title: "Alertas em Tempo Real",
    description:
      "Receba notificações quando um indicador muda de status, com explicação objetiva e link de origem.",
    tag: "Alertas",
  },
  {
    title: "Fontes Oficiais",
    description:
      "Todos os dados vêm de CVM, B3 e RI com data, hora e link direto para o documento original.",
    tag: "Confiabilidade",
  },
];

export const steps: Step[] = [
  {
    id: "01",
    title: "Adicione empresas",
    description:
      "Monte sua watchlist com as empresas que você acompanha. Busque por ticker e adicione com um clique.",
  },
  {
    id: "02",
    title: "Receba análises",
    description:
      "A Analiso monitora indicadores automaticamente e organiza tudo por pilares com score e evidências.",
  },
  {
    id: "03",
    title: "Tome decisões",
    description:
      "Com contexto claro e fontes verificáveis, você decide com mais confiança e menos ruído.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Antes eu passava horas tentando entender o que havia mudado nas empresas da minha carteira. Com a Analiso, em 30 segundos eu já sei o que precisa da minha atenção.",
    name: "Rodrigo Almeida",
    role: "Investidor pessoa física",
  },
  {
    quote:
      "A clareza dos alertas com fonte oficial mudou a minha rotina. Hoje eu priorizo decisões em vez de garimpar informação.",
    name: "Fernanda Costa",
    role: "Analista de investimentos",
  },
  {
    quote:
      "Os pilares financeiros me dão uma leitura objetiva do risco sem ruído. Ganhamos velocidade e consistência no acompanhamento.",
    name: "Marcelo Santos",
    role: "Gestor de carteiras",
  },
  {
    quote:
      "O resumo inteligente me ajuda a abrir o dia com foco. Tudo chega com contexto e evidência na mesma tela.",
    name: "Camila Nogueira",
    role: "Research buy-side",
  },
  {
    quote:
      "Antes eu alternava CVM, B3 e RI o tempo inteiro. Agora a plataforma centraliza tudo sem perder rastreabilidade.",
    name: "Bruno Teixeira",
    role: "Investidor avançado",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    key: "essencial",
    name: "Essencial",
    headline: "Comece com confiança em minutos.",
    monthlyPrice: 19,
    annualPrice: 15,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 48/ano",
    bullets: [
      "Watchlist: até 10 empresas",
      "Alertas: até 10 alertas",
      "Diagnóstico em 60s com 5 pilares (Dívida, Caixa, Margens, Retorno, Proventos)",
      "Dashboard de mudanças (últimos 30 dias)",
      "Fontes oficiais (CVM/B3/RI) com data e rastreabilidade",
    ],
    cta: "Começar",
    ctaHref: "/signup?plan=essencial",
    finePrint: "Você pode mudar de plano a qualquer momento.",
  },
  {
    key: "premium",
    name: "Premium",
    headline: "Acompanhe mudanças que importam, sem ruído.",
    monthlyPrice: 39,
    annualPrice: 31,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 96/ano",
    helper: "Melhor custo-benefício para acompanhar de verdade.",
    bullets: [
      "Watchlist: até 50 empresas",
      "Alertas: até 50 alertas + alertas por pilar e severidade",
      "Dashboard completo: filtros 7d/30d/90d + 'Importantes apenas'",
      "Comparar empresas: até 4 lado a lado",
      "Resumo do dia (em 30s) com o que mudou e por quê",
      "Prioridade de atualização e avisos de frescor por categoria",
    ],
    cta: "Assinar Premium",
    ctaHref: "/signup?plan=premium",
    finePrint: "Transparência sempre: cada insight mostra fonte e data.",
  },
  {
    key: "ilimitado",
    name: "Ilimitado",
    headline: "Para uso intenso e rotinas de estudo e monitoramento.",
    monthlyPrice: 79,
    annualPrice: 63,
    annualHelper: "cobrado anualmente",
    annualSavings: "Economia de R$ 192/ano",
    bullets: [
      "Watchlist: ilimitada",
      "Alertas: ilimitados + por pilar e severidade",
      "Dashboard completo com todos os filtros e períodos",
      "Comparar empresas: ilimitado",
      "Prioridade máxima de atualização",
      "Suporte prioritário",
    ],
    cta: "Assinar Ilimitado",
    ctaHref: "/signup?plan=ilimitado",
    finePrint: "Feito para quem acompanha o mercado todos os dias.",
  },
];
