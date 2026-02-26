// FILE: src/components/UpsertModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Card, StageKey, ColumnKey } from "../types";
import { X } from "lucide-react";
import { DEFAULT_COLUMN_OPTIONS } from "./DEFAULT_COLUMN_OPTIONS";

/**
 * Ajuste os defaults abaixo caso seus nomes/keys de coluna/etapa sejam diferentes.
 * Se o seu app tiver um schema central, você pode passar via props (stageOptions/columnOptions).
 */
const DEFAULT_STAGE_OPTIONS: { value: StageKey; label: string }[] = [
  // Se você tiver mais etapas, adicione aqui (ex.: { value: "DESIGN" as any, label: "Design" })
  { value: "PROD" as StageKey, label: "Produção" },
];

type Props = {
  initial?: Card;
  onSave: (card: Card) => void | Promise<void>;
  onClose: () => void;

  /** Tags já existentes em outros cards (para auto-complete) */
  existingTags?: string[];

  /** Opcional: sobrescreva as opções de etapa/coluna se tiver um schema central */
  stageOptions?: { value: StageKey; label: string }[];
  columnOptions?: { value: ColumnKey; label: string }[];
};

export function UpsertModal({
  initial,
  onSave,
  onClose,
  existingTags = [],
  stageOptions = DEFAULT_STAGE_OPTIONS,
  columnOptions = DEFAULT_COLUMN_OPTIONS,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = () => new Date().toISOString();

  const [form, setForm] = useState<Card>(() =>
    initial ?? {
      id: crypto.randomUUID(),
      numero: "",
      descricao: "",
      emissao: today,
      entrega: today,
      qtd: 0,
      qtdConcluida: 0,
      apontamentos: [],
      prioridade: "Média",
      tipo: "CASUAL",
      updatedAt: new Date().toISOString(),
      stage: (stageOptions[0]?.value ?? ("PROD" as any)) as StageKey,
      column: (columnOptions[0]?.value ?? ("PCP" as any)) as ColumnKey,
      compact: false,
      order: Date.now(),
      tags: [],
    }
  );

  useEffect(() => {
    if (!initial) return;
    setForm((prev) => ({
      ...prev,
      ...initial,
      emissao: initial.emissao || today,
      entrega: initial.entrega || today,
      tags: Array.isArray(initial.tags) ? initial.tags : [],
      tipo: (initial as any).tipo || "CASUAL",
      qtdConcluida: Number((initial as any).qtdConcluida || 0),
      apontamentos: Array.isArray((initial as any).apontamentos) ? (initial as any).apontamentos : [],
    }));
  }, [initial]);

  // ====== APONTAMENTO INCREMENTAL (OPÇÃO B) ======
  const [deltaConcluido, setDeltaConcluido] = useState<number>(0);

  function handleRegistrarApontamento() {
    const inc = Number(deltaConcluido || 0);
    if (!inc || inc <= 0) return;
    const total = Number(form.qtd || 0);
    const atual = Number((form as any).qtdConcluida || 0);
    const novo = atual + inc;
    if (novo > total) {
      alert(`Apontamento excede o total do pedido. Total: ${total}, Concluído atual: ${atual}.`);
      return;
    }

    const item = {
      id: crypto.randomUUID(),
      at: nowIso(),
      qtd: inc,
    };
    setForm((f: any) => ({
      ...f,
      qtdConcluida: novo,
      apontamentos: [item, ...(Array.isArray(f.apontamentos) ? f.apontamentos : [])],
    }));
    setDeltaConcluido(0);
  }

  function handleDesfazerUltimoApontamento() {
    const list = Array.isArray((form as any).apontamentos)
      ? (form as any).apontamentos
      : [];
    if (!list.length) return;

    const last = list[0];
    const qtdLast = Number(last?.qtd || 0);
    if (!qtdLast || qtdLast <= 0) return;

    const ok = window.confirm(
      `Deseja desfazer o último apontamento (+${qtdLast} peças)?`
    );
    if (!ok) return;

    setForm((f: any) => {
      const aponts = Array.isArray(f.apontamentos) ? f.apontamentos : [];
      if (!aponts.length) return f;
      const first = aponts[0];
      const firstQtd = Number(first?.qtd || 0);
      const atual = Number(f.qtdConcluida || 0);
      const novo = Math.max(0, atual - Math.max(0, firstQtd));
      return {
        ...f,
        qtdConcluida: novo,
        apontamentos: aponts.slice(1),
      };
    });
  }

  // ====== TAGS ======
  const [tagInput, setTagInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const norm = (s: string) =>
    s.trim().replace(/[;,\s]+$/g, "").replace(/\s+/g, " ").trim();

  const hasTag = (t: string) =>
    (form.tags ?? []).some((x) => x.toLowerCase() === t.toLowerCase());

  function addTag(raw: string) {
    const t = norm(raw);
    if (!t) return;
    if (hasTag(t)) {
      setTagInput("");
      return;
    }
    setForm((f) => ({ ...f, tags: [...(f.tags ?? []), t] }));
    setTagInput("");
  }
  function removeTag(t: string) {
    setForm((f) => ({ ...f, tags: (f.tags ?? []).filter((x) => x !== t) }));
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ";" || e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (
      e.key === "Backspace" &&
      !tagInput &&
      (form.tags?.length ?? 0) > 0
    ) {
      removeTag(form.tags![form.tags!.length - 1]);
    }
  }

  const suggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return [];
    const used = new Set((form.tags ?? []).map((t) => t.toLowerCase()));
    return existingTags
      .filter(
        (t) => !used.has(t.toLowerCase()) && t.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [tagInput, existingTags, form.tags]);

  async function handleSave() {
    const cleanedTags = (form.tags ?? []).map(norm).filter(Boolean);
    await onSave({
      ...form,
      tags: cleanedTags,
      qtd: Number(form.qtd || 0),
      qtdConcluida: Math.max(0, Math.min(Number((form as any).qtdConcluida || 0), Number(form.qtd || 0))),
      apontamentos: Array.isArray((form as any).apontamentos) ? (form as any).apontamentos : [],
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      {/*
        IMPORTANTE (UX): o modal precisa caber em telas menores e manter o rodapé (Salvar/Cancelar)
        sempre acessível. Por isso:
        - limitamos a altura máxima pelo viewport
        - usamos layout em coluna (flex-col)
        - colocamos rolagem apenas no corpo (overflow-y-auto)
      */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold">Pedido</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto min-h-0">
          {/* Número / Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Número</span>
              <input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="w-full border rounded px-3 py-2"
                autoFocus
              />
            </label>

            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Quantidade</span>
              <input
                type="number"
                value={form.qtd}
                onChange={(e) =>
                  setForm({ ...form, qtd: Number(e.target.value || 0) })
                }
                className="w-full border rounded px-3 py-2"
              />
            </label>
          </div>

          {/* APONTAMENTO INCREMENTAL (OPÇÃO B) + HISTÓRICO */}
          {initial ? (
            <div className="border rounded-xl p-3 bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="text-sm flex-1">
                  <span className="block text-slate-600 mb-1">Apontar concluído (incremento)</span>
                  <input
                    type="number"
                    value={deltaConcluido}
                    onChange={(e) => setDeltaConcluido(Number(e.target.value || 0))}
                    className="w-full border rounded px-3 py-2"
                    min={0}
                  />
                  <div className="mt-1 text-[11px] text-slate-500">
                    Total: <b>{form.qtd}</b> · Concluído: <b>{Math.min(Number((form as any).qtdConcluida || 0), form.qtd)}</b>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={handleRegistrarApontamento}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  title="Registra o incremento e salva no histórico do card"
                >
                  Registrar
                </button>
              </div>

              {/* Histórico */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-700 font-semibold">Histórico de apontamentos</div>
                  <button
                    type="button"
                    onClick={handleDesfazerUltimoApontamento}
                    disabled={!Array.isArray((form as any).apontamentos) || (form as any).apontamentos.length === 0}
                    className="text-xs px-2 py-1 rounded border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove o último apontamento do histórico e ajusta a quantidade concluída"
                  >
                    Desfazer último
                  </button>
                </div>
                {Array.isArray((form as any).apontamentos) && (form as any).apontamentos.length > 0 ? (
                  <div className="max-h-40 overflow-auto rounded border bg-white">
                    {(form as any).apontamentos.map((a: any) => (
                      <div key={a.id} className="px-3 py-2 text-sm border-b last:border-b-0 flex items-center justify-between">
                        <span className="text-slate-700">
                          +{a.qtd} peças
                        </span>
                        <span className="text-slate-500 text-[12px]">
                          {new Date(a.at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">Nenhum apontamento registrado ainda.</div>
                )}
              </div>
            </div>
          ) : null}

          {/* Descrição */}
          <label className="text-sm block">
            <span className="block text-slate-600 mb-1">Descrição</span>
            <textarea
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
              className="w-full border rounded px-3 py-2 min-h-[84px]"
            />
          </label>

          {/* Emissão / Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Emissão</span>
              <input
                type="date"
                value={form.emissao}
                onChange={(e) =>
                  setForm({ ...form, emissao: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Entrega</span>
              <input
                type="date"
                value={form.entrega}
                onChange={(e) =>
                  setForm({ ...form, entrega: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </label>
          </div>

          {/* Prioridade + (Etapa?) + Coluna — o “ao lado da prioridade” */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Prioridade</span>
              <select
                value={form.prioridade}
                onChange={(e) =>
                  setForm({ ...form, prioridade: e.target.value as any })
                }
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Tipo do pedido</span>
              <select
                value={(form as any).tipo || "CASUAL"}
                onChange={(e) =>
                  setForm({ ...(form as any), tipo: e.target.value as any })
                }
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="CASUAL">CASUAL</option>
                <option value="ESCOLAR">ESCOLAR</option>
                <option value="PRONTA_ENTREGA">PRONTA ENTREGA</option>
                <option value="ATENDIMENTO">ATENDIMENTO</option>
                <option value="ESPORTIVO">ESPORTIVO</option>
              </select>
            </label>

            {/* Mostre a Etapa se você usa mais de uma; senão pode ocultar com hidden */}
            <label className={`text-sm ${stageOptions.length <= 1 ? "hidden sm:block sm:invisible" : ""}`}>
              <span className="block text-slate-600 mb-1">Etapa</span>
              <select
                value={form.stage as StageKey}
                onChange={(e) =>
                  setForm({ ...form, stage: e.target.value as StageKey })
                }
                className="w-full border rounded px-3 py-2 bg-white"
              >
                {stageOptions.map((o) => (
                  <option key={o.value as string} value={o.value as string}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Coluna</span>
              <select
                value={form.column as ColumnKey}
                onChange={(e) =>
                  setForm({ ...form, column: e.target.value as ColumnKey })
                }
                className="w-full border rounded px-3 py-2 bg-white"
              >
                {columnOptions.map((o) => (
                  <option key={o.value as string} value={o.value as string}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* TAGS */}
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 mb-1">Tags</span>
              <span className="text-[11px] text-slate-400">
                Confirme com “;” ou Enter
              </span>
            </div>

            {form.tags && form.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {(form.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border bg-slate-50"
                  >
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="ml-1 -mr-1 px-1 hover:bg-slate-100 rounded"
                      title="Remover"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                ref={inputRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="Digite e pressione ; para adicionar"
                className="w-full border rounded px-3 py-2"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-sm max-h-48 overflow-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addTag(s);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border bg-white hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpsertModal;
