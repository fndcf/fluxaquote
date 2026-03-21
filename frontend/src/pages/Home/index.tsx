import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Nav, NavLogo, NavButtons, NavButton } from './styles';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StepsSection } from './StepsSection';
import { BenefitsSection } from './BenefitsSection';
import { CTASection } from './CTASection';
import { HomeFooter } from './HomeFooter';

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

  const navigateLogin = () => navigate('/login');
  const navigateRegister = () => navigate('/registro');

  return (
    <Page>
      <Nav $scrolled={scrolled}>
        <NavLogo>FluxaQuote</NavLogo>
        <NavButtons>
          <NavButton onClick={navigateLogin}>Entrar</NavButton>
          <NavButton $primary onClick={navigateRegister}>Criar conta</NavButton>
        </NavButtons>
      </Nav>

      <HeroSection
        onNavigateRegister={navigateRegister}
        onScrollToFeatures={scrollToFeatures}
      />

      <FeaturesSection ref={featuresRef} />

      <StepsSection />

      <BenefitsSection />

      <CTASection onNavigateRegister={navigateRegister} />

      <HomeFooter
        onNavigateLogin={navigateLogin}
        onNavigateRegister={navigateRegister}
      />
    </Page>
  );
}
