import styled from "styled-components";
import { Card } from "../components/ui";

export const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Title = styled.h1`
  margin: 0;
  color: var(--text-primary);
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const StatCard = styled(Card)<{ $color?: string }>`
  text-align: center;
  padding: 20px;
  border-left: 4px solid ${(props) => props.$color || "var(--primary)"};
`;

export const StatValue = styled.div<{ $color?: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.$color || "var(--primary)"};
`;

export const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  overflow-x: auto;
`;

export const Tab = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "var(--primary)" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--text-secondary)")};
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--primary)" : "var(--background)"};
  }
`;

export const NotificacaoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NotificacaoCard = styled(Card)<{ $lida: boolean; $vencida: boolean }>`
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid
    ${(props) => {
      if (props.$vencida) return "var(--error)";
      if (!props.$lida) return "var(--primary)";
      return "var(--border)";
    }};
  background: ${(props) =>
    props.$lida ? "white" : "rgba(255, 107, 53, 0.03)"};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const NotificacaoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const NotificacaoInfo = styled.div`
  flex: 1;
`;

export const NotificacaoCliente = styled.h3`
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 1rem;
`;

export const NotificacaoOrcamento = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

export const NotificacaoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const NotificacaoData = styled.span<{ $vencida?: boolean }>`
  font-size: 0.85rem;
  color: ${(props) =>
    props.$vencida ? "var(--error)" : "var(--text-secondary)"};
  font-weight: ${(props) => (props.$vencida ? "600" : "400")};
  background: ${(props) =>
    props.$vencida ? "rgba(239, 68, 68, 0.1)" : "transparent"};
  padding: ${(props) => (props.$vencida ? "4px 8px" : "0")};
  border-radius: 4px;
`;

export const NotificacaoDescricao = styled.p`
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

export const NotificacaoFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

export const PalavraChaveTag = styled.span`
  display: inline-block;
  background: var(--primary);
  color: white;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 4px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const SmallButton = styled.button<{
  $variant?: "primary" | "danger" | "ghost";
}>`
  background: ${(props) => {
    if (props.$variant === "danger") return "var(--error)";
    if (props.$variant === "primary") return "var(--primary)";
    return "transparent";
  }};
  color: ${(props) => {
    if (props.$variant === "ghost") return "var(--text-secondary)";
    return "white";
  }};
  border: ${(props) =>
    props.$variant === "ghost" ? "1px solid var(--border)" : "none"};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    ${(props) => props.$variant === "ghost" && "background: var(--background);"}
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: var(--text-light);
`;

export const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

export const LoadMoreButton = styled.button`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-dark);
  }

  &:disabled {
    background: var(--border);
    cursor: not-allowed;
  }
`;

export const LoadingMore = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
`;
