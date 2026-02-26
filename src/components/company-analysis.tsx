import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CircleHelp,
  Database,
  ExternalLink,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  TriangleAlert,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sidebar } from './dashboard/sidebar';
import logoWeg from '../assets/logos/weg.jpeg';
import logoVale from '../assets/logos/vale.png';
import logoRenner from '../assets/logos/renner.png';
import logoMrv from '../assets/logos/mrv.jpg';
import logoTaesa from '../assets/logos/taesa.png';
import logoItau from '../assets/logos/itau.png';

type Status = 'Risco' | 'Atencao' | 'Saudavel';
type MainTab = 'Resumo' | 'Pilares' | 'Mudancas' | 'Eventos' | 'Preco' | 'Fontes';
type QueueFilter = 'Todas' | 'Atencao' | 'Risco';
type WindowSize = '5a' | '10a';
type PriceMetric = 'P/L' | 'EV/EBITDA' | 'P/VP';
type FeedWindow = '30 dias' | '60 dias' | '90 dias';
type EvidenceTab = 'Fonte' | 'Trecho' | 'Como calculamos';

type CompanyContext = {
  companyId: string;
  ticker: string;
  name: string;
};

type Contextual<T> = T & {
  companyId: string;
  ticker: string;
};

type CompanyQueueItem = {
  companyId: string;
  ticker: string;
  name: string;
  status: Status;
  logo?: string;
  initials?: string;
  description: string;
};

type Source = {
  name: string;
  docLabel: string;
  date: string;
  url?: string;
};

type PillarMetric = {
  label: string;
  value: string;
  period: string;
  source: Source;
};

type PillarEvidence = {
  id?: string;
  label: 'Ponto de atencao' | 'Ponto forte';
  intensity: 'Moderada' | 'Leve';
  title: string;
  value: string;
  metric: string;
  why: string;
  source: Source;
};

type PillarData = {
  name: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos';
  status: Status;
  score: number;
  trend: string;
  summary: string;
  trust: { source: string; updatedAt: string; status: 'Atualizado' | 'Antigo' };
  chart: { title: string; series5: number[]; series10: number[]; years5: string[]; years10: string[] };
  metrics: PillarMetric[];
  evidences: PillarEvidence[];
};

const queueItems: CompanyQueueItem[] = [
  { companyId: 'VALE3', ticker: 'VALE3', name: 'Vale', status: 'Risco', logo: logoVale, description: 'Mineradora global com forte exposicao a minerio de ferro.' },
  { companyId: 'LREN3', ticker: 'LREN3', name: 'Lojas Renner', status: 'Atencao', logo: logoRenner, description: 'Varejo de moda com foco em omnichannel e escala nacional.' },
  { companyId: 'MRVE3', ticker: 'MRVE3', name: 'MRV Engenharia', status: 'Atencao', logo: logoMrv, description: 'Construtora focada no segmento residencial de media e baixa renda.' },
  { companyId: 'TAEE11', ticker: 'TAEE11', name: 'Transmissao Paulista', status: 'Saudavel', logo: logoTaesa, description: 'Empresa de transmissao de energia com receita regulada.' },
  { companyId: 'WEGE3', ticker: 'WEGE3', name: 'WEG', status: 'Atencao', logo: logoWeg, description: 'Empresa de equipamentos eletricos e automacao industrial com presenca global.' },
  { companyId: 'ITUB4', ticker: 'ITUB4', name: 'Itau Unibanco', status: 'Saudavel', logo: logoItau, description: 'Banco universal com foco em credito, servicos e seguros.' },
  { companyId: 'BBAS3', ticker: 'BBAS3', name: 'Banco do Brasil', status: 'Saudavel', initials: 'BB', description: 'Banco com forte exposicao ao agronegocio e setor publico.' },
];

const mainTabs: MainTab[] = ['Resumo', 'Pilares', 'Mudancas', 'Eventos', 'Preco', 'Fontes'];
const radarScores = { Divida: 58, Caixa: 72, Margens: 70, Retorno: 76, Proventos: 62 };

const pillars: PillarData[] = [
  {
    name: 'Divida',
    status: 'Atencao',
    score: 58,
    trend: '↓ 3 vs ultimo trimestre',
    summary: 'Atencao porque a alavancagem subiu e exige acompanhamento de caixa.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: Divida Liq./EBITDA por ano',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [0.6, 0.8, 1.1, 1.4, 1.6],
      series10: [0.4, 0.5, 0.6, 0.7, 0.7, 0.6, 0.8, 1.1, 1.4, 1.6],
    },
    metrics: [
      { label: 'Divida Liq./EBITDA', value: '1,6x', period: '12m +0,2x', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Cobertura de juros', value: '6,8x', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Caixa vs divida CP', value: '1,3x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Prazo medio', value: '3,8 anos', period: 'Atual', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'divida-1',
        label: 'Ponto de atencao',
        intensity: 'Moderada',
        title: 'Divida bruta subiu no trimestre',
        value: '1,6x',
        metric: 'Divida Liq./EBITDA',
        why: 'Pode pressionar caixa em juros altos.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'divida-2',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Prazo de divida alongado',
        value: '68%',
        metric: 'Longo prazo',
        why: 'Reduz risco de refinanciamento no curto prazo.',
        source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Caixa',
    status: 'Saudavel',
    score: 72,
    trend: '↑ 2 vs 12m',
    summary: 'Esta saudavel porque o fluxo de caixa livre segue positivo.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: FCF por ano',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [2.1, 2.4, 2.2, 2.6, 2.7],
      series10: [1.2, 1.4, 1.7, 2.0, 1.9, 2.1, 2.4, 2.2, 2.6, 2.7],
    },
    metrics: [
      { label: 'FCL', value: 'R$ 2,7 bi', period: '12m +0,2 bi', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Conversao de caixa', value: '82%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Liquidez corrente', value: '1,6x', period: 'Trimestre', source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02' } },
      { label: 'Capex/Receita', value: '4,2%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'caixa-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Caixa confortavel para investimentos',
        value: '18%',
        metric: 'Caixa/Receita',
        why: 'Mantem flexibilidade para crescimento organico.',
        source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02', url: 'https://www.weg.net/ri' },
      },
      {
        id: 'caixa-2',
        label: 'Ponto de atencao',
        intensity: 'Moderada',
        title: 'Capital de giro pressionou',
        value: '+6%',
        metric: 'Capital de giro',
        why: 'Pode reduzir liquidez no curto prazo.',
        source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02', url: 'https://www.weg.net/ri' },
      },
    ],
  },
  {
    name: 'Margens',
    status: 'Saudavel',
    score: 70,
    trend: '→ 0 vs 12m',
    summary: 'Esta saudavel porque margens permaneceram proximas da media historica.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: Margem EBITDA',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [19.2, 20.1, 19.8, 20.4, 20.0],
      series10: [18.1, 18.7, 19.2, 19.4, 19.0, 19.2, 20.1, 19.8, 20.4, 20.0],
    },
    metrics: [
      { label: 'Margem EBITDA', value: '20,0%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Margem liquida', value: '14,1%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Preco vs custo', value: '1,2x', period: 'Trimestre', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Margem bruta', value: '33,8%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'margens-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Margens resilientes em ciclo desafiador',
        value: '20,0%',
        metric: 'EBITDA (12m)',
        why: 'Sustenta lucro mesmo com custos pressionados.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'margens-2',
        label: 'Ponto de atencao',
        intensity: 'Moderada',
        title: 'Custos diretos em alta',
        value: '58%',
        metric: 'Custo/Receita',
        why: 'Pode comprimir margem no proximo trimestre.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Retorno',
    status: 'Saudavel',
    score: 76,
    trend: '↑ 1 vs 12m',
    summary: 'Esta saudavel porque ROIC se mantem acima da referencia.',
    trust: { source: 'CVM', updatedAt: '04/02', status: 'Atualizado' },
    chart: {
      title: 'Evidencia: ROIC',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [13.2, 14.1, 15.0, 15.6, 16.1],
      series10: [10.8, 11.3, 11.9, 12.4, 12.7, 13.2, 14.1, 15.0, 15.6, 16.1],
    },
    metrics: [
      { label: 'ROIC', value: '16,1%', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'ROE', value: '18,3%', period: '12m', source: { name: 'RI', docLabel: 'Release 3T25', date: '04/02' } },
      { label: 'Giro do ativo', value: '0,72x', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
      { label: 'Referencia de retorno', value: '12,0%', period: 'proxy', source: { name: 'Analiso', docLabel: 'Estimativa interna', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'retorno-1',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Retorno acima da referencia',
        value: '16,1%',
        metric: 'ROIC (12m)',
        why: 'Indica eficiencia na alocacao de capital.',
        source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
      {
        id: 'retorno-2',
        label: 'Ponto de atencao',
        intensity: 'Moderada',
        title: 'ROA recuou no trimestre',
        value: '6,1%',
        metric: 'ROA (12m)',
        why: 'Pode sinalizar menor eficiencia operacional.',
        source: { name: 'CVM', docLabel: 'ITR 3T25', date: '04/02', url: 'https://www.gov.br/cvm' },
      },
    ],
  },
  {
    name: 'Proventos',
    status: 'Atencao',
    score: 62,
    trend: '↓ 2 vs ultimo trimestre',
    summary: 'Atencao porque a distribuicao segue volatil em ciclos de investimento.',
    trust: { source: 'RI', updatedAt: '05/02', status: 'Antigo' },
    chart: {
      title: 'Evidencia: Dividendos por acao',
      years5: ['2021', '2022', '2023', '2024', '2025'],
      years10: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      series5: [0.9, 1.1, 1.0, 1.3, 1.2],
      series10: [0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1.1, 1.0, 1.3, 1.2],
    },
    metrics: [
      { label: 'Payout', value: '42%', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
      { label: 'Dividend yield', value: '3,1%', period: '12m', source: { name: 'B3', docLabel: 'Dados de mercado', date: '05/02' } },
      { label: 'Proventos por acao', value: 'R$ 1,2', period: '12m', source: { name: 'RI', docLabel: 'Comunicado', date: '05/02' } },
      { label: 'Cobertura de proventos', value: '2,4x', period: '12m', source: { name: 'CVM', docLabel: 'DFP 2024', date: '04/02' } },
    ],
    evidences: [
      {
        id: 'proventos-1',
        label: 'Ponto de atencao',
        intensity: 'Moderada',
        title: 'Payout mais volatil',
        value: '42%',
        metric: 'Payout (12m)',
        why: 'Pode mudar previsibilidade de proventos.',
        source: { name: 'RI', docLabel: 'Comunicado', date: '05/02', url: 'https://www.weg.net/ri' },
      },
      {
        id: 'proventos-2',
        label: 'Ponto forte',
        intensity: 'Leve',
        title: 'Historico de distribuicao estavel',
        value: '3,1%',
        metric: 'Dividend yield',
        why: 'Reforca previsibilidade para o acionista.',
        source: { name: 'RI', docLabel: 'Comunicado', date: '05/02', url: 'https://www.weg.net/ri' },
      },
    ],
  },
];

const changes = [
  { type: 'Resultado', date: '04/02', severity: 'Leve', impact: 'Margens', title: 'Divulgacao de resultados do 3T25 com margem estavel.', source: { docLabel: 'ITR 3T25', url: 'https://www.gov.br/cvm' } },
  { type: 'Divida', date: '03/02', severity: 'Moderada', impact: 'Divida', title: 'Emissao de debentures para alongamento de prazo.', source: { docLabel: 'Fato Relevante', url: 'https://www.b3.com.br' } },
  { type: 'Proventos', date: '28/01', severity: 'Leve', impact: 'Proventos', title: 'Aprovacao de juros sobre capital proprio.', source: { docLabel: 'Comunicado', url: 'https://www.weg.net/ri' } },
];

const timelineEvents = [
  { date: '13/02', title: 'WEGE3 • Resultado 4T25', source: 'RI / B3 / CVM' },
  { date: '14/02', title: 'WEGE3 • Dividendos/JCP', source: 'RI' },
  { date: '16/02', title: 'WEGE3 • Teleconferencia RI', source: 'RI / B3' },
];

const priceData = {
  current: 'R$ 42,60',
  summary: 'Hoje o preco esta mais perto de premio vs historico, mas depende do ciclo e dos resultados.',
  labels: ['12x', '14x', '16x', '18x', '20x', '22x'],
  values: [4, 6, 9, 7, 5, 2],
  currentMarker: 4,
  medianMarker: 2,
  rows: [
    { metric: 'P/L', current: '20,1x', sector: '17,8x', historical: '16,4x', insight: 'Acima da mediana historica.' },
    { metric: 'EV/EBITDA', current: '13,5x', sector: '12,1x', historical: '11,8x', insight: 'Leve premio vs setor.' },
    { metric: 'P/VP', current: '4,2x', sector: '3,6x', historical: '3,4x', insight: 'Mais caro que a media 5a.' },
  ],
};

const sourceRows = [
  { category: 'Financeiro', source: 'CVM', doc: 'DFP 2024', date: '04/02', status: 'Atualizado', link: 'https://www.gov.br/cvm' },
  { category: 'Eventos', source: 'B3', doc: 'Fato Relevante', date: '03/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
  { category: 'Preco', source: 'B3', doc: 'Dados de mercado', date: '05/02', status: 'Atualizado', link: 'https://www.b3.com.br' },
  { category: 'RI', source: 'RI', doc: 'Comunicado', date: '05/02', status: 'Antigo', link: 'https://www.weg.net/ri' },
];

type CompanyData = {
  companyId: string;
  ticker: string;
  radarScores: Record<'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos', number>;
  strongest: { title: string; score: string; badge: string; trend: string; summary: string };
  watchout: { title: string; score: string; badge: string; trend: string; summary: string };
  monitor: { pillar: string; text: string };
  summaryScan: {
    motherLine: string;
    strength: { pillar: string; text: string };
    attention: { pillar: string; text: string };
    monitor: { pillar: string; text: string };
  };
  summaryText: string;
  summaryMeta: { updatedAt?: string; source?: string };
  pillars: Array<Contextual<PillarData>>;
  changes: Array<Contextual<(typeof changes)[number]> & { beforeAfter?: string }>;
  timelineEvents: Array<Contextual<(typeof timelineEvents)[number]>>;
  priceData: Contextual<typeof priceData> & {
    rows: Array<Contextual<(typeof priceData.rows)[number]>>;
    source?: string;
    updatedAt?: string;
    metricSeries?: Partial<Record<PriceMetric, { labels: string[]; values: number[]; currentMarker: number; medianMarker: number }>>;
  };
  sourceRows: Array<Contextual<(typeof sourceRows)[number]>>;
};

type TabPayload =
  | { status: 'ready'; companyId: string; data: CompanyData }
  | { status: 'empty'; companyId: string; ticker: string };

type CompanyPreferences = {
  activeTab: MainTab;
  changesWindow: FeedWindow;
  eventsWindow: FeedWindow;
  priceMetric: PriceMetric;
  lastOpenPillar: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' | null;
};

function contextualize<T>(items: T[], companyId: string, ticker: string): Array<Contextual<T>> {
  return items.map((item) => ({ ...item, companyId, ticker }));
}

function companyContextFromTicker(tickerParam?: string): CompanyContext {
  const normalizedTicker = (tickerParam ?? 'WEGE3').toUpperCase();
  const company = queueItems.find((item) => item.ticker === normalizedTicker) ?? queueItems[4];
  return {
    companyId: company.companyId,
    ticker: company.ticker,
    name: company.name,
  };
}

function safeMeta(value?: string) {
  return value && value.trim().length > 0 ? value : '—';
}

function normalizePillarName(value?: string): 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos' {
  const raw = (value ?? 'Divida').toLowerCase();
  if (raw.includes('dívida') || raw.includes('divida')) return 'Divida';
  if (raw.includes('caixa')) return 'Caixa';
  if (raw.includes('marg')) return 'Margens';
  if (raw.includes('retorno')) return 'Retorno';
  return 'Proventos';
}

function normalizeEvidenceParam(value?: string | null) {
  if (!value) return null;
  return value.trim().toLowerCase();
}

function getEvidenceAnchorId(pillarName: string, evidence: PillarEvidence, index: number) {
  const evidenceKey = (evidence.id ?? `${pillarName.toLowerCase()}-${index + 1}`).toLowerCase();
  return `evidence-${pillarName.toLowerCase()}-${evidenceKey}`;
}

function getDefaultPreferences(): CompanyPreferences {
  return {
    activeTab: 'Resumo',
    changesWindow: '90 dias',
    eventsWindow: '30 dias',
    priceMetric: 'P/L',
    lastOpenPillar: null,
  };
}

function loadPreferences(companyId: string): CompanyPreferences {
  const fallback = getDefaultPreferences();
  try {
    const raw = window.localStorage.getItem(`company-analysis-preferences:${companyId}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CompanyPreferences>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function savePreferences(companyId: string, preferences: CompanyPreferences) {
  try {
    window.localStorage.setItem(`company-analysis-preferences:${companyId}`, JSON.stringify(preferences));
  } catch {
    // ignore storage errors
  }
}

const mockDataByCompany: Record<string, CompanyData> = {
  WEGE3: {
    companyId: 'WEGE3',
    ticker: 'WEGE3',
    radarScores,
    strongest: {
      title: 'Caixa',
      score: '72/100',
      badge: 'Saudável',
      trend: '↑ +2 vs 12m',
      summary: 'Fluxo de caixa livre segue positivo e sustenta investimentos sem dívida adicional.',
    },
    watchout: {
      title: 'Dívida',
      score: '58/100',
      badge: 'Atenção',
      trend: '↓ -3 vs último trimestre',
      summary: 'Alavancagem subiu e exige acompanhamento de caixa em cenário de juros altos.',
    },
    monitor: {
      pillar: 'Divida',
      text: 'Monitorar Dívida Líq./EBITDA e cobertura de juros no próximo resultado.',
    },
    summaryScan: {
      motherLine: 'Atenção: alavancagem subiu no trimestre; caixa ainda sustenta.',
      strength: { pillar: 'Caixa', text: 'geração de caixa livre permanece positiva.' },
      attention: { pillar: 'Divida', text: 'alavancagem avançou e exige disciplina financeira.' },
      monitor: { pillar: 'Divida', text: 'acompanhar Dívida Líq./EBITDA e cobertura de juros.' },
    },
    summaryText:
      'A WEG mantém posição financeira sólida com geração de caixa positiva e margens consistentes próximas à média histórica. O ponto de atenção é a alavancagem, que subiu 0,2x no trimestre e exige monitoramento em um cenário de juros elevados. Proventos seguem estáveis, mas com distribuição volátil dependente do ciclo de investimento.',
    summaryMeta: { updatedAt: '05/02', source: 'CVM/B3/RI' },
    pillars: contextualize(pillars, 'WEGE3', 'WEGE3'),
    changes: contextualize(
      changes.map((item, index) => ({
        ...item,
        beforeAfter: index === 0 ? 'Antes: 19,6% → Depois: 20,0% na margem EBITDA' : undefined,
      })),
      'WEGE3',
      'WEGE3'
    ),
    timelineEvents: contextualize(timelineEvents, 'WEGE3', 'WEGE3'),
    priceData: {
      ...priceData,
      companyId: 'WEGE3',
      ticker: 'WEGE3',
      source: 'B3',
      updatedAt: '05/02',
      rows: contextualize(priceData.rows, 'WEGE3', 'WEGE3'),
      metricSeries: {
        'P/L': { labels: ['12x', '14x', '16x', '18x', '20x', '22x'], values: [4, 6, 9, 7, 5, 2], currentMarker: 4, medianMarker: 2 },
        'EV/EBITDA': { labels: ['8x', '10x', '12x', '14x', '16x', '18x'], values: [2, 4, 7, 8, 5, 2], currentMarker: 3, medianMarker: 2 },
        'P/VP': { labels: ['2x', '2.5x', '3x', '3.5x', '4x', '4.5x'], values: [2, 3, 6, 8, 7, 4], currentMarker: 4, medianMarker: 2 },
      },
    },
    sourceRows: contextualize(sourceRows, 'WEGE3', 'WEGE3'),
  },
  VALE3: {
    companyId: 'VALE3',
    ticker: 'VALE3',
    radarScores: { Divida: 64, Caixa: 68, Margens: 66, Retorno: 62, Proventos: 70 },
    strongest: {
      title: 'Proventos',
      score: '70/100',
      badge: 'Saudável',
      trend: '↑ +1 vs 12m',
      summary: 'Distribuição permaneceu estável e suportada por geração de caixa.',
    },
    watchout: {
      title: 'Retorno',
      score: '62/100',
      badge: 'Atenção',
      trend: '↓ -2 vs último trimestre',
      summary: 'Retorno recuou no trimestre com pressão de preços de minério.',
    },
    monitor: {
      pillar: 'Retorno',
      text: 'Monitorar ROIC e margem EBITDA no próximo release.',
    },
    summaryScan: {
      motherLine: 'Atenção: retorno recuou no trimestre; caixa segue resiliente.',
      strength: { pillar: 'Proventos', text: 'distribuição permaneceu estável no ciclo recente.' },
      attention: { pillar: 'Retorno', text: 'eficiência caiu com pressão de preços de minério.' },
      monitor: { pillar: 'Retorno', text: 'acompanhar ROIC e evolução de margens.' },
    },
    summaryText:
      'A Vale mantém caixa robusto, porém com maior volatilidade de retorno no curto prazo devido ao ciclo de commodities e ao contexto macro global.',
    summaryMeta: { updatedAt: '06/02', source: 'RI/B3/CVM' },
    pillars: contextualize(
      pillars.map((pillar) => ({
        ...pillar,
        summary:
          pillar.name === 'Retorno'
            ? 'Atenção porque o retorno recuou no trimestre em função do ciclo de preços.'
            : pillar.summary,
      })),
      'VALE3',
      'VALE3'
    ),
    changes: contextualize(
      changes.map((item, index) => ({
        ...item,
        title:
          index === 0
            ? 'Atualização de guidance e sensibilidade ao preço de minério.'
            : item.title,
        beforeAfter: index === 0 ? 'Antes: guidance neutro → Depois: viés mais cauteloso' : undefined,
      })),
      'VALE3',
      'VALE3'
    ),
    timelineEvents: contextualize(
      timelineEvents.map((event, index) => ({
        ...event,
        title:
          index === 0
            ? 'VALE3 • Resultado 4T25'
            : event.title.replace('WEGE3', 'VALE3'),
      })),
      'VALE3',
      'VALE3'
    ),
    priceData: {
      ...priceData,
      companyId: 'VALE3',
      ticker: 'VALE3',
      current: 'R$ 66,20',
      summary: 'Hoje o preço reflete maior sensibilidade ao ciclo de minério e China.',
      source: 'B3',
      updatedAt: '06/02',
      rows: contextualize(
        priceData.rows.map((row, index) => ({
          ...row,
          metric: index === 0 ? 'EV/EBITDA' : row.metric,
        })),
        'VALE3',
        'VALE3'
      ),
      metricSeries: {
        'P/L': { labels: ['8x', '10x', '12x', '14x', '16x', '18x'], values: [2, 4, 8, 7, 4, 2], currentMarker: 3, medianMarker: 2 },
        'EV/EBITDA': { labels: ['4x', '5x', '6x', '7x', '8x', '9x'], values: [3, 6, 8, 6, 3, 1], currentMarker: 2, medianMarker: 2 },
      },
    },
    sourceRows: contextualize(
      sourceRows.map((row) => ({
        ...row,
        link: row.source === 'RI' ? 'https://www.vale.com/pt/investidores' : row.link,
      })),
      'VALE3',
      'VALE3'
    ),
  },
};

const statusTone = {
  Risco: { dot: 'bg-[#DC2626]', badge: 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]' },
  Atencao: { dot: 'bg-[#D97706]', badge: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' },
  Saudavel: { dot: 'bg-[#0E9384]', badge: 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' },
} as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function QueueLogo({ company }: { company: CompanyQueueItem }) {
  if (company.logo) {
    return <img src={company.logo} alt={company.ticker} className="h-9 w-9 rounded-lg border border-[#E5E7EB] object-cover" />;
  }
  return (
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0E9384] text-xs font-semibold text-white">
      {company.initials}
    </div>
  );
}

function RadarChart({
  scores,
  onSelectPillar,
}: {
  scores: Record<'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos', number>;
  onSelectPillar?: (pillar: 'Divida' | 'Caixa' | 'Margens' | 'Retorno' | 'Proventos') => void;
}) {
  const labels = ['Divida', 'Caixa', 'Margens', 'Retorno', 'Proventos'] as const;
  const size = 190;
  const center = size / 2;
  const radius = 68;
  const levels = [20, 40, 60, 80, 100];

  const getPoint = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / labels.length;
    return { x: center + Math.cos(angle) * radius * scale, y: center + Math.sin(angle) * radius * scale };
  };

  const points = labels
    .map((label, index) => getPoint(index, scores[label] / 100))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} aria-label="Radar dos pilares">
        {levels.map((level) => (
          <polygon
            key={level}
            points={labels.map((_, index) => {
              const point = getPoint(index, level / 100);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}
        {labels.map((label, index) => {
          const point = getPoint(index, 1);
          return (
            <g key={`axis-${index}`}>
              <line x1={center} y1={center} x2={point.x} y2={point.y} stroke="#E5E7EB" strokeWidth="1" />
              <line
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="transparent"
                strokeWidth="14"
                onClick={() => onSelectPillar?.(label)}
                className="cursor-pointer"
              />
            </g>
          );
        })}
        <polygon points={points} fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" strokeWidth="2" />
        {labels.map((label, index) => {
          const point = getPoint(index, scores[label] / 100);
          return <circle key={`point-${label}`} cx={point.x} cy={point.y} r="3.2" fill="#F59E0B" onClick={() => onSelectPillar?.(label)} className="cursor-pointer" />;
        })}
      </svg>
      <p className="mt-1 text-[11px] text-[#6B7280]">0-100 • Saudavel / Atencao / Risco</p>
    </div>
  );
}

function MiniLineChart({
  values,
  labels,
  tone,
  highlightIndex,
}: {
  values: number[];
  labels: string[];
  tone: 'teal' | 'amber';
  highlightIndex?: number;
}) {
  const width = 760;
  const height = 80;
  const padding = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const markerX =
    highlightIndex !== undefined
      ? padding + (Math.max(Math.min(highlightIndex, Math.max(values.length - 1, 0)), 0) * (width - padding * 2)) / Math.max(values.length - 1, 1)
      : null;
  const markerY =
    highlightIndex !== undefined && values[highlightIndex] !== undefined
      ? height - padding - ((values[highlightIndex] - min) / span) * (height - padding * 2)
      : null;

  return (
    <div className="space-y-2">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1="0" y1="42" x2={width} y2="42" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 4" />
        <polyline points={points} fill="none" stroke={tone === 'teal' ? '#0E9384' : '#D97706'} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {markerX !== null && markerY !== null && (
          <circle cx={markerX} cy={markerY} r="4.5" fill="#0E9384" stroke="white" strokeWidth="1.5" />
        )}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function toNumeric(value: string) {
  const normalized = value.replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
  return sorted[middle];
}

function metricReading(pillar: PillarData, metric: PillarMetric) {
  const current = toNumeric(metric.value);
  const ref = median(pillar.chart.series5);
  if (current === null) return { status: 'Neutro', reference: `vs mediana 5a: ${ref.toFixed(1)}` };

  const higherIsBetter = pillar.name !== 'Divida';
  const diff = current - ref;
  let status = 'Neutro';
  if (higherIsBetter) {
    if (diff > 0.5) status = 'Bom';
    if (diff < -0.5) status = 'Ruim';
  } else {
    if (diff < -0.3) status = 'Bom';
    if (diff > 0.3) status = 'Ruim';
  }
  return { status, reference: `vs mediana 5a: ${ref.toFixed(1)}` };
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cx('rounded-md bg-[#F3F4F6] skeleton-shimmer', className)} />;
}

export function CompanyAnalysis() {
  const navigate = useNavigate();
  const { ticker } = useParams();
  const [searchParams] = useSearchParams();

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('Todas');
  const [activeTab, setActiveTab] = useState<MainTab>('Resumo');
  const [contentVisible, setContentVisible] = useState(true);
  const [companyContext, setCompanyContext] = useState<CompanyContext>(() => companyContextFromTicker(ticker));
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingTab, setLoadingTab] = useState(true);
  const [tabCache, setTabCache] = useState<Record<string, TabPayload>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showHeaderUpdateDetails, setShowHeaderUpdateDetails] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [selectedPriceMetric, setSelectedPriceMetric] = useState<PriceMetric>('P/L');
  const [changesWindow, setChangesWindow] = useState<FeedWindow>('90 dias');
  const [eventsWindow, setEventsWindow] = useState<FeedWindow>('30 dias');
  const [evidenceModal, setEvidenceModal] = useState<{
    pillarName: string;
    evidence: PillarEvidence;
  } | null>(null);
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>('Fonte');
  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | null>(null);
  const lastAppliedDeepLinkRef = useRef<string>("");
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    Divida: false,
    Caixa: false,
    Margens: false,
    Retorno: false,
    Proventos: false,
  });
  const [windowByPillar, setWindowByPillar] = useState<Record<string, WindowSize>>({
    Divida: '5a',
    Caixa: '5a',
    Margens: '5a',
    Retorno: '5a',
    Proventos: '5a',
  });

  useEffect(() => {
    setContentVisible(false);
    const timer = window.setTimeout(() => setContentVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, [activeTab, companyContext.companyId]);

  useEffect(() => {
    const nextContext = companyContextFromTicker(ticker);
    if (nextContext.companyId !== companyContext.companyId) {
      setCompanyContext(nextContext);
    }
  }, [ticker, companyContext.companyId]);

  useEffect(() => {
    const prefs = loadPreferences(companyContext.companyId);
    setLoadingCompany(true);
    setLoadingTab(true);
    setActiveTab(prefs.activeTab);
    setSelectedPriceMetric(prefs.priceMetric);
    setChangesWindow(prefs.changesWindow);
    setEventsWindow(prefs.eventsWindow);
    setEvidenceModal(null);
    setEvidenceTab('Fonte');
    setExpandedPillars({
      Divida: prefs.lastOpenPillar === 'Divida',
      Caixa: prefs.lastOpenPillar === 'Caixa',
      Margens: prefs.lastOpenPillar === 'Margens',
      Retorno: prefs.lastOpenPillar === 'Retorno',
      Proventos: prefs.lastOpenPillar === 'Proventos',
    });
    setWindowByPillar({
      Divida: '5a',
      Caixa: '5a',
      Margens: '5a',
      Retorno: '5a',
      Proventos: '5a',
    });
    setTabCache({});

    const timer = window.setTimeout(() => setLoadingCompany(false), 300);
    return () => window.clearTimeout(timer);
  }, [companyContext.companyId]);

  const filteredQueue = useMemo(() => {
    if (queueFilter === 'Todas') return queueItems;
    return queueItems.filter((item) => item.status === queueFilter);
  }, [queueFilter]);

  const activeCompany = queueItems.find((item) => item.companyId === companyContext.companyId) ?? queueItems[4];
  const tabKey = `${companyContext.companyId}:${activeTab}`;

  useEffect(() => {
    if (loadingCompany) return;
    if (tabCache[tabKey]) {
      setLoadingTab(false);
      return;
    }
    setLoadingTab(true);
    const timer = window.setTimeout(() => {
      const companyData = mockDataByCompany[companyContext.companyId];
      setTabCache((prev) => ({
        ...prev,
        [tabKey]: companyData
          ? { status: 'ready', companyId: companyContext.companyId, data: companyData }
          : { status: 'empty', companyId: companyContext.companyId, ticker: companyContext.ticker },
      }));
      setLoadingTab(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [companyContext.companyId, companyContext.ticker, loadingCompany, tabCache, tabKey]);

  const activePayload = tabCache[tabKey];
  const mismatch = activePayload ? activePayload.companyId !== companyContext.companyId : false;
  const showSkeleton = loadingCompany || loadingTab || !activePayload || mismatch;
  const activeData =
    activePayload && activePayload.status === 'ready' && activePayload.companyId === companyContext.companyId
      ? activePayload.data
      : null;
  const scoreAverage = activeData
    ? Math.round((activeData.radarScores.Divida + activeData.radarScores.Caixa + activeData.radarScores.Margens + activeData.radarScores.Retorno + activeData.radarScores.Proventos) / 5)
    : 0;
  const actionsDisabled = showSkeleton;
  const availablePriceMetrics = (Object.keys(activeData?.priceData.metricSeries ?? {}) as PriceMetric[]);
  const activePriceSeries =
    (activeData?.priceData.metricSeries && activeData.priceData.metricSeries[selectedPriceMetric]) ||
    (activeData?.priceData.metricSeries && availablePriceMetrics.length > 0 ? activeData.priceData.metricSeries[availablePriceMetrics[0]] : undefined) ||
    null;
  const activePriceRows = (activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric);
  const activePriceRow = activePriceRows[0] ?? (activeData?.priceData.rows ?? []).find((row) => row.companyId === companyContext.companyId);
  const changesCount = (activeData?.changes ?? []).filter((change) => change.companyId === companyContext.companyId).length;
  const eventsCount = (activeData?.timelineEvents ?? []).filter((event) => event.companyId === companyContext.companyId).length;

  const switchCompany = (nextTicker: string) => {
    if (nextTicker === companyContext.ticker) return;
    const nextContext = companyContextFromTicker(nextTicker);
    setCompanyContext(nextContext);
    navigate(`/empresa/${nextTicker}`);
  };

  const guardAction = (event?: React.MouseEvent, itemCompanyId?: string) => {
    if (!actionsDisabled && (!itemCompanyId || itemCompanyId === companyContext.companyId)) return false;
    event?.preventDefault();
    setActionError('Atualizando dados da empresa. Tente novamente em instantes.');
    return true;
  };

  const goToPillar = (pillarName: string, openEvidence = false) => {
    const normalizedPillar = normalizePillarName(pillarName);
    setActiveTab('Pilares');
    setExpandedPillars({
      Divida: normalizedPillar === 'Divida',
      Caixa: normalizedPillar === 'Caixa',
      Margens: normalizedPillar === 'Margens',
      Retorno: normalizedPillar === 'Retorno',
      Proventos: normalizedPillar === 'Proventos',
    });
    if (openEvidence) {
      const evidence = activeData?.pillars.find((pillar) => pillar.name === normalizedPillar)?.evidences[0];
      if (evidence) {
        setEvidenceModal({ pillarName: normalizedPillar, evidence });
        setEvidenceTab('Fonte');
      }
    }
    window.setTimeout(() => {
      const target = document.getElementById(`pillar-${normalizedPillar}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const openSummaryEvidence = () => {
    if (!activeData) return;
    goToPillar(activeData.summaryScan.attention.pillar, true);
  };

  useEffect(() => {
    if (!activeData) return;
    const pillarParam = searchParams.get('pilar');
    if (!pillarParam) return;

    const evidenceParam = normalizeEvidenceParam(searchParams.get('evidencia'));
    const deepLinkKey = `${companyContext.companyId}:${pillarParam}:${evidenceParam ?? ''}`;
    if (lastAppliedDeepLinkRef.current === deepLinkKey) return;
    lastAppliedDeepLinkRef.current = deepLinkKey;

    const targetPillar = normalizePillarName(pillarParam);
    setActiveTab('Pilares');
    setExpandedPillars({
      Divida: targetPillar === 'Divida',
      Caixa: targetPillar === 'Caixa',
      Margens: targetPillar === 'Margens',
      Retorno: targetPillar === 'Retorno',
      Proventos: targetPillar === 'Proventos',
    });
    setHighlightedEvidenceId(null);

    window.setTimeout(() => {
      const pillarData = activeData.pillars.find((pillar) => pillar.companyId === companyContext.companyId && pillar.name === targetPillar);
      if (!pillarData) return;

      const matchedEvidenceIndex = evidenceParam
        ? pillarData.evidences.findIndex((evidence, index) => {
            const byId = (evidence.id ?? '').toLowerCase() === evidenceParam;
            const byOrdinal = `${targetPillar.toLowerCase()}-${index + 1}` === evidenceParam || `${index + 1}` === evidenceParam;
            return byId || byOrdinal;
          })
        : -1;

      if (matchedEvidenceIndex >= 0) {
        const matchedEvidence = pillarData.evidences[matchedEvidenceIndex];
        const anchorId = getEvidenceAnchorId(targetPillar, matchedEvidence, matchedEvidenceIndex);
        setHighlightedEvidenceId(anchorId);
        setEvidenceModal({ pillarName: targetPillar, evidence: matchedEvidence });
        setEvidenceTab('Fonte');
        const evidenceTarget = document.getElementById(anchorId);
        evidenceTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const pillarTarget = document.getElementById(`pillar-${targetPillar}`);
      pillarTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, [activeData, companyContext.companyId, searchParams]);

  useEffect(() => {
    if (!actionError) return;
    const timer = window.setTimeout(() => setActionError(null), 2400);
    return () => window.clearTimeout(timer);
  }, [actionError]);

  useEffect(() => {
    if (!activeData?.priceData.metricSeries) return;
    const metrics = Object.keys(activeData.priceData.metricSeries) as PriceMetric[];
    if (metrics.length > 0 && !metrics.includes(selectedPriceMetric)) {
      setSelectedPriceMetric(metrics[0]);
    }
  }, [activeData, selectedPriceMetric]);

  useEffect(() => {
    const openPillar =
      (Object.entries(expandedPillars).find(([, isOpen]) => isOpen)?.[0] as Exclude<CompanyPreferences['lastOpenPillar'], null> | undefined) ??
      null;
    savePreferences(companyContext.companyId, {
      activeTab,
      changesWindow,
      eventsWindow,
      priceMetric: selectedPriceMetric,
      lastOpenPillar: openPillar,
    });
  }, [activeTab, changesWindow, companyContext.companyId, eventsWindow, expandedPillars, selectedPriceMetric]);

  return (
    <div className="h-screen overflow-hidden bg-[#F7F8FA] font-['Plus_Jakarta_Sans','DM_Sans',system-ui,sans-serif] text-[#111827]">
      <style>{`
        .skeleton-shimmer {
          background-image: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 40%, #F3F4F6 80%);
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="relative flex h-full">
        <div className="w-[240px] flex-shrink-0">
          <Sidebar currentPage="explorar" />
        </div>

        <aside
          className={cx(
            'relative h-full flex-shrink-0 overflow-hidden bg-white transition-all duration-200',
            watchlistCollapsed ? 'w-0 border-r-0 p-0' : 'w-[240px] border-r border-[#EFEFEF] p-4'
          )}
        >
          {!watchlistCollapsed && (
            <button
              className="absolute -right-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-[#D1D5DB] bg-white text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
              onClick={() => setWatchlistCollapsed(true)}
              aria-label="Retrair watchlist"
              title="Retrair watchlist"
            >
              <ChevronLeft className="h-4 w-4 transition-transform" />
            </button>
          )}
          {!watchlistCollapsed && (
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#111827]">Watchlist</h2>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>
          )}
          {!watchlistCollapsed && (
          <div className="mt-3 flex items-center gap-1.5">
            {(['Todas', 'Atencao', 'Risco'] as QueueFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setQueueFilter(filter)}
                className={cx(
                  'h-7 rounded-full px-3.5 text-[13px]',
                  queueFilter === filter ? 'border border-[#E5E7EB] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]'
                )}
              >
                {filter === 'Atencao' ? 'Atenção' : filter}
              </button>
            ))}
          </div>
          )}
          {!watchlistCollapsed && (
          <div className="mt-4 divide-y divide-[#F3F4F6]">
            {filteredQueue.map((company) => {
              const selected = company.companyId === companyContext.companyId;
              return (
                <button
                  key={company.ticker}
                  onClick={() => switchCompany(company.ticker)}
                  className={cx(
                    'group flex w-full items-center gap-2.5 text-left',
                    selected ? 'rounded-[10px] border border-[#0E9384] bg-[#F0FDFA] p-3' : 'px-2 py-3'
                  )}
                >
                  <QueueLogo company={company} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-[#111827]">{company.ticker}</p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">{company.name}</p>
                  </div>
                  <span className={cx('h-[7px] w-[7px] rounded-full', statusTone[company.status].dot)} />
                  <MoreHorizontal className={cx('h-3.5 w-3.5 text-[#9CA3AF] transition-opacity', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
                </button>
              );
            })}
          </div>
          )}
        </aside>

        {watchlistCollapsed && (
          <button
            className="absolute left-[240px] top-1/2 z-30 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-[#D1D5DB] bg-white text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
            onClick={() => setWatchlistCollapsed(false)}
            aria-label="Expandir watchlist"
            title="Expandir watchlist"
          >
            <ChevronLeft className="h-4 w-4 rotate-180 transition-transform" />
          </button>
        )}

        <main className="h-full flex-1 overflow-y-auto bg-[#F7F8FA]">
          <header className="sticky top-0 z-10 border-b border-[#EFEFEF] bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <QueueLogo company={activeCompany} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[30px] font-bold leading-none text-[#0B1220]">{activeCompany.name === 'WEG' ? 'WEG' : activeCompany.name}</h1>
                    <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[13px] font-medium text-[#374151]">{activeCompany.ticker}</span>
                    <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', statusTone[activeCompany.status].badge)}>
                      {activeCompany.status === 'Atencao' ? 'Atenção' : activeCompany.status} • {scoreAverage}/100
                    </span>
                    <span className="rounded-full border border-[#D1D5DB] px-2.5 py-1 text-[12px] font-medium text-[#1F2937]">
                      {safeMeta(activeData?.priceData.current)} <span className="text-[#0E9384]">+0,8%</span>
                    </span>
                  </div>
                  <p className="truncate text-[13px] text-[#6B7280]">
                    {activeCompany.description}
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                <button
                  className={cx('inline-flex items-center gap-1.5 rounded-lg border border-[#0E9384] bg-[#E9F8F5] px-3.5 py-2 text-[13px] font-semibold text-[#0E9384]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
                  disabled={actionsDisabled}
                  onClick={(event) => guardAction(event)}
                >
                  <Check className="h-4 w-4" />
                  Na Watchlist
                </button>
                <button className={cx('rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#1F2937]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Criar alerta</button>
                <button className={cx('rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] text-[#4B5563]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event)}>Comparar</button>
                <button
                  className={cx('grid h-9 w-9 place-items-center rounded-full border border-[#D1D5DB] text-[#374151]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
                  disabled={actionsDisabled}
                  onClick={() => setShowHeaderMenu((prev) => !prev)}
                >
                  <MoreHorizontal className="h-[18px] w-[18px]" />
                </button>
                {showHeaderMenu && (
                  <div className="absolute right-0 top-11 z-30 w-40 rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
                    <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-[#374151] hover:bg-[#F9FAFB]" onClick={(event) => guardAction(event)}>
                      <Bell className="h-4 w-4" />
                      Notificações
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-[#374151] hover:bg-[#F9FAFB]" onClick={(event) => guardAction(event)}>
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-[#E5E7EB] pt-3">
              <span className="rounded-full border border-[#D1D5DB] px-3 py-1.5 text-[12px] font-medium text-[#374151]">Indústria</span>
              <span className="rounded-full border border-[#D1D5DB] px-3 py-1.5 text-[12px] font-medium text-[#374151]">Bens de capital</span>
              <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-3 py-1.5 text-[12px] font-semibold text-[#0E9384]">Atualizado: {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
              <div className="relative">
                <button className="rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#374151]" onClick={() => setShowHeaderUpdateDetails((prev) => !prev)}>
                  Detalhes da atualização ⌄
                </button>
                {showHeaderUpdateDetails && (
                  <div className="absolute left-0 top-10 z-30 min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white p-3 text-[12px] text-[#4B5563] shadow-lg">
                    <p>Financeiro: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                    <p>Eventos: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                    <p>Preço: {safeMeta(activeData?.priceData.updatedAt)}</p>
                    <p>Fontes: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                  </div>
                )}
              </div>
              <span className="rounded-full border border-[#D1D5DB] px-3 py-1.5 text-[12px] font-medium text-[#374151]" title="Ver fontes na aba Fontes">
                Fontes: CVM · B3 · RI
              </span>
            </div>

            <div className="mt-3 flex items-center gap-7 border-t border-[#E5E7EB] pt-3">
              {mainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cx(
                    'pb-2 text-[15px] font-medium transition-colors duration-150',
                    activeTab === tab ? 'border-b-[3px] border-[#0E9384] font-semibold text-[#0B1220]' : 'text-[#4B5563] hover:text-[#111827]'
                  )}
                >
                  {tab === 'Mudancas'
                    ? `O que mudou (90 dias) (${changesCount})`
                    : tab === 'Eventos'
                      ? `Agenda (próximos eventos) (${eventsCount})`
                      : tab === 'Preco'
                        ? 'Preço'
                        : tab}
                </button>
              ))}
            </div>
          </header>

          <section className={cx('px-6 py-5 transition-opacity duration-150', contentVisible ? 'opacity-100' : 'opacity-0')}>
            {actionError && (
              <div className="mb-4 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[13px] text-[#B45309]">
                {actionError}
              </div>
            )}
            {showScoreInfo && (
              <div className="mb-4 rounded-xl border border-[#E8EAED] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#111827]">Como calculamos o placar</h3>
                  <button className="text-[12px] text-[#0E9384] hover:underline" onClick={() => setShowScoreInfo(false)}>Fechar</button>
                </div>
                <p className="mt-2 text-[12px] text-[#6B7280]">Pesos: Dívida 25%, Caixa 20%, Margens 20%, Retorno 20%, Proventos 15%.</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">Regra: score 0-100 por pilar com cortes em saudável, atenção e risco.</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">Fontes: CVM, B3 e RI da empresa.</p>
              </div>
            )}
            {evidenceModal && (
              <div className="mb-4 rounded-xl border border-[#E8EAED] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#111827]">Painel de fonte • {evidenceModal.pillarName}</h3>
                  <button className="text-[12px] text-[#0E9384] hover:underline" onClick={() => setEvidenceModal(null)}>Fechar</button>
                </div>
                <div className="mt-3 inline-flex rounded-full bg-[#F9FAFB] p-1">
                  {(['Fonte', 'Trecho', 'Como calculamos'] as EvidenceTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEvidenceTab(tab)}
                      className={cx('rounded-full px-2.5 py-1 text-[11px]', evidenceTab === tab ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]')}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {evidenceTab === 'Fonte' && (
                  <div className="mt-3 space-y-1 text-[12px] text-[#6B7280]">
                    <p>Documento: {safeMeta(evidenceModal.evidence.source.docLabel)}</p>
                    <p>Atualizado em: {safeMeta(evidenceModal.evidence.source.date)}</p>
                    <a href={evidenceModal.evidence.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0E9384] hover:underline">
                      Abrir fonte externa
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
                {evidenceTab === 'Trecho' && (
                  <div className="mt-3 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[12px] text-[#6B7280]">
                    Trecho relevante: {evidenceModal.evidence.why}
                  </div>
                )}
                {evidenceTab === 'Como calculamos' && (
                  <div className="mt-3 space-y-1 text-[12px] text-[#6B7280]">
                    <p>Fórmula base: valor atual vs histórico de 5 anos.</p>
                    <p>Notas: sinalizamos ponto forte/atenção conforme direção do pilar.</p>
                    <p>Limitações: sujeito a revisão após novo release da companhia.</p>
                  </div>
                )}
              </div>
            )}
            {showSkeleton ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-40" /><SkeletonBlock className="mt-4 h-[220px] w-full" /><SkeletonBlock className="mt-4 h-8 w-full" /></div>
                  <div className="col-span-3 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-32" /><SkeletonBlock className="mt-6 h-8 w-24" /><SkeletonBlock className="mt-3 h-16 w-full" /></div>
                  <div className="col-span-4 rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-40" /><SkeletonBlock className="mt-6 h-8 w-20" /><SkeletonBlock className="mt-3 h-16 w-full" /></div>
                </div>
                <div className="rounded-xl border border-[#E8EAED] bg-white p-5"><SkeletonBlock className="h-5 w-48" /><SkeletonBlock className="mt-4 h-4 w-full" /><SkeletonBlock className="mt-2 h-4 w-10/12" /><SkeletonBlock className="mt-4 h-9 w-56" /></div>
              </div>
            ) : activePayload?.status === 'empty' ? (
              <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
                <h2 className="text-[15px] font-semibold text-[#111827]">Sem dados ainda para esta empresa (em ingestão)</h2>
              </article>
            ) : (
              <>
                {activeTab === 'Resumo' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      <article className="col-span-12 rounded-xl border border-[#E8EAED] bg-white p-5 xl:col-span-5">
                        <div className="flex items-center justify-between">
                          <h2 className="text-[15px] font-semibold text-[#111827]">Placar Geral</h2>
                          <div className="flex items-center gap-2">
                            <span className="text-[16px] font-bold text-[#111827]">{scoreAverage}/100</span>
                            <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">Atenção</span>
                            <button className="text-[11px] text-[#0E9384] hover:underline" onClick={() => setShowScoreInfo(true)}>
                              Como calculamos o placar
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <RadarChart
                            scores={activeData?.radarScores ?? radarScores}
                            onSelectPillar={(pillar) => goToPillar(pillar)}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          {Object.entries(activeData?.radarScores ?? radarScores).map(([name, score]) => {
                            const status: Status = score >= 70 ? 'Saudavel' : 'Atencao';
                            return (
                              <button
                                key={name}
                                onClick={() => goToPillar(name)}
                                className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', statusTone[status].badge)}
                              >
                                {name} {score}
                                <span className={cx('h-1.5 w-1.5 rounded-full', statusTone[status].dot)} />
                              </button>
                            );
                          })}
                        </div>
                      </article>

                      <article className="col-span-12 rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#0E9384] bg-white p-5 xl:col-span-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-[#0E9384]" />
                          <h3 className="text-[14px] font-semibold text-[#111827]">Principal Força</h3>
                        </div>
                        <div className="mt-4">
                          <p className="text-[24px] font-bold text-[#0E9384]">{activeData?.strongest.title ?? '—'}</p>
                          <p className="text-[14px] font-semibold text-[#6B7280]">{activeData?.strongest.score ?? '—'}</p>
                          <span className="mt-2 inline-flex rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 text-[11px] font-semibold text-[#0E9384]">{activeData?.strongest.badge ?? '—'}</span>
                          <p className="mt-1 text-[12px] text-[#0E9384]">{activeData?.strongest.trend ?? '—'}</p>
                          <p className="mt-3 text-[13px] leading-relaxed text-[#6B7280]">
                            {activeData?.strongest.summary ?? 'Sem dados para esta empresa.'}
                          </p>
                          <p className="mt-2 text-[12px] text-[#6B7280]">O que monitorar: {activeData?.monitor.text ?? '—'}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa')}>
                              Ver pilar
                            </button>
                            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.strongest.title ?? 'Caixa', true)}>
                              Ver fonte
                            </button>
                          </div>
                        </div>
                      </article>

                      <article className="col-span-12 rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#F59E0B] bg-white p-5 xl:col-span-4">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="h-4 w-4 text-[#D97706]" />
                          <h3 className="text-[14px] font-semibold text-[#111827]">Principal Atenção</h3>
                        </div>
                        <div className="mt-4">
                          <p className="text-[24px] font-bold text-[#D97706]">{activeData?.watchout.title ?? '—'}</p>
                          <p className="text-[14px] font-semibold text-[#6B7280]">{activeData?.watchout.score ?? '—'}</p>
                          <span className="mt-2 inline-flex rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">{activeData?.watchout.badge ?? '—'}</span>
                          <p className="mt-1 text-[12px] text-[#DC2626]">{activeData?.watchout.trend ?? '—'}</p>
                          <p className="mt-3 text-[13px] leading-relaxed text-[#6B7280]">
                            {activeData?.watchout.summary ?? 'Sem dados para esta empresa.'}
                          </p>
                          <p className="mt-2 text-[12px] text-[#6B7280]">Gatilho de melhora: {activeData?.monitor.text ?? '—'}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida')}>
                              Ver pilar
                            </button>
                            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]" onClick={() => goToPillar(activeData?.watchout.title ?? 'Divida', true)}>
                              Ver fonte
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>

                    <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-[15px] font-semibold text-[#111827]">Resumo em 60s (com fontes)</h2>
                          <p className="text-[12px] text-[#9CA3AF]">Uma visão simples do que está saudável e do que exige atenção.</p>
                        </div>
                        <button className="text-[12px] text-[#0E9384] hover:underline" onClick={openSummaryEvidence}>Ver fonte</button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">Atualizado em {safeMeta(activeData?.summaryMeta.updatedAt)}</span>
                        <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">Fonte: {safeMeta(activeData?.summaryMeta.source)}</span>
                        <span className="rounded-full border border-[#99F6E4] bg-[#F0FDFA] px-2.5 py-1 text-[11px] text-[#0E9384]">Confiança: Alta</span>
                      </div>
                      <div className="mt-4 space-y-2 text-[14px] text-[#111827]">
                        <p className="font-medium">{activeData?.summaryScan.motherLine ?? 'Sem dados para esta empresa.'}</p>
                        <p><span className="font-semibold">Força:</span> {activeData?.summaryScan.strength.pillar ?? '—'} — {activeData?.summaryScan.strength.text ?? '—'}</p>
                        <p><span className="font-semibold">Atenção:</span> {activeData?.summaryScan.attention.pillar ?? '—'} — {activeData?.summaryScan.attention.text ?? '—'}</p>
                        <p><span className="font-semibold">Monitorar:</span> {activeData?.summaryScan.monitor.pillar ?? '—'} — {activeData?.summaryScan.monitor.text ?? '—'}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button className={cx('rounded-lg border border-[#0E9384] bg-[#0E9384] px-3.5 py-2 text-[13px] font-semibold text-white', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={openSummaryEvidence}>Ver fonte</button>
                      </div>
                    </article>
                  </div>
                )}

                {activeTab === 'Pilares' && (
                  <div className="space-y-3">
                    {(activeData?.pillars ?? []).filter((p) => p.companyId === companyContext.companyId).length === 0 && (
                      <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
                        <p className="text-[14px] text-[#6B7280]">Ainda não temos dados suficientes para este indicador.</p>
                        <p className="mt-1 text-[12px] text-[#9CA3AF]">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                        <p className="text-[12px] text-[#9CA3AF]">Fonte esperada: CVM/RI</p>
                      </article>
                    )}
                    {(activeData?.pillars ?? []).filter((pillar) => pillar.companyId === companyContext.companyId).map((pillar) => {
                      const expanded = expandedPillars[pillar.name];
                      const windowSize = windowByPillar[pillar.name];
                      const values = windowSize === '5a' ? pillar.chart.series5 : pillar.chart.series10;
                      const labels = windowSize === '5a' ? pillar.chart.years5 : pillar.chart.years10;
                      const chartTone = pillar.status === 'Saudavel' ? 'teal' : 'amber';
                      const accent = pillar.status === 'Saudavel' ? 'border-l-[#0E9384]' : pillar.status === 'Atencao' ? 'border-l-[#F59E0B]' : 'border-l-[#DC2626]';

                      return (
                        <article id={`pillar-${pillar.name}`} key={pillar.name} className={cx('rounded-xl border border-[#E8EAED] border-l-[3px] bg-white p-5', accent)}>
                          <button
                            onClick={() => {
                              const isCurrentlyOpen = expandedPillars[pillar.name];
                              if (isCurrentlyOpen) {
                                setExpandedPillars({
                                  Divida: false,
                                  Caixa: false,
                                  Margens: false,
                                  Retorno: false,
                                  Proventos: false,
                                });
                                return;
                              }
                              setExpandedPillars({
                                Divida: pillar.name === 'Divida',
                                Caixa: pillar.name === 'Caixa',
                                Margens: pillar.name === 'Margens',
                                Retorno: pillar.name === 'Retorno',
                                Proventos: pillar.name === 'Proventos',
                              });
                            }}
                            className="flex w-full items-start justify-between text-left"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-[16px] font-bold text-[#111827]">{pillar.name === 'Divida' ? 'Dívida' : pillar.name}</h2>
                                <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', statusTone[pillar.status].badge)}>{pillar.status === 'Atencao' ? 'Atenção' : pillar.status === 'Saudavel' ? 'Saudável' : pillar.status}</span>
                              </div>
                              <p className="mt-2 text-[14px] text-[#6B7280]">{pillar.summary}</p>
                              <p className="mt-1 text-[12px] text-[#9CA3AF]">Fonte: {pillar.trust.source} • Atualizado em {pillar.trust.updatedAt} • Status: {pillar.trust.status}</p>
                            </div>
                            <div className="ml-3 flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[16px] font-semibold text-[#111827]">{pillar.score}/100</p>
                                <p className={cx('text-[13px]', pillar.trend.includes('↓') ? 'text-[#DC2626]' : pillar.trend.includes('↑') ? 'text-[#0E9384]' : 'text-[#6B7280]')}>{pillar.trend}</p>
                              </div>
                              <span className="text-[#6B7280] transition-transform duration-200">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                            </div>
                          </button>

                          <div className={cx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[1800px] opacity-100' : 'max-h-0 opacity-0')}>
                            <div className="my-4 border-t border-[#F3F4F6]" />
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[13px] text-[#6B7280]">Indicador base: {pillar.chart.title.replace('Evidencia: ', '')}</p>
                                <div className="inline-flex rounded-full bg-[#F9FAFB] p-1">
                                  {(['5a', '10a'] as WindowSize[]).map((windowOption) => (
                                    <button
                                      key={windowOption}
                                      onClick={() => setWindowByPillar((prev) => ({ ...prev, [pillar.name]: windowOption }))}
                                      className={cx('rounded-full px-2.5 py-1 text-[11px]', windowSize === windowOption ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]')}
                                    >
                                      {windowOption}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <MiniLineChart values={values} labels={labels} tone={chartTone} highlightIndex={values.length - 1} />
                              <div className="mt-1 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                                <span>Hoje: {values[values.length - 1]?.toFixed(1)} | Mediana 5a: {median(pillar.chart.series5).toFixed(1)}</span>
                                <span>Fonte: {safeMeta(pillar.trust.source)} • Atualizado em: {safeMeta(pillar.trust.updatedAt)}</span>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-4 gap-3">
                              {pillar.metrics.map((metric, index) => (
                                <div key={metric.label} className={cx('pr-3', index < pillar.metrics.length - 1 ? 'border-r border-[#F3F4F6]' : '')}>
                                  <p className="text-[12px] text-[#9CA3AF]">{metric.label}</p>
                                  <p className="mt-1 text-[22px] font-bold text-[#111827]">{metric.value}</p>
                                  <p className="text-[12px] text-[#9CA3AF]">{metric.period}</p>
                                  <p className="text-[12px] text-[#6B7280]" title="Como ler: compare com a mediana dos últimos 5 anos e direção do pilar.">
                                    {metricReading(pillar, metric).status} ({metricReading(pillar, metric).reference})
                                  </p>
                                  <p className="mt-1 text-[11px] text-[#9CA3AF]">Fonte: {metric.source.name} • {metric.source.date}</p>
                                </div>
                              ))}
                            </div>

                            <div className="my-4 border-t border-[#F3F4F6]" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="text-[13px] font-semibold text-[#111827]">Sinais</h3>
                                <span className="text-[13px] text-[#9CA3AF]">{pillar.evidences.length} sinais</span>
                              </div>
                              <button className="text-[13px] text-[#0E9384] hover:underline">Ver todas</button>
                            </div>

                            <div className="mt-2 space-y-2">
                              {pillar.evidences.map((evidence, index) => {
                                const pointTone = evidence.label === 'Ponto de atencao' ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]' : 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]';
                                const evidenceAnchorId = getEvidenceAnchorId(pillar.name, evidence, index);
                                return (
                                  <div
                                    id={evidenceAnchorId}
                                    key={evidence.title}
                                    className={cx(
                                      'rounded-lg border bg-[#F9FAFB] p-3 transition-colors',
                                      highlightedEvidenceId === evidenceAnchorId ? 'border-[#0E9384] ring-2 ring-[#99F6E4]' : 'border-[#F3F4F6]'
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={cx('rounded-full border px-2.5 py-1 text-[12px] font-semibold', pointTone)}>{evidence.label === 'Ponto de atencao' ? 'Ponto de atenção' : evidence.label}</span>
                                      <span className="text-[12px] text-[#6B7280]">{evidence.intensity}</span>
                                    </div>
                                    <p className="mt-2 text-[14px] font-semibold text-[#111827]">{evidence.title}</p>
                                    <p className="mt-1 text-[16px] font-bold text-[#0E9384]">{evidence.value} <span className="text-[12px] font-normal text-[#6B7280]">{evidence.metric}</span></p>
                                    <p className="mt-1 text-[14px] text-[#6B7280]"><span className="text-[12px] text-[#9CA3AF]">Por que importa:</span> {evidence.why}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-[12px] text-[#9CA3AF]">{evidence.source.docLabel} {evidence.source.date}</span>
                                      <button
                                        onClick={(event) => {
                                          if (guardAction(event, evidence.companyId)) return;
                                          setEvidenceModal({ pillarName: pillar.name, evidence });
                                          setEvidenceTab('Fonte');
                                        }}
                                        className={cx('text-[13px] text-[#0E9384] hover:underline', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')}
                                        disabled={actionsDisabled || evidence.companyId !== companyContext.companyId}
                                      >
                                        Ver fonte
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-4 flex items-center border-t border-[#F3F4F6] pt-3">
                              <button className={cx('rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[13px] text-[#6B7280]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event, pillar.companyId)}>Criar alerta para {pillar.name === 'Divida' ? 'Dívida' : pillar.name}</button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    <p className="py-2 text-center text-[13px] text-[#6B7280]">Sentiu falta de algum indicador? <button className="text-[#0E9384] hover:underline">Sugerir indicador</button></p>
                  </div>
                )}

                {activeTab === 'Mudancas' && (
                  <div>
                    <div className="mb-3">
                      <h2 className="text-[15px] font-semibold text-[#111827]">O que mudou (90 dias)</h2>
                      <p className="text-[12px] text-[#9CA3AF]">Feed de eventos passados que alteraram o diagnóstico.</p>
                    </div>
                    <div className="mb-4 flex items-center gap-2">
                      {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
                        <button key={period} onClick={() => setChangesWindow(period)} className={cx('h-7 rounded-full px-3.5 text-[13px]', period === changesWindow ? 'border border-[#E5E7EB] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]')}>
                          {period}
                        </button>
                      ))}
                      <button className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#6B7280]">
                        Tipo
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(activeData?.changes ?? []).filter((change) => change.companyId === companyContext.companyId).length === 0 && (
                        <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
                          <p className="text-[13px] text-[#6B7280]">Ainda não temos dados suficientes para este indicador.</p>
                          <p className="mt-1 text-[11px] text-[#9CA3AF]">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                          <p className="text-[11px] text-[#9CA3AF]">Fonte esperada: CVM/RI</p>
                        </article>
                      )}
                      {(activeData?.changes ?? []).filter((change) => change.companyId === companyContext.companyId).map((change) => (
                        <article key={`${change.type}-${change.date}`} className="rounded-xl border border-[#E8EAED] border-l-[3px] border-l-[#F59E0B] bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#6B7280]">{change.type}</span>
                              <span className="text-[12px] text-[#9CA3AF]">{change.date}</span>
                              <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[11px] text-[#D97706]">{change.severity}</span>
                            </div>
                            <span className="text-[12px] text-[#6B7280]">Impacta: {change.impact}</span>
                          </div>
                          <h3 className="mt-2 text-[14px] font-semibold text-[#111827]">{change.title}</h3>
                          {change.beforeAfter && <p className="mt-1 text-[12px] text-[#6B7280]">Antes → Depois: {change.beforeAfter}</p>}
                          <p className="mt-1 text-[11px] text-[#9CA3AF]">Fonte: {safeMeta(change.source.docLabel)} • Atualizado em: {safeMeta(change.date)}</p>
                          <a
                            href={change.source.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              if (guardAction(event, change.companyId)) return;
                            }}
                            className={cx('mt-3 inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]', actionsDisabled ? 'opacity-50' : '')}
                          >
                            Abrir {change.source.docLabel}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Eventos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[15px] font-semibold text-[#111827]">Agenda (próximos eventos)</h2>
                        <p className="text-[12px] text-[#9CA3AF]">Agenda futura para acompanhar resultados e gatilhos.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(['30 dias', '60 dias', '90 dias'] as FeedWindow[]).map((period) => (
                          <button key={period} onClick={() => setEventsWindow(period)} className={cx('h-7 rounded-full px-3.5 text-[13px]', period === eventsWindow ? 'border border-[#E5E7EB] bg-white font-semibold text-[#111827]' : 'text-[#6B7280]')}>
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(activeData?.timelineEvents ?? []).filter((timelineEvent) => timelineEvent.companyId === companyContext.companyId).length === 0 && (
                        <article className="rounded-xl border border-[#E8EAED] bg-white p-4">
                          <p className="text-[13px] text-[#6B7280]">Ainda não temos dados suficientes para este indicador.</p>
                          <p className="mt-1 text-[11px] text-[#9CA3AF]">Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}</p>
                          <p className="text-[11px] text-[#9CA3AF]">Fonte esperada: CVM/RI</p>
                        </article>
                      )}
                      {(activeData?.timelineEvents ?? []).filter((timelineEvent) => timelineEvent.companyId === companyContext.companyId).map((timelineEvent, index, list) => (
                        <div key={timelineEvent.title} className="flex gap-4">
                          <div className="flex w-10 flex-col items-center">
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0E9384]" />
                            {index !== list.length - 1 && <span className="mt-1 h-full w-px bg-[#E8EAED]" />}
                          </div>
                          <div className="flex-1">
                            <p className="mb-1 text-[12px] text-[#9CA3AF]">{timelineEvent.date}</p>
                            <article className="flex items-center justify-between rounded-lg border border-[#E8EAED] bg-white p-3.5">
                              <div>
                                <p className="text-[13px] font-semibold text-[#111827]">Próximo evento: {timelineEvent.title}</p>
                                <p className="text-[11px] text-[#9CA3AF]">Fonte: {safeMeta(timelineEvent.source)}</p>
                              </div>
                              <button className={cx('rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#6B7280]', actionsDisabled ? 'cursor-not-allowed opacity-50' : '')} disabled={actionsDisabled} onClick={(event) => guardAction(event, timelineEvent.companyId)}>Adicionar lembrete</button>
                            </article>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Preco' && (
                  <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[15px] font-semibold text-[#111827]">Preço em contexto</h2>
                      <div className="inline-flex rounded-full bg-[#F9FAFB] p-1">
                        {(['P/L', 'EV/EBITDA', 'P/VP'] as PriceMetric[]).map((metric) => {
                          const hasMetric = availablePriceMetrics.includes(metric);
                          return (
                            <button
                              key={metric}
                              onClick={() => hasMetric && setSelectedPriceMetric(metric)}
                              disabled={!hasMetric}
                              className={cx(
                                'rounded-full px-2.5 py-1 text-[11px]',
                                selectedPriceMetric === metric ? 'border border-[#99F6E4] bg-[#F0FDFA] font-semibold text-[#0E9384]' : 'text-[#6B7280]',
                                !hasMetric ? 'cursor-not-allowed opacity-40' : ''
                              )}
                            >
                              {metric}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      Hoje está {activePriceRow?.insight?.toLowerCase() ?? 'sem dados para este indicador'} em {selectedPriceMetric}.
                    </p>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">Fonte: {safeMeta(activeData?.priceData.source)} • Atualizado em: {safeMeta(activeData?.priceData.updatedAt)}</p>
                    <p className="mt-4 text-[28px] font-bold text-[#111827]">Preço atual: {activeData?.priceData.current}</p>

                    <div className="mt-4 rounded-lg border border-[#F3F4F6] p-4">
                      {!activePriceSeries && (
                        <div className="py-3 text-[12px] text-[#9CA3AF]">
                          Ainda não temos dados suficientes para este indicador. Última tentativa: {safeMeta(activeData?.priceData.updatedAt)}. Fonte esperada: CVM/RI
                        </div>
                      )}
                      <div className="flex h-28 items-end gap-2">
                        {(activePriceSeries?.values ?? []).map((value, index) => (
                          <div key={activePriceSeries?.labels[index]} className="flex flex-1 flex-col items-center gap-1">
                            <div className={cx('w-full rounded-md', index <= 2 ? 'bg-[#D1FAE5]' : index <= 4 ? 'bg-[#FDE68A]' : 'bg-[#FECACA]')} style={{ height: `${value * 8}px` }} />
                            <span className="text-[11px] text-[#9CA3AF]">{activePriceSeries?.labels[index]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="relative mt-3 h-6">
                        <div className="absolute inset-x-0 top-3 h-px bg-[#E5E7EB]" />
                        <div className="absolute top-0 h-6 w-px bg-[#0E9384]" style={{ left: `${(((activePriceSeries?.currentMarker ?? 0) / Math.max((activePriceSeries?.labels.length ?? 1) - 1, 1)) * 100)}%` }} />
                        <div className="absolute top-0 h-6 w-px border-l border-dashed border-[#9CA3AF]" style={{ left: `${(((activePriceSeries?.medianMarker ?? 0) / Math.max((activePriceSeries?.labels.length ?? 1) - 1, 1)) * 100)}%` }} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-[#0E9384]">Hoje</span>
                        <span className="text-[#6B7280]">Mediana 5a</span>
                      </div>
                      <p className="mt-2 text-[12px] italic text-[#6B7280]">Isso mostra em quantos períodos o ativo esteve mais caro/barato do que hoje.</p>
                    </div>

                    <div className="mt-5">
                      <div className="grid grid-cols-5 border-b border-[#F3F4F6] pb-3 text-[12px] font-semibold text-[#9CA3AF]">
                        <span>Métrica</span>
                        <span>Atual</span>
                        <span>Setor</span>
                        <span>Histórico 5a</span>
                        <span>Interpretação</span>
                      </div>
                      {(activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric).map((row) => (
                        <div key={row.metric} className="grid grid-cols-5 border-b border-[#F3F4F6] py-3.5 text-[13px] text-[#111827]">
                          <span className="font-medium">{row.metric}</span>
                          <span>{row.current}</span>
                          <span>{row.sector}</span>
                          <span>{row.historical}</span>
                          <span className="text-[#6B7280]">{row.insight}</span>
                        </div>
                      ))}
                      {((activeData?.priceData.rows ?? []).filter((row) => row.companyId === companyContext.companyId && row.metric === selectedPriceMetric).length === 0) && (
                        <div className="py-3 text-[12px] text-[#9CA3AF]">Sem dados para este indicador.</div>
                      )}
                    </div>
                    <p className="mt-4 text-[12px] italic text-[#6B7280]">Multiplicadores ajudam a comparar, mas mudam com juros e crescimento.</p>
                  </article>
                )}

                {activeTab === 'Fontes' && (
                  <article className="rounded-xl border border-[#E8EAED] bg-white p-5">
                    <h2 className="text-[15px] font-semibold text-[#111827]">Fontes & Metodologia</h2>
                    <p className="mt-1 text-[13px] text-[#6B7280]">Aqui está de onde vêm os dados e quão recentes eles são.</p>
                    <div className="mt-4 overflow-hidden rounded-lg border border-[#F3F4F6]">
                      {(activeData?.sourceRows ?? []).filter((row) => row.companyId === companyContext.companyId).length === 0 && (
                        <div className="px-4 py-3 text-[12px] text-[#9CA3AF]">
                          Ainda não temos dados suficientes para este indicador. Última tentativa: {safeMeta(activeData?.summaryMeta.updatedAt)}. Fonte esperada: CVM/RI
                        </div>
                      )}
                      <div className="grid grid-cols-6 border-b border-[#F3F4F6] bg-white px-4 py-3 text-[12px] font-semibold text-[#9CA3AF]">
                        <span>Categoria</span>
                        <span>Fonte</span>
                        <span>Documento</span>
                        <span>Data</span>
                        <span>Status</span>
                        <span>Link</span>
                      </div>
                      {(activeData?.sourceRows ?? []).filter((row) => row.companyId === companyContext.companyId).map((row) => (
                        <div key={row.category} className="grid grid-cols-6 items-center border-b border-[#F3F4F6] px-4 py-3 text-[13px] text-[#111827] transition-colors hover:bg-[#F9FAFB]">
                          <span>{row.category}</span>
                          <span>{safeMeta(row.source)}</span>
                          <span>{row.doc}</span>
                          <span>{safeMeta(row.date)}</span>
                          <span>
                            <span className={cx('rounded-full border px-2.5 py-1 text-[11px] font-semibold', row.status === 'Atualizado' ? 'border-[#99F6E4] bg-[#F0FDFA] text-[#0E9384]' : 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]')}>
                              {row.status}
                            </span>
                          </span>
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              if (guardAction(event, row.companyId)) return;
                            }}
                            className={cx('inline-flex items-center gap-1 text-[12px] text-[#0E9384] hover:underline', actionsDisabled ? 'opacity-50' : '')}
                          >
                            Abrir
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </article>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}






