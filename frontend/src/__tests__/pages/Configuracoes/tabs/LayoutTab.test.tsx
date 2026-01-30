import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { LayoutTab } from "../../../../pages/Configuracoes/tabs/LayoutTab";
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from "../../../../hooks/useConfiguracoesGerais";

vi.mock("../../../../hooks/useConfiguracoesGerais", () => ({
  useConfiguracoesGerais: vi.fn(),
  useAtualizarConfiguracoesGerais: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockMutateAsync = vi.fn();

describe("LayoutTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: {
        nomeEmpresa: "Teste",
        corPrimaria: "#059669",
        corSecundaria: "#0F172A",
        diasValidadeOrcamento: 30,
      },
      isLoading: false,
    } as any);

    vi.mocked(useAtualizarConfiguracoesGerais).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    } as any);
  });

  describe("Renderização básica", () => {
    it("deve renderizar título e descrição", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(screen.getByText("Cores do Sistema")).toBeInTheDocument();
      expect(
        screen.getByText(/Personalize as cores primária e secundária/),
      ).toBeInTheDocument();
    });

    it("deve renderizar campos de cor primária e secundária", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(screen.getByText("Cor Primária")).toBeInTheDocument();
      expect(screen.getByText("Cor Secundária")).toBeInTheDocument();
    });

    it("deve renderizar paletas predefinidas", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(screen.getByText("Paletas Predefinidas")).toBeInTheDocument();
      expect(screen.getByText("FluxaQuote Padrão")).toBeInTheDocument();
      expect(screen.getByText("Azul Corporativo")).toBeInTheDocument();
      expect(screen.getByText("Verde Natureza")).toBeInTheDocument();
    });

    it("deve renderizar pré-visualização", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(screen.getByText("Pré-visualização")).toBeInTheDocument();
      expect(screen.getByText("Sua Empresa")).toBeInTheDocument();
      expect(screen.getByText("Botão Exemplo")).toBeInTheDocument();
    });

    it("deve mostrar botão Salvar desabilitado inicialmente", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      expect(salvarButton).toBeDisabled();
    });

    it("deve mostrar botão Restaurar Padrão", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(
        screen.getByRole("button", { name: "Restaurar Padrão" }),
      ).toBeInTheDocument();
    });
  });

  describe("Interações com cores", () => {
    it("deve habilitar botão Salvar ao alterar cor", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      const inputs = screen.getAllByDisplayValue("#059669");
      fireEvent.change(inputs[0], { target: { value: "#2563EB" } });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      expect(salvarButton).not.toBeDisabled();
    });

    it("deve selecionar paleta ao clicar", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText("Azul Corporativo"));

      expect(
        screen.getAllByDisplayValue("#2563EB").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("deve mostrar botão Cancelar quando dirty", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      const inputs = screen.getAllByDisplayValue("#059669");
      fireEvent.change(inputs[0], { target: { value: "#000000" } });

      expect(
        screen.getByRole("button", { name: "Cancelar" }),
      ).toBeInTheDocument();
    });

    it("deve restaurar padrão ao clicar Restaurar Padrão", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      // Alterar cores
      fireEvent.click(screen.getByText("Azul Corporativo"));

      // Restaurar padrão
      fireEvent.click(screen.getByRole("button", { name: "Restaurar Padrão" }));

      expect(
        screen.getAllByDisplayValue("#059669").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("deve cancelar alterações e restaurar valores do servidor", () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      // Alterar
      fireEvent.click(screen.getByText("Azul Corporativo"));

      // Cancelar
      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(
        screen.getAllByDisplayValue("#059669").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Salvar", () => {
    it("deve salvar com sucesso", async () => {
      mockMutateAsync.mockResolvedValue({});

      render(<LayoutTab />, { wrapper: createWrapper() });

      const inputs = screen.getAllByDisplayValue("#059669");
      fireEvent.change(inputs[0], { target: { value: "#2563EB" } });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            corPrimaria: "#2563EB",
          }),
        );
        expect(
          screen.getByText("Cores salvas com sucesso!"),
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar erro ao falhar salvar", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Erro de rede"));

      render(<LayoutTab />, { wrapper: createWrapper() });

      const inputs = screen.getAllByDisplayValue("#059669");
      fireEvent.change(inputs[0], { target: { value: "#2563EB" } });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(
          screen.getByText("Erro ao salvar configurações de cores"),
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para cor primária inválida", async () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText("#059669");
      fireEvent.change(input, { target: { value: "invalid" } });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(
          screen.getByText("Cor primária inválida. Use formato #RRGGBB."),
        ).toBeInTheDocument();
      });
    });

    it("deve mostrar erro para cor secundária inválida", async () => {
      render(<LayoutTab />, { wrapper: createWrapper() });

      // Change secondary color to invalid (target text input, not color picker)
      const secInput = screen.getByPlaceholderText("#0F172A");
      fireEvent.change(secInput, { target: { value: "invalid" } });

      const salvarButton = screen.getByRole("button", {
        name: "Salvar Alterações",
      });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(
          screen.getByText("Cor secundária inválida. Use formato #RRGGBB."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Valores default", () => {
    it("deve usar cores padrão quando dados não existem", () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(
        screen.getAllByDisplayValue("#059669").length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByDisplayValue("#0F172A").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("deve preencher com cores do servidor quando disponíveis", () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          corPrimaria: "#2563EB",
          corSecundaria: "#1E293B",
        },
        isLoading: false,
      } as any);

      render(<LayoutTab />, { wrapper: createWrapper() });

      expect(
        screen.getAllByDisplayValue("#2563EB").length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByDisplayValue("#1E293B").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
