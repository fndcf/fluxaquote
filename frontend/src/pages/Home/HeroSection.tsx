import {
  Hero,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  PrimaryButton,
  SecondaryButton,
} from './styles';

interface HeroSectionProps {
  onNavigateRegister: () => void;
  onScrollToFeatures: () => void;
}

export function HeroSection({ onNavigateRegister, onScrollToFeatures }: HeroSectionProps) {
  return (
    <Hero>
      <HeroTitle>
        Orçamentos <span>profissionais</span> em minutos
      </HeroTitle>
      <HeroSubtitle>
        Crie, gerencie e envie orçamentos detalhados com a identidade visual da sua empresa.
        Tudo em um sistema simples, rápido e organizado.
      </HeroSubtitle>
      <HeroButtons>
        <PrimaryButton onClick={onNavigateRegister}>
          Começar agora
        </PrimaryButton>
        <SecondaryButton onClick={onScrollToFeatures}>
          Saiba mais
        </SecondaryButton>
      </HeroButtons>
    </Hero>
  );
}
