import {
  CTASection as CTASectionStyled,
  CTATitle,
  CTASubtitle,
  PrimaryButton,
} from './styles';

interface CTASectionProps {
  onNavigateRegister: () => void;
}

export function CTASection({ onNavigateRegister }: CTASectionProps) {
  return (
    <CTASectionStyled>
      <CTATitle>Pronto para profissionalizar seus orçamentos?</CTATitle>
      <CTASubtitle>
        Crie sua conta e comece a usar agora. Sem complicação.
      </CTASubtitle>
      <PrimaryButton onClick={onNavigateRegister}>
        Criar conta grátis
      </PrimaryButton>
    </CTASectionStyled>
  );
}
