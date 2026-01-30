import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
  padding: 24px;
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
`;

const Title = styled.h1`
  color: var(--primary);
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  margin-bottom: 48px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 32px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PrimaryButton = styled.button`
  background: var(--primary);
  color: white;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-dark);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: white;
  padding: 14px 32px;
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

export function Home() {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <Title>FluxaQuote</Title>
        <Subtitle>
          Sistema completo para gerenciamento de clientes e orçamentos.
          Crie sua conta e comece a organizar seus orçamentos de forma profissional.
        </Subtitle>

        <ButtonGroup>
          <PrimaryButton onClick={() => navigate('/registro')}>
            Criar conta
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/login')}>
            Entrar
          </SecondaryButton>
        </ButtonGroup>
      </Content>
    </Container>
  );
}
