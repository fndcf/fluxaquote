import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  background: var(--secondary);
  color: #fff;
  overflow-x: hidden;
`;

const Nav = styled.nav<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  transition: background 0.3s, box-shadow 0.3s;
  background: ${({ $scrolled }) => $scrolled ? 'var(--secondary)' : 'transparent'};
  box-shadow: ${({ $scrolled }) => $scrolled ? '0 2px 12px rgba(0,0,0,0.3)' : 'none'};

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const NavLogo = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
`;

const NavButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: ${({ $primary }) => $primary ? 'none' : '1px solid rgba(255,255,255,0.3)'};
  background: ${({ $primary }) => $primary ? 'var(--primary)' : 'transparent'};
  color: #fff;

  &:hover {
    background: ${({ $primary }) => $primary ? 'var(--primary-dark)' : 'rgba(255,255,255,0.1)'};
  }
`;

const Hero = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 24px 80px;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 24px;
  max-width: 700px;

  span {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 560px;
  line-height: 1.7;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const PrimaryButton = styled.button`
  background: var(--primary);
  color: #fff;
  padding: 14px 36px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #fff;
  padding: 14px 36px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const Section = styled.section<{ $dark?: boolean }>`
  padding: 80px 24px;
  background: ${({ $dark }) => $dark ? 'var(--secondary)' : 'var(--secondary-light)'};

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const SectionInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;

  span {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 32px;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.6;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const StepCard = styled.div`
  text-align: center;
  padding: 24px;
`;

const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const StepTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const BenefitIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
`;

const BenefitContent = styled.div``;

const BenefitTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const BenefitDescription = styled.p`
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const CTASection = styled.section`
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary) 100%);

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const CTASubtitle = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.05rem;
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const Footer = styled.footer`
  padding: 32px 24px;
  text-align: center;
  background: var(--secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: var(--primary);
    }
  }
`;

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
