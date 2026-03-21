import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
  padding: 16px;
`;

export const RegisterCard = styled.div`
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

export const Logo = styled.div`
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const InputGroup = styled.div`
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

export const SlugPreview = styled.div`
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

export const Button = styled.button`
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

export const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  background: rgba(244, 67, 54, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

export const LoginLink = styled.div`
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
