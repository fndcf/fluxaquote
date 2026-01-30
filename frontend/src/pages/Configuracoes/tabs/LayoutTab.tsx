import { useState, useEffect } from "react";
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from "../../../hooks/useConfiguracoesGerais";
import { Button, Input } from "../../../components/ui";
import { logger } from "../../../utils/logger";
import { DEFAULT_COLORS, isValidHex } from "../../../utils/colorUtils";
import {
  Section,
  FormGroup,
  FormRow,
  Label,
  HelpText,
  Message,
} from "../styles";

const PALETTES = [
  { name: "FluxaQuote Padrão", primary: "#059669", secondary: "#0F172A" },
  { name: "Azul Corporativo", primary: "#2563EB", secondary: "#1E293B" },
  { name: "Verde Natureza", primary: "#16A34A", secondary: "#1A2E1A" },
  { name: "Roxo Elegante", primary: "#7C3AED", secondary: "#1E1B2E" },
  { name: "Vermelho Clássico", primary: "#DC2626", secondary: "#1A1A2E" },
  { name: "Cinza Moderno", primary: "#475569", secondary: "#0F172A" },
  { name: "Dourado Premium", primary: "#D97706", secondary: "#1C1917" },
  { name: "Azul Petróleo", primary: "#0891B2", secondary: "#164E63" },
  { name: "Rosa Vibrante", primary: "#DB2777", secondary: "#1A1A2E" },
  { name: "Laranja Vibrante", primary: "#FF6B35", secondary: "#1A1A2E" },
  { name: "Índigo Profundo", primary: "#4F46E5", secondary: "#1E1B4B" },
  { name: "Terracota", primary: "#C2410C", secondary: "#292524" },
];

export function LayoutTab() {
  const { data: configuracoesGerais } = useConfiguracoesGerais();
  const atualizarConfiguracoes = useAtualizarConfiguracoesGerais();

  const [corPrimaria, setCorPrimaria] = useState(DEFAULT_COLORS.primary);
  const [corSecundaria, setCorSecundaria] = useState(DEFAULT_COLORS.secondary);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (configuracoesGerais) {
      setCorPrimaria(configuracoesGerais.corPrimaria || DEFAULT_COLORS.primary);
      setCorSecundaria(
        configuracoesGerais.corSecundaria || DEFAULT_COLORS.secondary,
      );
      setDirty(false);
    }
  }, [configuracoesGerais]);

  const handleCorPrimariaChange = (value: string) => {
    setCorPrimaria(value.toUpperCase());
    setDirty(true);
  };

  const handleCorSecundariaChange = (value: string) => {
    setCorSecundaria(value.toUpperCase());
    setDirty(true);
  };

  const handlePaletteSelect = (palette: (typeof PALETTES)[0]) => {
    setCorPrimaria(palette.primary);
    setCorSecundaria(palette.secondary);
    setDirty(true);
  };

  const handleRestaurarPadrao = () => {
    setCorPrimaria(DEFAULT_COLORS.primary);
    setCorSecundaria(DEFAULT_COLORS.secondary);
    setDirty(true);
  };

  const handleCancelar = () => {
    if (configuracoesGerais) {
      setCorPrimaria(configuracoesGerais.corPrimaria || DEFAULT_COLORS.primary);
      setCorSecundaria(
        configuracoesGerais.corSecundaria || DEFAULT_COLORS.secondary,
      );
      setDirty(false);
    }
  };

  const handleSalvar = async () => {
    if (!isValidHex(corPrimaria)) {
      setMessage({
        type: "error",
        text: "Cor primária inválida. Use formato #RRGGBB.",
      });
      return;
    }
    if (!isValidHex(corSecundaria)) {
      setMessage({
        type: "error",
        text: "Cor secundária inválida. Use formato #RRGGBB.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      await atualizarConfiguracoes.mutateAsync({ corPrimaria, corSecundaria });
      setDirty(false);
      setMessage({ type: "success", text: "Cores salvas com sucesso!" });
    } catch (error) {
      logger.error("Erro ao salvar cores", { error });
      setMessage({
        type: "error",
        text: "Erro ao salvar configurações de cores",
      });
    } finally {
      setSaving(false);
    }
  };

  const isPaletteSelected = (palette: (typeof PALETTES)[0]) =>
    corPrimaria === palette.primary && corSecundaria === palette.secondary;

  const validPrimary = isValidHex(corPrimaria)
    ? corPrimaria
    : DEFAULT_COLORS.primary;
  const validSecondary = isValidHex(corSecundaria)
    ? corSecundaria
    : DEFAULT_COLORS.secondary;

  return (
    <Section>
      <div style={{ marginBottom: 16 }}>
        <h2>Cores do Sistema</h2>
        <p className="description">
          Personalize as cores primária e secundária do sistema. A cor primária
          é usada em botões, links e destaques. A cor secundária é usada no
          cabeçalho e backgrounds escuros. Estas cores também serão aplicadas
          nos PDFs gerados.
        </p>
      </div>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <FormRow style={{ marginBottom: 24 }}>
        <FormGroup>
          <Label>Cor Primária</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: validPrimary,
                border: "2px solid var(--border)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <input
                type="color"
                value={validPrimary}
                onChange={(e) => handleCorPrimariaChange(e.target.value)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </div>
            <Input
              value={corPrimaria}
              onChange={(e) => handleCorPrimariaChange(e.target.value)}
              placeholder="#059669"
              style={{ maxWidth: 140, fontFamily: "monospace" }}
            />
          </div>
          <HelpText>
            Usada em botões, links, abas ativas e destaques do PDF
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Cor Secundária</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: validSecondary,
                border: "2px solid var(--border)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <input
                type="color"
                value={validSecondary}
                onChange={(e) => handleCorSecundariaChange(e.target.value)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </div>
            <Input
              value={corSecundaria}
              onChange={(e) => handleCorSecundariaChange(e.target.value)}
              placeholder="#0F172A"
              style={{ maxWidth: 140, fontFamily: "monospace" }}
            />
          </div>
          <HelpText>
            Usada no cabeçalho do sistema e backgrounds escuros
          </HelpText>
        </FormGroup>
      </FormRow>

      <div style={{ marginBottom: 24 }}>
        <Label>Paletas Predefinidas</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          {PALETTES.map((palette) => (
            <div
              key={palette.name}
              onClick={() => handlePaletteSelect(palette)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                border: `2px solid ${isPaletteSelected(palette) ? palette.primary : "var(--border)"}`,
                cursor: "pointer",
                background: "var(--background)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: palette.primary,
                  }}
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: palette.secondary,
                  }}
                />
              </div>
              <span
                style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}
              >
                {palette.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Label>Pré-visualização</Label>
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
            marginTop: 8,
          }}
        >
          <div
            style={{
              backgroundColor: validSecondary,
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: validPrimary,
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              Sua Empresa
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  backgroundColor: validPrimary,
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                }}
              >
                Painel
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                }}
              >
                Orçamentos
              </span>
            </div>
          </div>
          <div style={{ padding: 20, background: "#F5F5F5" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                style={{
                  backgroundColor: validPrimary,
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontWeight: 500,
                  cursor: "default",
                }}
              >
                Botão Exemplo
              </button>
              <span style={{ color: validPrimary, fontWeight: 500 }}>
                Link de exemplo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Button onClick={handleSalvar} disabled={!dirty || saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          $variant="secondary"
          onClick={handleRestaurarPadrao}
          disabled={saving}
        >
          Restaurar Padrão
        </Button>
        {dirty && (
          <Button $variant="ghost" onClick={handleCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </Section>
  );
}
