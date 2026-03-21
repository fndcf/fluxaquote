import {
  Footer,
  FooterText,
  FooterLinks,
} from './styles';

interface HomeFooterProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export function HomeFooter({ onNavigateLogin, onNavigateRegister }: HomeFooterProps) {
  return (
    <Footer>
      <FooterText>FluxaQuote &copy; {new Date().getFullYear()}</FooterText>
      <FooterLinks>
        <button onClick={onNavigateLogin}>Entrar</button>
        <button onClick={onNavigateRegister}>Criar conta</button>
      </FooterLinks>
    </Footer>
  );
}
