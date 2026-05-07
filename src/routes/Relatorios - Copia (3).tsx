// src/routes/Relatorios.tsx - VERSÃO COMPLETA COM TODOS OS FILTROS
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, AlertTriangle, Printer, Search } from "lucide-react";
import type { Card, TipoPedido } from "../types";

type RelatoriosProps = {
  cards: Card[];
};

export function Relatorios({ cards }: RelatoriosProps) {
  const navigate = useNavigate();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<TipoPedido[]>([]);
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>("");
  const [selectedEtapa, setSelectedEtapa] = useState<string>("");
  
  // Novo filtro: Todos os Pedidos ou Apenas Atrasados
  const [showOnlyAtrasados, setShowOnlyAtrasados] = useState(false);

  const TIPO_OPTIONS: { value: TipoPedido; label: string }[] = [
    { value: "CASUAL", label: "Casual" },
    { value: "ESCOLAR", label: "Escolar" },
    { value: "PRONTA_ENTREGA", label: "Pronta Entrega" },
    { value: "ATENDIMENTO", label: "Atendimento" },
    { value: "ESPORTIVO", label: "Esportivo" },
  ];

  // Filtro base
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch = !searchTerm || 
        card.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo = selectedTipos.length === 0 || selectedTipos.includes(card.tipo as TipoPedido);
      const matchesPrioridade = !selectedPrioridade || card.prioridade === selectedPrioridade;
      const matchesEtapa = !selectedEtapa || card.stage === selectedEtapa;

      return matchesSearch && matchesTipo && matchesPrioridade && matchesEtapa;
    });
  }, [cards, searchTerm, selectedTipos, selectedPrioridade, selectedEtapa]);

  // Aplicar filtro de atrasados
  const displayedCards = useMemo(() => {
    if (!showOnlyAtrasados) return filteredCards;

    return filteredCards.filter(c => 
      c.entrega && new Date(c.entrega) < new Date() && c.column !== "CONCLUIDO"
    );
  }, [filteredCards, showOnlyAtrasados]);

  const resumo = useMemo(() => {
    const hoje = new Date();
    const atrasados = displayedCards.filter(c => 
      c.entrega && new Date(c.entrega) < hoje && c.column !== "CONCLUIDO"
    );

    return {
      totalPedidos: displayedCards.length,
      totalPecas: displayedCards.reduce((sum, c) => sum + (c.qtd || 0), 0),
      emProducao: displayedCards.filter(c => c.stage === "PROD").length,
      atrasados: atrasados.length,
    };
  }, [displayedCards]);

  const atrasos = useMemo(() => {
    return displayedCards
      .filter(c => c.entrega && new Date(c.entrega) < new Date() && c.column !== "CONCLUIDO")
      .map(card => {
        const diasAtraso = Math.ceil((new Date().getTime() - new Date(card.entrega!).getTime()) / (1000 * 3600 * 24));
        return { ...card, diasAtraso };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);
  }, [displayedCards]);

  const exportarPDF = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft size={20} /> Voltar ao Kanban
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">📊 Relatórios</h1>
          <button onClick={exportarPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium">
            <Printer size={20} /> Exportar PDF
          </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">🔎 Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Número ou descrição..."
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Novo filtro: Todos / Apenas Atrasados */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Exibir</label>
              <div className="flex border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowOnlyAtrasados(false)}
                  className={`flex-1 py-3 text-sm font-medium ${!showOnlyAtrasados ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-100"}`}
                >
                  Todos os Pedidos
                </button>
                <button
                  onClick={() => setShowOnlyAtrasados(true)}
                  className={`flex-1 py-3 text-sm font-medium ${showOnlyAtrasados ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-100"}`}
                >
                  Apenas Atrasados
                </button>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tipo</label>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedTipos.includes(e.target.value as TipoPedido)) {
                    setSelectedTipos([...selectedTipos, e.target.value as TipoPedido]);
                  }
                }}
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-blue-400"
              >
                <option value="">Todos os tipos</option>
                {TIPO_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Prioridade</label>
              <select value={selectedPrioridade} onChange={(e) => setSelectedPrioridade(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>

            {/* Etapa */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Etapa</label>
              <select value={selectedEtapa} onChange={(e) => setSelectedEtapa(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">Todas as etapas</option>
                <option value="CALENDARIO">Calendário</option>
                <option value="PRE">Pré-produção</option>
                <option value="PROD">Produção</option>
                <option value="DONE">Concluído</option>
              </select>
            </div>
          </div>

          {/* Tags dos tipos selecionados */}
          {selectedTipos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTipos.map(tipo => (
                <span key={tipo} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {tipo}
                  <button onClick={() => setSelectedTipos(selectedTipos.filter(t => t !== tipo))} className="ml-2 text-blue-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-2xl font-semibold">Resumo Geral - Hoje</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-sm text-slate-600">Total de Pedidos</p>
              <p className="text-5xl font-bold text-slate-800">{resumo.totalPedidos}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-sm text-slate-600">Total de Peças</p>
              <p className="text-5xl font-bold text-slate-800">{resumo.totalPecas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl text-center">
              <p className="text-sm text-emerald-700">Em Produção</p>
              <p className="text-5xl font-bold text-emerald-700">{resumo.emProducao}</p>
            </div>
            <div className="bg-red-50 p-5 rounded-xl text-center">
              <p className="text-sm text-red-700">Atrasados</p>
              <p className="text-5xl font-bold text-red-700">{resumo.atrasados}</p>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-2xl font-semibold">
              {showOnlyAtrasados ? "Pedidos em Atraso" : "Todos os Pedidos"}
            </h2>
          </div>

          {displayedCards.length === 0 ? (
            <p className="text-center py-12 text-slate-500">Nenhum pedido encontrado com os filtros selecionados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-50 border-b">
                    <th className="text-left p-4">Pedido</th>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Etapa Atual</th>
                    <th className="text-center p-4">Qtd Peças</th>
                    <th className="text-center p-4">Dias em Atraso</th>
                    <th className="text-center p-4">Data Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCards.map((pedido) => {
                    const isAtrasado = pedido.entrega && new Date(pedido.entrega) < new Date();
                    const diasAtraso = isAtrasado ? Math.ceil((new Date().getTime() - new Date(pedido.entrega!).getTime()) / (1000 * 3600 * 24)) : 0;

                    return (
                      <tr key={pedido.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-medium">{pedido.numero}</td>
                        <td className="p-4 text-slate-700">{pedido.descricao}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">{pedido.column}</span>
                        </td>
                        <td className="p-4 text-center font-medium">{pedido.qtd}</td>
                        <td className="p-4 text-center">
                          {isAtrasado ? <span className="text-red-600 font-bold">+{diasAtraso}</span> : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="p-4 text-center text-slate-600">{pedido.entrega}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}