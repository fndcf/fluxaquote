import { describe, it, expect } from "vitest";
import {
  isValidHex,
  darkenColor,
  lightenColor,
  buildColorVariables,
  getPdfColors,
  DEFAULT_COLORS,
} from "../../utils/colorUtils";

describe("colorUtils", () => {
  describe("DEFAULT_COLORS", () => {
    it("deve ter cores padrão definidas", () => {
      expect(DEFAULT_COLORS.primary).toBe("#059669");
      expect(DEFAULT_COLORS.secondary).toBe("#0F172A");
    });
  });

  describe("isValidHex", () => {
    it("deve aceitar hex válido com 6 dígitos", () => {
      expect(isValidHex("#059669")).toBe(true);
      expect(isValidHex("#000000")).toBe(true);
      expect(isValidHex("#FFFFFF")).toBe(true);
      expect(isValidHex("#0F172A")).toBe(true);
    });

    it("deve aceitar hex minúsculo", () => {
      expect(isValidHex("#ff6b35")).toBe(true);
      expect(isValidHex("#abcdef")).toBe(true);
    });

    it("deve aceitar hex misto", () => {
      expect(isValidHex("#Ff6B35")).toBe(true);
    });

    it("deve rejeitar hex sem #", () => {
      expect(isValidHex("FF6B35")).toBe(false);
    });

    it("deve rejeitar hex com 3 dígitos", () => {
      expect(isValidHex("#FFF")).toBe(false);
    });

    it("deve rejeitar hex com 8 dígitos (alpha)", () => {
      expect(isValidHex("#FF6B35FF")).toBe(false);
    });

    it("deve rejeitar strings vazias", () => {
      expect(isValidHex("")).toBe(false);
    });

    it("deve rejeitar caracteres inválidos", () => {
      expect(isValidHex("#GGGGGG")).toBe(false);
      expect(isValidHex("#ZZZZZZ")).toBe(false);
    });
  });

  describe("darkenColor", () => {
    it("deve escurecer uma cor", () => {
      const result = darkenColor("#FFFFFF", 50);
      // 255 * 0.5 = 127.5 → round(127.5) = 128 → #808080
      // Actually: 255 * (1 - 50/100) = 255 * 0.5 = 127.5 → 128 → hex 80
      expect(result).toBe("#808080");
    });

    it("deve retornar preto com 100% escurecimento", () => {
      const result = darkenColor("#FFFFFF", 100);
      expect(result).toBe("#000000");
    });

    it("deve manter a cor com 0% escurecimento", () => {
      const result = darkenColor("#059669", 0);
      expect(result).toBe("#059669");
    });

    it("deve retornar a cor inalterada se hex inválido", () => {
      expect(darkenColor("invalid", 50)).toBe("invalid");
    });
  });

  describe("lightenColor", () => {
    it("deve clarear uma cor", () => {
      const result = lightenColor("#000000", 50);
      // 0 + (255 - 0) * 0.5 = 127.5 → 128 → hex 80
      expect(result).toBe("#808080");
    });

    it("deve retornar branco com 100% clareamento", () => {
      const result = lightenColor("#000000", 100);
      expect(result).toBe("#FFFFFF");
    });

    it("deve manter a cor com 0% clareamento", () => {
      const result = lightenColor("#059669", 0);
      expect(result).toBe("#059669");
    });

    it("deve retornar a cor inalterada se hex inválido", () => {
      expect(lightenColor("invalid", 50)).toBe("invalid");
    });
  });

  describe("buildColorVariables", () => {
    it("deve retornar null se nenhuma cor fornecida", () => {
      expect(buildColorVariables()).toBeNull();
      expect(buildColorVariables(undefined, undefined)).toBeNull();
    });

    it("deve retornar null se cores são strings vazias", () => {
      expect(buildColorVariables("", "")).toBeNull();
    });

    it("deve gerar variáveis apenas para cor primária", () => {
      const result = buildColorVariables("#059669", undefined) as Record<string, string> | null;
      expect(result).not.toBeNull();
      expect(result!["--primary"]).toBe("#059669");
      expect(result!["--primary-dark"]).toBeDefined();
      expect(result!["--primary-light"]).toBeDefined();
      expect(result!["--secondary"]).toBeUndefined();
    });

    it("deve gerar variáveis apenas para cor secundária", () => {
      const result = buildColorVariables(undefined, "#0F172A") as Record<string, string> | null;
      expect(result).not.toBeNull();
      expect(result!["--secondary"]).toBe("#0F172A");
      expect(result!["--secondary-light"]).toBeDefined();
      expect(result!["--primary"]).toBeUndefined();
    });

    it("deve gerar variáveis para ambas as cores", () => {
      const result = buildColorVariables("#059669", "#0F172A") as Record<string, string> | null;
      expect(result).not.toBeNull();
      expect(result!["--primary"]).toBe("#059669");
      expect(result!["--secondary"]).toBe("#0F172A");
    });

    it("deve retornar null se cores são inválidas", () => {
      expect(buildColorVariables("invalid", "also-invalid")).toBeNull();
    });

    it("deve ignorar cor primária inválida mas usar secundária válida", () => {
      const result = buildColorVariables("invalid", "#0F172A") as Record<string, string> | null;
      expect(result).not.toBeNull();
      expect(result!["--primary"]).toBeUndefined();
      expect(result!["--secondary"]).toBe("#0F172A");
    });

    it("deve ignorar cor secundária inválida mas usar primária válida", () => {
      const result = buildColorVariables("#059669", "invalid") as Record<string, string> | null;
      expect(result).not.toBeNull();
      expect(result!["--primary"]).toBe("#059669");
      expect(result!["--secondary"]).toBeUndefined();
    });
  });

  describe("getPdfColors", () => {
    it("deve retornar cores padrão quando sem configurações", () => {
      const colors = getPdfColors();
      expect(colors.primary).toBe("#CC0000");
      expect(colors.dark).toBe("#1a1a1a");
      expect(colors.gray).toBe("#666666");
      expect(colors.lightGray).toBe("#f8f8f8");
      expect(colors.border).toBe("#e0e0e0");
    });

    it("deve retornar cores padrão quando configurações vazias", () => {
      const colors = getPdfColors({});
      expect(colors.primary).toBe("#CC0000");
    });

    it("deve usar cor primária das configurações quando válida", () => {
      const colors = getPdfColors({ corPrimaria: "#2563EB" });
      expect(colors.primary).toBe("#2563EB");
    });

    it("deve usar cor padrão quando corPrimaria é inválida", () => {
      const colors = getPdfColors({ corPrimaria: "invalid" });
      expect(colors.primary).toBe("#CC0000");
    });

    it("deve gerar primaryLight baseado na cor primária", () => {
      const colors = getPdfColors({ corPrimaria: "#FF0000" });
      expect(colors.primaryLight).toBeDefined();
      expect(colors.primaryLight).not.toBe("#FF0000");
    });

    it("deve retornar cores fixas para dark, gray, lightGray, border", () => {
      const colors = getPdfColors({ corPrimaria: "#2563EB" });
      expect(colors.dark).toBe("#1a1a1a");
      expect(colors.gray).toBe("#666666");
      expect(colors.lightGray).toBe("#f8f8f8");
      expect(colors.border).toBe("#e0e0e0");
    });
  });
});
