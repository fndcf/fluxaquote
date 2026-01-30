import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Button as UIButton } from "../components/ui";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--secondary) 0%,
    var(--secondary-light) 100%
  );
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const LoginCard = styled.div`
  background: var(--surface);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 8px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: var(--primary);
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;

    h1 {
      font-size: 2rem;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
    color: var(--text-primary);
  }

  input {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
`;

const Button = styled.button`
  background: var(--primary);
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover {
    background: var(--primary-dark);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  background: rgba(244, 67, 54, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

const ForgotPasswordLink = styled.div`
  text-align: center;
  margin-top: -8px;
  font-size: 0.85rem;
  color: var(--text-secondary);

  button {
    background: none;
    border: none;
    color: var(--primary);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  input {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const ModalMessage = styled.p<{ $type: 'success' | 'error' }>`
  font-size: 0.85rem;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  margin: 0;

  color: ${({ $type }) => $type === 'success' ? 'var(--success)' : 'var(--error)'};
  background: ${({ $type }) => $type === 'success' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
`;

const FooterLinks = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const slug = await signIn(email, password);
      navigate(`/${slug}/dashboard`);
    } catch {
      setError("Email ou senha incorretos");
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
