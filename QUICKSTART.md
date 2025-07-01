# 🏋️ Relógio de Academia - Guia Rápido

## 🚀 Como Usar

### 1. Configuração Inicial (1 minuto)
```bash
# Torne sua planilha pública:
# 1. Abra: https://docs.google.com/spreadsheets/d/13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q/edit
# 2. Clique em "Compartilhar" → "Alterar para qualquer pessoa com o link"
# 3. Defina como "Visualizador"
```

### 2. Executar
```bash
# Opção 1: Script automático
./start.sh

# Opção 2: Servidor Python
python3 -m http.server 8000
# Acesse: http://localhost:8000

# Opção 3: Direto no navegador
# Abra o arquivo index.html
```

### 3. Para TV
- Pressione **F11** para tela cheia
- Use **R** para recarregar dados
- **3 cliques rápidos** também recarrega

## 📋 Estrutura da Planilha

| Dia     | Grupo   | Exercicio       | Series | Repeticoes | Peso | Descanso |
|---------|---------|-----------------|--------|------------|------|----------|
| Segunda | Peito   | Supino Reto     | 4      | 8-12       | 80   | 2min     |
| Terça   | Costas  | Puxada Frente   | 4      | 8-12       | 70   | 2min     |

## 🔧 Personalizar

Edite `config.js` para:
- Alterar nomes das colunas
- Configurar intervalos de atualização
- Modificar aparência

## 🆘 Problemas?

1. **Treino não carrega**: Verifique se a planilha está pública
2. **"Carregando..."**: Abra `teste.html` para diagnóstico
3. **Dados errados**: Confirme estrutura da planilha

## 📱 Recursos

- ⏰ Relógio LED vermelho (como de academia)
- 📅 Data e temperatura automáticas
- 🏋️ Treino do dia da planilha Google Sheets
- 📺 Otimizado para TV
- 🔄 Atualização automática

**🎯 Acesse: `index.html` para usar ou `teste.html` para testar!**
