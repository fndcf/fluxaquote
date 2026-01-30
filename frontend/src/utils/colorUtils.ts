/**
 * Utilitários para manipulação de cores do tema.
 * Usado pelo LayoutTab, AdminLayout e OrcamentoPDF.
 */

import { CSSProperties } from "react";

export const DEFAULT_COLORS = {
  primary: "#059669",
  secondary: "#0F172A",
};

/** Valida se a string é um hex válido no formato #RRGGBB */
export function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/** Converte hex para RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(
    hex,
  );
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/** Converte RGB para hex */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

/** Escurece uma cor hex pelo percentual dado (0-100) */
export function darkenColor(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex;
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - amount / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/** Clareia uma cor hex pelo percentual dado (0-100) */
export function lightenColor(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex;
  const { r, g, b } = hexToRgb(hex);
  const factor = amount / 100;
  return rgbToHex(
    r + (255 - r) * factor,
    g + (255 - g) * factor,
    b + (255 - b) * factor,
  );
}

/**
 * Gera CSS variables para override no container do AdminLayout.
 * Retorna null se nenhuma cor customizada estiver definida.
 */
export function buildColorVariables(
  corPrimaria?: string,
  corSecundaria?: string,
): CSSProperties | null {
  if (!corPrimaria && !corSecundaria) return null;

  const vars: Record<string, string> = {};

  if (corPrimaria && isValidHex(corPrimaria)) {
    vars["--primary"] = corPrimaria;
    vars["--primary-dark"] = darkenColor(corPrimaria, 15);
    vars["--primary-light"] = lightenColor(corPrimaria, 20);
  }

  if (corSecundaria && isValidHex(corSecundaria)) {
    vars["--secondary"] = corSecundaria;
    vars["--secondary-light"] = lightenColor(corSecundaria, 10);
  }

  if (Object.keys(vars).length === 0) return null;

  return vars as CSSProperties;
}

export interface PdfColors {
  primary: string;
  primaryLight: string;
  dark: string;
  gray: string;
  lightGray: string;
  border: string;
}

/**
 * Retorna cores para uso no PDF baseado nas configurações do tenant.
 * Se não houver cores customizadas, retorna os defaults do PDF.
 */
export function getPdfColors(configuracoes?: {
  corPrimaria?: string;
  corSecundaria?: string;
}): PdfColors {
  const primary =
    configuracoes?.corPrimaria && isValidHex(configuracoes.corPrimaria)
      ? configuracoes.corPrimaria
      : "#CC0000";

  return {
    primary,
    primaryLight: lightenColor(primary, 85),
    dark: "#1a1a1a",
    gray: "#666666",
    lightGray: "#f8f8f8",
    border: "#e0e0e0",
  };
}
