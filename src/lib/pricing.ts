export interface NeighborhoodOption {
  label: string;
  city: 'Santo Amaro da Imperatriz' | 'Palhoça' | 'São José' | 'Florianópolis';
  fee: number | null;
}

export const CITIES = ['Santo Amaro da Imperatriz', 'Palhoça', 'São José', 'Florianópolis'] as const;
export type City = typeof CITIES[number];

export const neighborhoods: NeighborhoodOption[] = [
  { label: 'Centro', city: 'Santo Amaro da Imperatriz', fee: 10 },
  { label: 'Alto Arirú', city: 'Palhoça', fee: 13 },
  { label: 'Arirú', city: 'Palhoça', fee: 13 },
  { label: 'Arirú da Formiga', city: 'Palhoça', fee: 13 },
  { label: 'Vila Nova', city: 'Palhoça', fee: 13 },
  { label: 'Pacheco', city: 'Palhoça', fee: 13 },
  { label: 'Guarda do Cubatão', city: 'Palhoça', fee: 13 },
  { label: 'Centro', city: 'Palhoça', fee: 15 },
  { label: 'Pagani', city: 'Palhoça', fee: 15 },
  { label: 'Passa Vinte', city: 'Palhoça', fee: 15 },
  { label: 'Pedra Branca', city: 'Palhoça', fee: 15 },
  { label: 'Bela Vista', city: 'Palhoça', fee: 15 },
  { label: 'Caminho Novo', city: 'Palhoça', fee: 15 },
  { label: 'São Sebastião', city: 'Palhoça', fee: 15 },
  { label: 'Nova Palhoça', city: 'Palhoça', fee: 15 },
  { label: 'Madri', city: 'Palhoça', fee: 15 },
  { label: 'Ponte do Imaruim', city: 'Palhoça', fee: 18 },
  { label: 'Barra do Arirú', city: 'Palhoça', fee: 18 },
  { label: 'Rio Grande', city: 'Palhoça', fee: 18 },
  { label: 'Jardim Eldorado', city: 'Palhoça', fee: 18 },
  { label: 'Brejaru', city: 'Palhoça', fee: 18 },
  { label: 'Frei Damião', city: 'Palhoça', fee: 18 },
  { label: 'Furadinho', city: 'Palhoça', fee: 18 },
  { label: 'Praia de Fora', city: 'Palhoça', fee: 25 },
  { label: 'Praia do Meio', city: 'Palhoça', fee: 25 },
  { label: 'Enseada de Brito', city: 'Palhoça', fee: 25 },
  { label: 'Maciambu', city: 'Palhoça', fee: 25 },
  { label: 'Praia do Sonho', city: 'Palhoça', fee: 35 },
  { label: 'Pinheira', city: 'Palhoça', fee: 35 },
  { label: 'Guarda do Embaú', city: 'Palhoça', fee: 35 },
  { label: 'Balneário Ponta do Papagaio', city: 'Palhoça', fee: 35 },
  { label: 'Morretes', city: 'Palhoça', fee: 35 },
  { label: 'Fazenda Santo Antônio', city: 'São José', fee: 18 },
  { label: 'Distrito Industrial', city: 'São José', fee: 18 },
  { label: 'Picadas do Sul', city: 'São José', fee: 18 },
  { label: 'Flor de Nápolis', city: 'São José', fee: 18 },
  { label: 'Ponta de Baixo', city: 'São José', fee: 18 },
  { label: 'Sertão do Maruim', city: 'São José', fee: 18 },
  { label: 'Kobrasol', city: 'São José', fee: 22 },
  { label: 'Campinas', city: 'São José', fee: 22 },
  { label: 'Praia Comprida', city: 'São José', fee: 22 },
  { label: 'Centro', city: 'São José', fee: 22 },
  { label: 'Roçado', city: 'São José', fee: 22 },
  { label: 'Bosque das Mansões', city: 'São José', fee: 22 },
  { label: 'São Luiz', city: 'São José', fee: 22 },
  { label: 'Barreiros', city: 'São José', fee: 25 },
  { label: 'Bela Vista', city: 'São José', fee: 25 },
  { label: 'Nossa Senhora do Rosário', city: 'São José', fee: 25 },
  { label: 'Ipiranga', city: 'São José', fee: 25 },
  { label: 'Serraria', city: 'São José', fee: 25 },
  { label: 'Jardim Cidade de Florianópolis', city: 'São José', fee: 25 },
  { label: 'Jardim Santiago', city: 'São José', fee: 25 },
  { label: 'Areias', city: 'São José', fee: 25 },
  { label: 'Forquilhinha', city: 'São José', fee: 28 },
  { label: 'Forquilhas', city: 'São José', fee: 28 },
  { label: 'Potecas', city: 'São José', fee: 28 },
  { label: 'Pedregal', city: 'São José', fee: 28 },
  { label: 'Real Parque', city: 'São José', fee: 28 },
  { label: 'Colônia Santana', city: 'São José', fee: 32 },
  { label: 'Centro', city: 'Florianópolis', fee: 22 },
  { label: 'Trindade', city: 'Florianópolis', fee: 25 },
  { label: 'Coqueiros', city: 'Florianópolis', fee: 22 },
  { label: 'Agronômica', city: 'Florianópolis', fee: 25 },
  { label: 'Campeche', city: 'Florianópolis', fee: 35 },
  { label: 'Cacupé', city: 'Florianópolis', fee: 30 },
  { label: 'Carianos', city: 'Florianópolis', fee: 30 },
  { label: 'Carvoeira', city: 'Florianópolis', fee: 25 },
  { label: 'Corrego Grande', city: 'Florianópolis', fee: 25 },
  { label: 'Costeira do Pirajubaé', city: 'Florianópolis', fee: 35 },
  { label: 'Estreito', city: 'Florianópolis', fee: 22 },
  { label: 'Itacorubi', city: 'Florianópolis', fee: 30 },
  { label: 'João Paulo', city: 'Florianópolis', fee: 30 },
  { label: 'Monte Verde', city: 'Florianópolis', fee: 25 },
  { label: 'Pantanal', city: 'Florianópolis', fee: 30 },
  { label: 'Praia da Joaquina', city: 'Florianópolis', fee: 35 },
  { label: 'Saco dos Limões', city: 'Florianópolis', fee: 25 },
  { label: 'Santa Mônica', city: 'Florianópolis', fee: 28 },
  { label: 'São José', city: 'Florianópolis', fee: 25 },
  { label: 'Tapera', city: 'Florianópolis', fee: 35 },
];

export const PAYMENT_LABELS: Record<string, string> = {
  pago_loja: 'Pago na Loja',
  receber_loja: 'A Receber na Loja',
};

export const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_rota: 'Em Rota',
  entregue: 'Entregue',
  nao_entregue: 'Não Entregue',
};

export const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  em_rota: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  entregue: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  nao_entregue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'A consultar';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
