// src/routes/Relatorios.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import type { Card } from "../types";
import { isAfter, parseISO, subDays } from "date-fns";

type RelatoriosProps = {
  cards: Card[];
};

export function Relatorios({ cards }: RelatoriosProps) {
  const navigate = useNavigate();

  // === RELATÓRIO 1: RESUMO GERAL ===
  const resumo = useMemo(() => {
    const hoje = new Date();
    const atrasados = cards.filter(c => 
      c.entrega && isAfter(hoje, parseISO(c.entrega)) && c.column !== "CONCLUIDO"
    );

    return {
      totalPedidos: cards.length,
      totalPecas: cards.reduce((sum, c) => sum + (c.qtd || 0), 0),
      emCalendario: cards.filter(c => c.stage === "CALENDARIO").length,
      emPre: cards.filter(c => c.stage === "PRE").length,
      emProducao: cards.filter(c => c.stage === "PROD").length,
      concluidos: cards.filter(c => c.column === "CONCLUIDO").length,
      atrasados: atrasados.length,
    };
  }, [cards]);

  // === RELATÓRIO 2: LISTA DE ATRASOS ===
  const atrasos = useMemo(() => {
    return cards
      .filter(c => c.entrega && isAfter(new Date(), parseISO(c.entrega)) && c.column !== "CONCLUIDO")
      .sort((a, b) => parseISO(a.entrega!).getTime() - parseISO(b.entrega!).getTime());
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={20} /> Voltar ao Kanban
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">📊 Relatórios</h1>

        {/* RELATÓRIO 1 - RESUMO GERAL */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-blue-600" size={28} />
            <h2 className="text-2xl font-semibold">Resumo Geral - Hoje</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl">
              <p className="text-sm text-slate-600">Total de Pedidos</p>
              <p className="text-4xl font-bold text-slate-800">{resumo.totalPedidos}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <p className="text-sm text-slate-600">Total de Peças</p>
              <p className="text-4xl font-bold text-slate-800">{resumo.totalPecas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-xl">
              <p className="text-sm text-emerald-700">Em Produção</p>
              <p className="text-4xl font-bold text-emerald-700">{resumo.emProducao}</p>
            </div>
            <div className={`p-6 rounded-xl ${resumo.atrasados > 0 ? "bg-red-50" : "bg-slate-50"}`}>
              <p className="text-sm text-red-700">Atrasados</p>
              <p className="text-4xl font-bold text-red-700">{resumo.atrasados}</p>
            </div>
          </div>
        </div>

        {/* RELATÓRIO 2 - LISTA DE ATRASOS */}
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-red-600" size={28} />
            <h2 className="text-2xl font-semibold">Pedidos em Atraso</h2>
          </div>

          {atrasos.length === 0 ? (
            <p className="text-center text-slate-500 py-12">🎉 Nenhum pedido atrasado no momento!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-red-50">
                    <th className="text-left p-4">Pedido</th>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Etapa Atual</th>
                    <th className="text-center p-4">Qtd Peças</th>
                    <th className="text-center p-4">Data Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {atrasos.map((pedido) => (
                    <tr key={pedido.id} className="border-t hover:bg-red-50/50">
                      <td className="p-4 font-medium">{pedido.numero}</td>
                      <td className="p-4 text-slate-700">{pedido.descricao}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          {pedido.column}
                        </span>
                      </td>
                      <td className="p-4 text-center font-medium">{pedido.qtd}</td>
                      <td className="p-4 text-center text-red-600 font-medium">
                        {pedido.entrega}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}