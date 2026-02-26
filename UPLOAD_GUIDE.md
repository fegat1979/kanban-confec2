# 📤 Roteiro de Upload Seguro – Envio de novas versões (.zip)

---

## 🔹 Passo 1. Preparar os arquivos
Antes de gerar o `.zip`, confira se estão incluídos **somente os arquivos necessários**:

**Incluir:**
```
src/
package.json
tsconfig.json
regras base de dados do firebase.txt
README_DEV.md
CHANGELOG.md
```

**Excluir:**
```
node_modules/
dist/
.firebase/
.github/
.env*
```

---

## 🔹 Passo 2. Nomear corretamente o arquivo
Use o formato padrão:
```
kanban_vXX.zip
```
Exemplo:
```
kanban_v12.zip
```
> (onde “XX” representa o número da versão, conforme o CHANGELOG)

---

## 🔹 Passo 3. Compactar
**Windows PowerShell:**
```powershell
Compress-Archive -Path .\src, .\package.json, .\tsconfig.json, '.\regras base de dados do firebase.txt', .\README_DEV.md, .\CHANGELOG.md `
  -DestinationPath .\kanban_v12.zip -Force
```

---

## 🔹 Passo 4. Subir o arquivo
1. Acesse o projeto **“Kanban de Confecção”** no ChatGPT.  
2. Vá até a aba **“Adicionar arquivos”** (ícone de clipe 📎).  
3. **Remova a versão anterior** (ex: `kanban_v11.zip`).  
4. **Envie a nova** (`kanban_v12.zip`).  

---

## 🔹 Passo 5. Informar o foco da atualização
Na conversa, envie uma mensagem curta e objetiva:
> “Enviei o `kanban_v12.zip` — foco: otimizar o comportamento do botão expandir e testar responsividade da Lane.”

---

## 🔹 Passo 6. Retorno da revisão
O assistente revisará o código e devolverá:
- `kanban_v12-fixed.zip` (versão ajustada)
- resumo técnico das modificações

Após testar localmente:
- Se tudo ok → atualize o CHANGELOG.md e incremente a versão (`v13`)
- Se houver pendências → descreva e reenvie o mesmo `.zip` com observações

---

## 🔹 Passo 7. Segurança
- Nunca inclua `.env` reais no `.zip`
- Caso precise mostrar as variáveis, use um arquivo **`.env.example`** com placeholders  
- Revise se há termos como `apiKey`, `token`, `Authorization`, `secret` ou `PRIVATE_KEY` no código antes de enviar

---

📘 **Dica:**  
Mantenha um histórico local das versões em uma pasta separada:
```
/versoes/
├── kanban_v10.zip
├── kanban_v11.zip
└── kanban_v12.zip
```

---
