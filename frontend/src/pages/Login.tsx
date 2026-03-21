import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Button as UIButton } from "../components/ui";
import {
  Container,
  LoginCard,
  Logo,
  Form,
  InputGroup,
  Button,
  ErrorMessage,
  SuccessMessage,
  ForgotPasswordLink,
  ModalContent,
  ModalButtons,
  ModalMessage,
  FooterLinks,
} from "./Login.styles";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registroSucesso = (location.state as { registroSucesso?: boolean })?.registroSucesso;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const slug = await signIn(email, password);
      navigate(`/${slug}/dashboard`);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/user-disabled") {
        setError("Sua conta ainda não foi ativada. Aguarde a aprovação do administrador.");
      } else {
        setError("Email ou senha incorretos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = () => {
    setResetEmail("");
    setResetMessage(null);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'Digite seu email.' });
      return;
    }

    setResetMessage(null);
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetMessage({ type: 'success', text: 'Email de recuperação enviado! Verifique sua caixa de entrada.' });
    } catch {
      setResetMessage({ type: 'error', text: 'Erro ao enviar email. Verifique o endereço digitado.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Logo>
          <h1>FluxaQuote</h1>
          <p>Sistema de Orçamentos</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {registroSucesso && (
            <SuccessMessage>
              Conta criada com sucesso! Faça login para acessar o sistema.
            </SuccessMessage>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </InputGroup>

          <ForgotPasswordLink>
            Esqueceu a senha?{' '}
            <button type="button" onClick={handleOpenResetModal}>
              Clique aqui para recuperá-la
            </button>
          </ForgotPasswordLink>

          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Form>

        <FooterLinks>
          <div>
            Não tem uma conta? <Link to="/registro">Criar conta</Link>
          </div>
          <div>
            <Link to="/">Voltar para home</Link>
          </div>
        </FooterLinks>
      </LoginCard>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Recuperar Senha"
        width="400px"
      >
        <ModalContent>
          <p>Digite seu email para receber o link de recuperação de senha.</p>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          {resetMessage && (
            <ModalMessage $type={resetMessage.type}>{resetMessage.text}</ModalMessage>
          )}
          <ModalButtons>
            <UIButton $variant="ghost" onClick={() => setShowResetModal(false)}>
              Cancelar
            </UIButton>
            <UIButton onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? 'Enviando...' : 'Recuperar'}
            </UIButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </Container>
  );
}
