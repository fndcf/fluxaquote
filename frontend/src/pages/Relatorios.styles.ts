import styled from "styled-components";
import { Button } from "../components/ui";

export const Container = styled.div`
  padding: 24px;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    color: var(--text-primary);
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

    h1 {
      font-size: 1.5rem;
    }
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  input {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-primary);
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;

    input {
      flex: 1;
    }
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div<{ $color?: string }>`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .subvalue {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .value {
      font-size: 1.3rem;
    }
  }

  @media (max-width: 600px) {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .label {
      font-size: 0.75rem;
      margin-bottom: 0;
      margin-right: 8px;
    }

    .value {
      font-size: 1rem;
      text-align: right;
    }

    .subvalue {
      font-size: 0.75rem;
    }
  }
`;

export const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  max-width: 100%;
  box-sizing: border-box;

  h3 {
    color: var(--text-primary);
    margin-bottom: 16px;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 16px;

    h3 {
      font-size: 0.95rem;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;

    h3 {
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
  }
`;

export const FullWidthChart = styled(ChartCard)`
  grid-column: 1 / -1;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
`;

export const TableCard = styled(ChartCard)`
  overflow-x: auto;
`;

export const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  td {
    color: var(--text-primary);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--background);
  }

  .rank {
    font-weight: 700;
    color: var(--primary);
    width: 40px;
  }

  .value {
    text-align: right;
    font-weight: 600;
  }

  .count {
    text-align: center;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;

    th,
    td {
      padding: 10px 8px;
    }
  }
`;

export const ExportButton = styled(Button)`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const NoDataMessage = styled.p`
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
`;

export const LucroPositivo = styled.span`
  color: #27ae60;
  font-weight: 600;
`;

export const LucroNegativo = styled.span`
  color: #e74c3c;
  font-weight: 600;
`;

export const MargemBadge = styled.span<{ $positiva: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $positiva }) => ($positiva ? "#e8f5e9" : "#ffebee")};
  color: ${({ $positiva }) => ($positiva ? "#27ae60" : "#e74c3c")};

  @media (max-width: 480px) {
    padding: 2px 6px;
    font-size: 0.7rem;
  }
`;

export const LucroStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const InfoText = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 12px;
  font-style: italic;
`;

export const SectionTitle = styled.h4<{ $marginTop?: boolean }>`
  margin-bottom: 12px;
  margin-top: ${({ $marginTop }) => ($marginTop ? "16px" : "0")};
  color: var(--text-secondary);
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
`;

export const LucroTableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 24px;

  @media (max-width: 768px) {
    margin-top: 16px;
  }
`;

export const LucroTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;

  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td {
    color: var(--text-primary);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--background);
  }

  .rank {
    font-weight: 700;
    color: var(--primary);
    width: 50px;
  }

  .cliente {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value {
    text-align: right;
    font-weight: 500;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    min-width: 600px;

    th,
    td {
      padding: 8px 4px;
      font-size: 0.75rem;
    }

    th {
      font-size: 0.65rem;
    }

    .cliente {
      max-width: 100px;
    }
  }
`;

// Cards para mobile - exibicao em lista
export const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }
`;

export const MobileCard = styled.div`
  background: var(--background);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);

    .numero {
      font-weight: 700;
      color: var(--primary);
      font-size: 0.9rem;
    }

    .cliente {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.85rem;
      flex: 1;
      margin: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .margem {
      flex-shrink: 0;
    }
  }

  .values-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;

    .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .value {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .lucro-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);

    .lucro-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .lucro-value {
      font-size: 1rem;
      font-weight: 600;
    }
  }
`;

export const DesktopTableWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

// Styled components para linhas clicaveis
export const ClickableTableRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover td {
    background: var(--primary-light, rgba(37, 99, 235, 0.1));
  }
`;

export const ClickableMobileCard = styled(MobileCard)`
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Styled components para paginacao
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);

  @media (max-width: 480px) {
    text-align: center;
  }
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: ${(props) => (props.$disabled ? "var(--bg-secondary)" : "var(--bg-primary)")};
  color: ${(props) => (props.$disabled ? "var(--text-disabled)" : "var(--text-primary)")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$disabled ? "var(--bg-secondary)" : "var(--bg-hover)")};
    border-color: var(--primary);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// Styled components para o modal de analise individual
export const ModalContent = styled.div`
  padding: 8px 0;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);

  .orcamento-info {
    .numero {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    .cliente {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }

  .margem-geral {
    text-align: right;

    .label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
`;

export const ModalSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModalSectionTitle = styled.h4`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ModalStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ModalStatCard = styled.div<{ $color?: string }>`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
`;
