import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Nav,
  NavLogo,
  NavButtons,
  NavButton,
  Hero,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  PrimaryButton,
  SecondaryButton,
  Section,
  SectionInner,
  SectionTitle,
  SectionSubtitle,
  FeaturesGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  StepsGrid,
  StepCard,
  StepNumber,
  StepTitle,
  StepDescription,
  BenefitsGrid,
  BenefitItem,
  BenefitIcon,
  BenefitContent,
  BenefitTitle,
  BenefitDescription,
  CTASection,
  CTATitle,
  CTASubtitle,
  Footer,
  FooterText,
  FooterLinks,
} from './Home.styles';

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

const STEPS = [
  {
    title: 'Crie sua conta',
    description: 'Cadastro rápido com o nome da sua empresa. Em segundos você já tem acesso ao sistema.',
  },
  {
    title: 'Configure seus serviços',
    description: 'Adicione os serviços que oferece, defina categorias, itens e preços base.',
  },
  {
    title: 'Gere orçamentos',
    description: 'Monte orçamentos personalizados e envie PDFs profissionais aos seus clientes.',
  },
];

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

export function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Page>
      <Nav $scrolled={scrolled}>
        <NavLogo>FluxaQuote</NavLogo>
        <NavButtons>
          <NavButton onClick={() => navigate('/login')}>Entrar</NavButton>
          <NavButton $primary onClick={() => navigate('/registro')}>Criar conta</NavButton>
        </NavButtons>
      </Nav>

      <Hero>
        <HeroTitle>
          Orçamentos <span>profissionais</span> em minutos
        </HeroTitle>
        <HeroSubtitle>
          Crie, gerencie e envie orçamentos detalhados com a identidade visual da sua empresa.
          Tudo em um sistema simples, rápido e organizado.
        </HeroSubtitle>
        <HeroButtons>
          <PrimaryButton onClick={() => navigate('/registro')}>
            Começar agora
          </PrimaryButton>
          <SecondaryButton onClick={scrollToFeatures}>
            Saiba mais
          </SecondaryButton>
        </HeroButtons>
      </Hero>

      <Section ref={featuresRef}>
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

      <Section $dark>
        <SectionInner>
          <SectionTitle>
            Como <span>funciona</span>
          </SectionTitle>
          <SectionSubtitle>
            Três passos simples para começar a enviar orçamentos profissionais.
          </SectionSubtitle>
          <StepsGrid>
            {STEPS.map((step, index) => (
              <StepCard key={step.title}>
                <StepNumber>{index + 1}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
            ))}
          </StepsGrid>
        </SectionInner>
      </Section>

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

      <CTASection>
        <CTATitle>Pronto para profissionalizar seus orçamentos?</CTATitle>
        <CTASubtitle>
          Crie sua conta e comece a usar agora. Sem complicação.
        </CTASubtitle>
        <PrimaryButton onClick={() => navigate('/registro')}>
          Criar conta grátis
        </PrimaryButton>
      </CTASection>

      <Footer>
        <FooterText>FluxaQuote &copy; {new Date().getFullYear()}</FooterText>
        <FooterLinks>
          <button onClick={() => navigate('/login')}>Entrar</button>
          <button onClick={() => navigate('/registro')}>Criar conta</button>
        </FooterLinks>
      </Footer>
    </Page>
  );
}
