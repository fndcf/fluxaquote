import styled from "styled-components";
import { OrcamentoStatus } from "../types";

export const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  ${({ $status }) => {
    switch ($status) {
      case "aberto":
        return `
          background: rgba(33, 150, 243, 0.1);
          color: #1976d2;
        `;
      case "aceito":
        return `
          background: rgba(76, 175, 80, 0.1);
          color: #388e3c;
        `;
      case "recusado":
        return `
          background: rgba(244, 67, 54, 0.1);
          color: #d32f2f;
        `;
      case "expirado":
        return `
          background: rgba(158, 158, 158, 0.1);
          color: #616161;
        `;
    }
  }}
`;

export const OrcamentoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:hover .numero {
    text-decoration: underline;
  }

  .numero {
    font-weight: 600;
    color: var(--primary);
  }

  .cliente {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .numero {
      font-size: 0.9rem;
    }

    .cliente {
      font-size: 0.8rem;
    }
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  select {
    min-width: 150px;
  }

  @media (max-width: 768px) {
    width: 100%;

    select {
      flex: 1;
      min-width: unset;
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

export const StatusDialog = styled.div`
  p {
    margin-bottom: 16px;
    color: var(--text-secondary);
  }

  .status-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 768px) {
    p {
      font-size: 0.9rem;
    }
  }
`;
