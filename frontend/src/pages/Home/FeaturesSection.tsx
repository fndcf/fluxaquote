import { forwardRef } from 'react';
import {
  Section,
  SectionInner,
  SectionTitle,
  SectionSubtitle,
  FeaturesGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from './styles';

const FEATURES = [
  {
    icon: '\u{1F4C4}',
    title: 'Orçamentos profissionais',
    description: 'Crie orçamentos detalhados com serviços, itens e valores. Gere PDFs prontos para enviar ao cliente com a identidade visual da sua empresa.',
  },
  {
    icon: '\u{1F465}',
    title: 'Gestão de Clientes',
    description: 'Cadastre clientes com dados completos, histórico de orçamentos e acompanhamento de cada negociação.',
  },
  {
    icon: '\u{1F6E0}\u{FE0F}',
    title: 'Catálogo de Serviços',
    description: 'Organize serviços por categorias, configure itens com valores e mantenha uma tabela de preços sempre atualizada.',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Relatórios e Métricas',
    description: 'Acompanhe faturamento, orçamentos aprovados, taxa de conversão e desempenho do negócio com gráficos claros.',
  },
];

export const FeaturesSection = forwardRef<HTMLElement>(function FeaturesSection(_props, ref) {
  return (
    <Section ref={ref}>
      <SectionInner>
        <SectionTitle>
          Tudo que você precisa para <span>gerenciar orçamentos</span>
        </SectionTitle>
        <SectionSubtitle>
          Funcionalidades pensadas para quem precisa de agilidade e profissionalismo no dia a dia.
        </SectionSubtitle>
        <FeaturesGrid>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </SectionInner>
    </Section>
  );
});
