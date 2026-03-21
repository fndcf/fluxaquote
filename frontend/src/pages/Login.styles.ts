import styled from "styled-components";

export const Container = styled.div`
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

export const LoginCard = styled.div`
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

export const Logo = styled.div`
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const InputGroup = styled.div`
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

export const Button = styled.button`
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

export const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  background: rgba(244, 67, 54, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

export const SuccessMessage = styled.p`
  color: var(--success);
  font-size: 0.875rem;
  text-align: center;
  background: rgba(76, 175, 80, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

export const ForgotPasswordLink = styled.div`
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

export const ModalContent = styled.div`
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

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

export const ModalMessage = styled.p<{ $type: 'success' | 'error' }>`
  font-size: 0.85rem;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  margin: 0;

  color: ${({ $type }) => $type === 'success' ? 'var(--success)' : 'var(--error)'};
  background: ${({ $type }) => $type === 'success' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
`;

export const FooterLinks = styled.div`
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
