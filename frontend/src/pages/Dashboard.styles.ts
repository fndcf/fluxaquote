import styled from "styled-components";
import { OrcamentoStatus } from "../types";

export const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const Title = styled.h1`
  color: var(--text-primary);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

export const StatCard = styled.div<{ $color?: string }>`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .subvalue {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;

    .value {
      font-size: 1.5rem;
    }

    .label {
      font-size: 0.8rem;
    }
  }
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 16px;
  }
`;

export const ChartCard = styled.div`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);

  h3 {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 16px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;

    h3 {
      font-size: 0.95rem;
      margin-bottom: 12px;
    }
  }
`;

export const FullWidthChartCard = styled(ChartCard)`
  grid-column: 1 / -1;
`;

export const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  margin-right: -4px;
`;

export const RecentItem = styled.div<{ $clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--background);
  border-radius: 8px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: all 0.2s;

  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      background: rgba(204, 0, 0, 0.05);
      transform: translateX(4px);
    }
  `}

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .numero {
      font-weight: 600;
      color: var(--primary);
      font-size: 0.9rem;
    }

    .cliente {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
  }

  .valor {
    font-weight: 600;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    padding: 10px;

    .info .numero {
      font-size: 0.85rem;
    }

    .info .cliente {
      font-size: 0.8rem;
    }

    .valor {
      font-size: 0.9rem;
    }
  }
`;

export const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 8px;

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
