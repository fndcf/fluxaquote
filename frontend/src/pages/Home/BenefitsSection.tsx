import {
  Section,
  SectionInner,
  SectionTitle,
  SectionSubtitle,
  BenefitsGrid,
  BenefitItem,
  BenefitIcon,
  BenefitContent,
  BenefitTitle,
  BenefitDescription,
} from './styles';

const BENEFITS = [
  {
    icon: '\u{1F3A8}',
    title: 'Sua marca, suas cores',
    description: 'Personalize cores e logo. Seus orçamentos saem com a identidade visual da sua empresa.',
  },
  {
    icon: '\u{1F512}',
    title: 'Dados isolados e seguros',
    description: 'Cada empresa tem seu ambiente exclusivo. Seus dados nunca se misturam com os de outros.',
  },
  {
    icon: '\u{1F4C4}',
    title: 'PDF pronto para envio',
    description: 'Gere documentos profissionais em PDF com um clique. Orçamento completo ou ordem de execução.',
  },
  {
    icon: '\u{1F514}',
    title: 'Notificações em tempo real',
    description: 'Receba alertas sobre orçamentos aprovados, vencidos e mudanças importantes.',
  },
];

export function BenefitsSection() {
  return (
    <Section>
      <SectionInner>
        <SectionTitle>
          Por que escolher o <span>FluxaQuote</span>?
        </SectionTitle>
        <SectionSubtitle>
          Um sistema feito para facilitar a rotina de quem trabalha com prestação de serviços.
        </SectionSubtitle>
        <BenefitsGrid>
          {BENEFITS.map((benefit) => (
            <BenefitItem key={benefit.title}>
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitContent>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitDescription>{benefit.description}</BenefitDescription>
              </BenefitContent>
            </BenefitItem>
          ))}
        </BenefitsGrid>
      </SectionInner>
    </Section>
  );
}
