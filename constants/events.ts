export type Event = {
  id: string;
  title: string;
  emoji: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image: string;
};

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Beleza em Foco 2025',
    emoji: '💄',
    category: 'Beleza & Estética',
    date: '12 a 14 de março de 2025',
    location: 'Expo Center Norte, São Paulo',
    description:
      'O maior evento de beleza e estética do Brasil reúne profissionais, marcas e tendências do setor em três dias de imersão, workshops e lançamentos exclusivos.',
    image: 'https://picsum.photos/seed/beleza2025/600/400',
  },
  {
    id: '2',
    title: 'Car Date',
    emoji: '🚗',
    category: 'Automobilismo',
    date: '25 de abril de 2025',
    location: 'Autódromo Internacional, Curitiba',
    description:
      'Encontro de carros clássicos e modernos com exposição, trilha sonora ao vivo e gastronomia. Um evento para apaixonados por automóveis de todas as eras.',
    image: 'https://picsum.photos/seed/cardate/600/400',
  },
  {
    id: '3',
    title: 'Cinema ao Ar Livre',
    emoji: '🎬',
    category: 'Cinema & Arte',
    date: '3 e 4 de maio de 2025',
    location: 'Parque Municipal, Belo Horizonte',
    description:
      'Sessões gratuitas de cinema sob as estrelas no coração da cidade. Filmes nacionais e internacionais com pipoca e boa companhia.',
    image: 'https://picsum.photos/seed/cinema2025/600/400',
  },
  {
    id: '4',
    title: 'Cultivo Coletivo 2025',
    emoji: '🌱',
    category: 'Sustentabilidade',
    date: '10 de junho de 2025',
    location: 'Parque da Lagoa, Florianópolis',
    description:
      'Festival de cultura sustentável com feira de orgânicos, oficinas de permacultura, música ao vivo e atividades para toda a família.',
    image: 'https://picsum.photos/seed/cultivo2025/600/400',
  },
  {
    id: '5',
    title: 'Business Expo 2025',
    emoji: '💼',
    category: 'Negócios',
    date: '22 a 24 de agosto de 2025',
    location: 'Centro de Convenções Ulysses Guimarães, Brasília',
    description:
      'A principal feira de negócios do Centro-Oeste reúne empreendedores, investidores e startups para três dias de networking, palestras e oportunidades.',
    image: 'https://picsum.photos/seed/businessexpo/600/400',
  },
  {
    id: '6',
    title: 'Fresio Festival',
    emoji: '🎵',
    category: 'Música',
    date: '7 e 8 de setembro de 2025',
    location: 'Marco Zero, Recife',
    description:
      'Festival de música independente com shows de artistas locais e nacionais, gastronomia pernambucana e arte urbana no coração do Recife Antigo.',
    image: 'https://picsum.photos/seed/fresio2025/600/400',
  },
  {
    id: '7',
    title: 'Festival do Dia das Crianças',
    emoji: '🎠',
    category: 'Família',
    date: '12 de outubro de 2025',
    location: 'Parque Costa Azul, Salvador',
    description:
      'Um dia inteiro de diversão para crianças e famílias com brinquedos, shows infantis, oficinas criativas e muita alegria à beira-mar.',
    image: 'https://picsum.photos/seed/festivalcriancas/600/400',
  },
  {
    id: '8',
    title: 'Book Fair',
    emoji: '📚',
    category: 'Literatura',
    date: '19 a 22 de outubro de 2025',
    location: 'Cais Mauá, Porto Alegre',
    description:
      'Feira literária com lançamentos, bate-papos com autores, saraus e uma vasta programação cultural para leitores de todas as idades.',
    image: 'https://picsum.photos/seed/bookfair2025/600/400',
  },
  {
    id: '9',
    title: 'Natal Encantado de Gramado',
    emoji: '🎄',
    category: 'Natal & Cultura',
    date: '5 a 28 de dezembro de 2025',
    location: 'Centro Histórico, Gramado',
    description:
      'O mais famoso natal do Brasil transforma Gramado em um conto de fadas com decoração deslumbrante, shows, gastronomia e a magia do inverno gaúcho.',
    image: 'https://picsum.photos/seed/natalgramado/600/400',
  },
  {
    id: '10',
    title: 'Os Quintessenciais',
    emoji: '🎭',
    category: 'Teatro',
    date: '15 de novembro de 2025',
    location: 'Teatro Municipal, Rio de Janeiro',
    description:
      'Espetáculo teatral premiado que une dança contemporânea, música ao vivo e narrativa visual em uma experiência sensorial única e inesquecível.',
    image: 'https://picsum.photos/seed/quintessenciais/600/400',
  },
];

