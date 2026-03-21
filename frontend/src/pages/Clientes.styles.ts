import styled from "styled-components";

export const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const ClienteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;

  &:hover .nome {
    color: var(--primary);
  }

  .nome {
    font-weight: 500;
    transition: color 0.2s;
  }

  .fantasia {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .nome {
      font-size: 0.9rem;
    }

    .fantasia {
      font-size: 0.75rem;
    }
  }
`;

export const ConfirmDialog = styled.div`
  text-align: center;

  p {
    margin-bottom: 20px;
    color: var(--text-secondary);
  }

  strong {
    color: var(--text-primary);
  }
`;

export const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
