# 🔓 Como Tornar sua Planilha Pública - Passo a Passo

## ⚠️ IMPORTANTE
O sistema está mostrando "dia de descanso" porque não consegue acessar sua planilha. Siga estes passos EXATAMENTE:

## 📋 Passo 1: Abrir a Planilha
1. Acesse: https://docs.google.com/spreadsheets/d/13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q/edit
2. Certifique-se de estar logado na sua conta Google

## 🔓 Passo 2: Tornar Pública
1. Clique no botão **"Compartilhar"** (canto superior direito)
2. Na janela que abrir, clique em **"Alterar para qualquer pessoa com o link"**
3. No dropdown que aparecer, selecione **"Qualquer pessoa na internet"**
4. Certifique-se que está marcado **"Visualizador"** (não Editor)
5. Clique em **"Concluído"**

## ✅ Passo 3: Verificar a Aba
1. Confirme que existe uma aba chamada **"Plano de Treino"**
2. Se não existir, renomeie a aba atual ou crie uma nova
3. Clique com botão direito na aba → **"Renomear"** → digite **"Plano de Treino"**

## 📊 Passo 4: Verificar a Estrutura
Sua planilha deve ter estas colunas (na primeira linha):

| Dia | Grupo | Exercicio | Series | Repeticoes | Peso | Descanso |
|-----|-------|-----------|--------|------------|------|----------|

**Exemplo de dados:**
```
Dia,Grupo,Exercicio,Series,Repeticoes,Peso,Descanso
Segunda,Peito,Supino Reto,4,8-12,80,2min
Segunda,Peito,Supino Inclinado,3,10-12,70,90s
Terça,Costas,Puxada Frente,4,8-12,70,2min
```

## 🧪 Passo 5: Testar
1. Depois de tornar pública, acesse: http://localhost:8000/planilha-teste.html
2. Clique em **"Testar Todas as URLs"**
3. Deve aparecer ✅ em pelo menos uma URL
4. Deve mostrar os dados da sua planilha

## 🔄 Passo 6: Recarregar o Sistema
1. Acesse: http://localhost:8000/index.html
2. Pressione **R** para recarregar
3. Ou feche e abra novamente

## ❌ Se Ainda Não Funcionar

### Problema Comum 1: Aba Errada
- Verifique se está na aba "Plano de Treino"
- O GID na URL deve ser: `gid=684511506`

### Problema Comum 2: Planilha Não Pública
- Teste acessando esta URL diretamente no navegador:
- https://docs.google.com/spreadsheets/d/13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q/export?format=csv&gid=684511506
- Deve baixar um arquivo CSV, não mostrar erro

### Problema Comum 3: Dados Incorretos
- Verifique se a coluna "Dia" tem valores como: Segunda, Terça, etc.
- Hoje é **Segunda-feira**, deve ter linhas com "Segunda" na coluna Dia

## 📞 Como Saber se Funcionou
✅ No sistema principal, deve aparecer o treino de hoje
✅ No teste da planilha, deve mostrar dados reais
✅ No console do navegador (F12), deve mostrar logs de sucesso

---

**🎯 Dica Rápida:** Se a planilha estiver pública, o teste em `planilha-teste.html` mostrará exatamente quais dados estão sendo lidos!
