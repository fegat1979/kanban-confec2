# Kanban de Produção – Projeto Confecção (v11)

## 📅 Contexto
Aplicação **React + TypeScript + Vite**, utilizando **@dnd-kit/core** para drag-and-drop e armazenamento local via **localStorage**, com autenticação e regras de acesso baseadas no **Firebase**.  
O objetivo é controlar visualmente o fluxo de produção da confecção (da emissão de pedido até a embalagem), utilizando princípios de **Kanban e Lean Manufacturing**.

---

## ⚙️ Estrutura do Projeto

```
kanban-confeccao/
│
├── src/
│   ├── components/       # Componentes visuais (cards, colunas, lanes, modais etc.)
│   ├── hooks/            # Hooks customizados para lógica do board
│   ├── data/             # Constantes, listas e metadados (colunas, estágios etc.)
│   ├── utils/            # Funções auxiliares (formatações, cálculos, etc.)
│   ├── types/            # Definições de tipos e interfaces do sistema
│   └── App.tsx           # Componente principal da aplicação
│
├── package.json          # Dependências e scripts do projeto
├── tsconfig.json         # Configuração do TypeScript
└── regras base de dados do firebase.txt  # Regras de segurança e acesso ao Firestore
```

---

## 🧭 Funcionalidades Implementadas

- 🧩 **Quadro Kanban dinâmico** com arrastar e soltar (DnD) entre colunas e estágios.
- 🪶 **Visualização compacta e detalhada** de cartões, individual ou por coluna.
- 📆 **Calendário de pedidos** com agrupamento por meses (JAN → DEZ).
- ⚙️ **Expansão e recolhimento de seções** (como o calendário completo).
- 🔁 **Persistência local automática** via `localStorage` (`kanban-confeccao-mvp-zip-v7`).
- 🧮 **Cálculo automático de prazos e prioridades** dos pedidos.
- 🧱 **Controle de WIP (Work In Progress)** com alertas visuais.
- 🔐 **Integração Firebase**: autenticação Google e regras Firestore personalizadas.
- 📺 **Layout adaptado para TV 4K**, com colunas ajustáveis e rolagem horizontal.

---

## 🚀 Melhorias Previstas (Próximas Etapas)

1. **Conexão Firebase Realtime / Multiusuário**
2. **Dashboard Resumido de Produção**
3. **Responsividade Avançada (4K e Tablets)**
4. **Filtros e Buscas Rápidas**
5. **Modo Supervisor (Controle de WIP)**

---

## 🧰 Dependências Principais

| Biblioteca | Função |
|-------------|--------|
| React / TypeScript | Estrutura principal da aplicação |
| @dnd-kit/core e @dnd-kit/sortable | Arrastar e soltar (drag and drop) |
| lucide-react | Ícones |
| shadcn/ui | Componentes de UI padronizados |
| Firebase SDK | Autenticação e Firestore |
| Vite | Build rápido e leve |

---

## 🧠 Convenções Internas

- **Tipos:** sempre definidos em `/src/types/index.ts`.
- **Constantes globais:** armazenadas em `/src/data/`.
- **Funções utilitárias:** em `/src/utils/`.
- **Chave de armazenamento local:** `"kanban-confeccao-mvp-zip-v7"`.
- **Nomenclatura de colunas:** segue padrão `{FASE}_{MES}` (ex.: `CALENDARIO_JAN`, `PRODUCAO_FEV`).

---

## 📂 Estrutura de Versões

| Versão | Status | Descrição |
|--------|---------|------------|
| `v7` | ✅ Base funcional validada | Kanban completo com alternância compacta/detalhada |
| `v8` | 🧩 Revisões visuais | Ajuste para layout 4K e rolagem horizontal |
| `v9` | 🪶 Firebase inicial | Implementação das regras de acesso e autenticação |
| `v10` | ⚙️ Melhorias gerais | Otimização de performance e pequenas correções |
| `v11` | 🚀 Atual | Consolidação das estruturas e separação dos módulos |

---

## 👨‍💻 Fluxo de Envio e Revisão (ChatGPT)

1. Compactar `src/`, `package.json`, `tsconfig.json` e `regras base de dados do firebase.txt`
2. Enviar pela aba **“Adicionar arquivos”** no projeto “Kanban de Confecção”
3. Descrever o foco da atualização (ex: “ajustar largura dinâmica das colunas”)
4. O modelo revisa e devolve os arquivos modificados no mesmo formato `.zip`
5. Testar localmente → validar → gerar próxima versão (`v12`, `v13`, etc.)

---

## 📘 Observações de Segurança
- Nunca inclua `.env` reais nos arquivos compartilhados.
- Para testes, use `.env.example` com placeholders.
- Regras do Firestore podem ser ajustadas no arquivo `regras base de dados do firebase.txt`.

---

© 2025 — Projeto interno Fase Sport / Dinossauros Uniformes
Desenvolvido com suporte técnico do ChatGPT (GPT-5)
