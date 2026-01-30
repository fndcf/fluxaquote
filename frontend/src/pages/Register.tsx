import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
  padding: 16px;
`;

const RegisterCard = styled.div`
  background: var(--surface);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;

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
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
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

const SlugPreview = styled.div`
  background: var(--background);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);

  span {
    color: var(--primary);
    font-weight: 500;
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
  cursor: pointer;
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function generateSlugPreview(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function Register() {
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const slugPreview = useMemo(() => generateSlugPreview(nomeEmpresa), [nomeEmpresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        nomeEmpresa,
        email,
        telefone,
        senha,
      });

      navigate('/login', { state: { registroSucesso: true } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr?.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RegisterCard>
        <Logo>
          <h1>FluxaQuote</h1>
          <p>Crie sua conta</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <label htmlFor="nomeEmpresa">Nome da Empresa</label>
            <input
              id="nomeEmpresa"
              type="text"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              placeholder="Minha Empresa Ltda"
              required
              minLength={3}
            />
            {slugPreview && (
              <SlugPreview>
                Seu link: <span>fluxaquote.com/{slugPreview}</span>
              </SlugPreview>
            )}
          </InputGroup>

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
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              required
              minLength={10}
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Form>

        <LoginLink>
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </LoginLink>
      </RegisterCard>
    </Container>
  );
}
