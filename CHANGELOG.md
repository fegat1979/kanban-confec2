# Changelog – Kanban de Produção (Confecção)

---

## [v11.0] – 2025-10-05
### Adicionado
- Estrutura modular consolidada (`src/` dividida em components, utils, hooks e data)
- Arquivo de regras Firebase incluído para referência de permissões
- Padrão de documentação e controle de versões (README_DEV.md e CHANGELOG.md)
- Suporte completo a layout 4K e rolagem horizontal otimizada
- Melhorias de usabilidade no comportamento de drag-and-drop

### Corrigido
- Bug ao expandir cartões após movimentação entre colunas
- Conflito entre botão individual de compactar e botão global da coluna
- Scroll horizontal instável ao arrastar cards em colunas cheias

### Removido
- Dependências redundantes nas colunas antigas
- Lógica duplicada de estado em modais e cards

---

## [v10.0] – 2025-09-30
### Adicionado
- Autenticação Google integrada ao Firebase
- Sistema de sessão única e controle de usuários logados
- Persistência de dados de sessão local

### Corrigido
- Sessões duplicadas de login simultâneo
- Falhas na renderização inicial dos cards

---

## [v9.0] – 2025-09-25
### Adicionado
- Regras iniciais de Firestore para controle de acesso
- Salvamento seguro via autenticação Firebase
- Estrutura preliminar de login/logout

---

## [v8.0] – 2025-09-20
### Adicionado
- Layout otimizado para telas 4K
- Alternância de visualização (compacta/detalhada)
- Scroll horizontal fixo e responsivo

---

## [v7.0] – 2025-09-15
### Base funcional validada
- Kanban com arrastar e soltar estável
- Alternância por card e por coluna
- Persistência de dados no localStorage
