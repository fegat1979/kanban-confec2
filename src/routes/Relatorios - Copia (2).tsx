// src/routes/Relatorios.tsx - VERSÃO COMPACTA PARA PDF
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, AlertTriangle, Printer } from "lucide-react";
import type { Card } from "../types";

type RelatoriosProps = {
  cards: Card[];
};

export function Relatorios({ cards }: RelatoriosProps) {
  const navigate = useNavigate();

  const resumo = useMemo(() => {
    const hoje = new Date();
    const atrasados = cards.filter(c => 
      c.entrega && new Date(c.entrega) < hoje && c.column !== "CONCLUIDO"
    );

    return {
      totalPedidos: cards.length,
      totalPecas: cards.reduce((sum, c) => sum + (c.qtd || 0), 0),
      emProducao: cards.filter(c => c.stage === "PROD").length,
      atrasados: atrasados.length,
    };
  }, [cards]);

  const atrasos = useMemo(() => {
    return cards
      .filter(c => c.entrega && new Date(c.entrega) < new Date() && c.column !== "CONCLUIDO")
      .map(card => {
        const diasAtraso = Math.ceil((new Date().getTime() - new Date(card.entrega!).getTime()) / (1000 * 3600 * 24));
        return { ...card, diasAtraso };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);
  }, [cards]);

  const exportarPDF = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={20} /> Voltar ao Kanban
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">📊 Relatórios</h1>
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium"
          >
            <Printer size={20} /> Exportar PDF
          </button>
        </div>

        {/* Resumo Geral */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-2xl font-semibold">Resumo Geral - Hoje</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-xs text-slate-600">Total de Pedidos</p>
              <p className="text-4xl font-bold text-slate-800">{resumo.totalPedidos}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-xs text-slate-600">Total de Peças</p>
              <p className="text-4xl font-bold text-slate-800">{resumo.totalPecas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl text-center">
              <p className="text-xs text-emerald-700">Em Produção</p>
              <p className="text-4xl font-bold text-emerald-700">{resumo.emProducao}</p>
            </div>
            <div className="bg-red-50 p-5 rounded-xl text-center">
              <p className="text-xs text-red-700">Atrasados</p>
              <p className="text-4xl font-bold text-red-700">{resumo.atrasados}</p>
            </div>
          </div>
        </div>

        {/* Pedidos em Atraso */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-2xl font-semibold">Pedidos em Atraso</h2>
          </div>

          {atrasos.length === 0 ? (
            <p className="text-center py-12 text-slate-500">Nenhum pedido atrasado no momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-50 border-b">
                    <th className="text-left p-3">Pedido</th>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-left p-3">Etapa Atual</th>
                    <th className="text-center p-3">Qtd Peças</th>
                    <th className="text-center p-3">Dias em Atraso</th>
                    <th className="text-center p-3">Data Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {atrasos.map((pedido) => (
                    <tr key={pedido.id} className="border-b hover:bg-red-50/30">
                      <td className="p-3 font-medium">{pedido.numero}</td>
                      <td className="p-3 text-slate-700">{pedido.descricao}</td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          {pedido.column}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium">{pedido.qtd}</td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-bold">+{pedido.diasAtraso}</span>
                      </td>
                      <td className="p-3 text-center text-red-600 font-medium">{pedido.entrega}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ESTILO OTIMIZADO PARA PDF */}
      <style>
        {`
          @media print {
            @page { margin: 12mm 10mm; }
            body { margin: 0; padding: 0; font-size: 10pt; }
            button { display: none !important; }
            .shadow { box-shadow: none !important; }
            h1 { font-size: 18pt; margin-bottom: 8mm; }
            h2 { font-size: 14pt; margin-bottom: 6mm; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 4px; font-size: 9.5pt; border-bottom: 1px solid #ccc; }
            th { background-color: #fee2e2 !important; font-weight: 600; }
            tr { page-break-inside: avoid; }
          }
        `}
      </style>
    </div>
  );
}