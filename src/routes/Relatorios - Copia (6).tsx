// src/routes/Relatorios.tsx - VERSÃO ROBUSTA COM ATUALIZAÇÃO DE TAGS
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, AlertTriangle, Printer, Search, RefreshCw } from "lucide-react";
import type { Card, TipoPedido } from "../types";

type RelatoriosProps = {
  cards: Card[];
};

export function Relatorios({ cards }: RelatoriosProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<TipoPedido[]>([]);
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>("");
  const [selectedEtapa, setSelectedEtapa] = useState<string>("");
  const [showOnlyAtrasados, setShowOnlyAtrasados] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const TIPO_OPTIONS: { value: TipoPedido; label: string }[] = [
    { value: "CASUAL", label: "Casual" },
    { value: "ESCOLAR", label: "Escolar" },
    { value: "PRONTA_ENTREGA", label: "Pronta Entrega" },
    { value: "ATENDIMENTO", label: "Atendimento" },
    { value: "ESPORTIVO", label: "Esportivo" },
  ];

  // CÁLCULO ROBUSTO DAS TAGS - Atualiza sempre que os cards mudam
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const set = new Set<string>();
    cards.forEach(card => {
      (card.tags || []).forEach(tag => {
        if (tag && tag.trim()) set.add(tag.trim());
      });
    });
    setAllTags(Array.from(set).sort());
  }, [cards]);

  const activeCards = useMemo(() => cards.filter(c => c.column !== "CONCLUIDO"), [cards]);

  const filteredCards = useMemo(() => {
    return activeCards.filter((card) => {
      const matchesSearch = !searchTerm || 
        card.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo = selectedTipos.length === 0 || selectedTipos.includes(card.tipo as TipoPedido);
      const matchesPrioridade = !selectedPrioridade || card.prioridade === selectedPrioridade;
      const matchesEtapa = !selectedEtapa || card.stage === selectedEtapa;

      let matchesDate = true;
      if (card.entrega) {
        const entregaDate = new Date(card.entrega);
        if (startDate) matchesDate = matchesDate && entregaDate >= new Date(startDate);
        if (endDate) matchesDate = matchesDate && entregaDate <= new Date(endDate);
      }

      const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => (card.tags || []).includes(tag));

      return matchesSearch && matchesTipo && matchesPrioridade && matchesEtapa && matchesDate && matchesTag;
    });
  }, [activeCards, searchTerm, selectedTipos, selectedPrioridade, selectedEtapa, startDate, endDate, selectedTags]);

  const displayedCards = useMemo(() => {
    if (!showOnlyAtrasados) return filteredCards;
    return filteredCards.filter(c => c.entrega && new Date(c.entrega) < new Date());
  }, [filteredCards, showOnlyAtrasados]);

  const calculateRemaining = (card: Card) => {
    const total = card.qtd || 0;
    const concluida = (card as any).qtdConcluida || 0;
    return Math.max(0, total - concluida);
  };

  const resumo = useMemo(() => {
    const hoje = new Date();
    const atrasados = displayedCards.filter(c => c.entrega && new Date(c.entrega) < hoje);

    return {
      totalPedidos: displayedCards.length,
      totalPecas: displayedCards.reduce((sum, c) => sum + (c.qtd || 0), 0),
      pecasRestantes: displayedCards.reduce((sum, c) => sum + calculateRemaining(c), 0),
      emProducao: displayedCards.filter(c => c.stage === "PROD").length,
      atrasados: atrasados.length,
    };
  }, [displayedCards]);

  const exportarPDF = () => window.print();

  const handleRefresh = () => {
    window.location.reload(); // Força recarregamento completo da página
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft size={20} /> Voltar ao Kanban
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">📊 Relatórios</h1>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-slate-100">
              <RefreshCw size={18} /> Atualizar Filtros
            </button>
            <button onClick={exportarPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium">
              <Printer size={20} /> Exportar PDF
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-500 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Número ou descrição..." className="w-full pl-10 py-3 border rounded-xl text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Exibir</label>
              <div className="flex border rounded-xl overflow-hidden h-11">
                <button onClick={() => setShowOnlyAtrasados(false)} className={`flex-1 text-sm font-medium ${!showOnlyAtrasados ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-100"}`}>Todos</button>
                <button onClick={() => setShowOnlyAtrasados(true)} className={`flex-1 text-sm font-medium ${showOnlyAtrasados ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-100"}`}>Apenas Atrasados</button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Data De</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border rounded-xl text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Data Até</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border rounded-xl text-sm" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs text-slate-500 mb-1">TAG</label>
              <select 
                onChange={(e) => {
                  if (e.target.value && !selectedTags.includes(e.target.value)) {
                    setSelectedTags([...selectedTags, e.target.value]);
                  }
                }}
                className="w-full p-3 border rounded-xl text-sm"
              >
                <option value="">Todas as tags</option>
                {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>

            <div className="md:col-span-12 flex gap-4 mt-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Tipo</label>
                <select onChange={(e) => { if (e.target.value) setSelectedTipos([...selectedTipos, e.target.value as TipoPedido]); }} className="w-full p-3 border rounded-xl text-sm">
                  <option value="">Todos</option>
                  {TIPO_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Prioridade</label>
                <select value={selectedPrioridade} onChange={(e) => setSelectedPrioridade(e.target.value)} className="w-full p-3 border rounded-xl text-sm">
                  <option value="">Todas</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Etapa</label>
                <select value={selectedEtapa} onChange={(e) => setSelectedEtapa(e.target.value)} className="w-full p-3 border rounded-xl text-sm">
                  <option value="">Todas</option>
                  <option value="CALENDARIO">Calendário</option>
                  <option value="PRE">Pré-produção</option>
                  <option value="PROD">Produção</option>
                </select>
              </div>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTags.map(tag => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
                  {tag}
                  <button onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} className="ml-2 text-blue-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resumo e Tabela (mantidos) */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-2xl font-semibold">Resumo Geral - Hoje</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-sm text-slate-600">Total de Pedidos</p>
              <p className="text-5xl font-bold text-slate-800">{resumo.totalPedidos}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl text-center">
              <p className="text-sm text-slate-600">Total de Peças</p>
              <p className="text-5xl font-bold text-slate-800">{resumo.totalPecas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl text-center">
              <p className="text-sm text-emerald-700">Peças Restantes</p>
              <p className="text-5xl font-bold text-emerald-700">{resumo.pecasRestantes?.toLocaleString("pt-BR") || 0}</p>
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

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-2xl font-semibold">
              {showOnlyAtrasados ? "Pedidos em Atraso" : "Todos os Pedidos"}
            </h2>
          </div>

          {displayedCards.length === 0 ? (
            <p className="text-center py-12 text-slate-500">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-50 border-b">
                    <th className="text-left p-4">Pedido</th>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Etapa Atual</th>
                    <th className="text-center p-4">Qtd Total</th>
                    <th className="text-center p-4">Peças Restantes</th>
                    <th className="text-center p-4">Dias para Entrega</th>
                    <th className="text-center p-4">Data Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCards.map((pedido) => {
                    const entregaDate = pedido.entrega ? new Date(pedido.entrega) : null;
                    let dias = 0;
                    let cor = "text-slate-400";
                    const restantes = calculateRemaining(pedido);

                    if (entregaDate) {
                      const diffTime = entregaDate.getTime() - new Date().getTime();
                      dias = Math.ceil(diffTime / (1000 * 3600 * 24));
                      if (dias < 0) cor = "text-red-600 font-bold";
                      else if (dias === 0) cor = "text-amber-600 font-bold";
                      else cor = "text-emerald-600 font-bold";
                    }

                    return (
                      <tr key={pedido.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-medium">{pedido.numero}</td>
                        <td className="p-4 text-slate-700">{pedido.descricao}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">{pedido.column}</span>
                        </td>
                        <td className="p-4 text-center font-medium">{pedido.qtd}</td>
                        <td className="p-4 text-center font-medium text-emerald-700">{restantes}</td>
                        <td className={`p-4 text-center ${cor}`}>
                          {dias >= 0 ? `-${dias}` : `+${Math.abs(dias)}`}
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
};

const calculateRemaining = (card: Card) => {
  const total = card.qtd || 0;
  const concluida = (card as any).qtdConcluida || 0;
  return Math.max(0, total - concluida);
};