# 📋 Instruções para Configurar o Google Sheets

## Método 1: Planilha Pública (Mais Fácil)

### Passo 1: Tornar a Planilha Pública
1. Abra sua planilha: https://docs.google.com/spreadsheets/d/13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q/edit
2. Clique no botão **"Compartilhar"** (canto superior direito)
3. Clique em **"Alterar para qualquer pessoa com o link"**
4. Defina a permissão como **"Visualizador"**
5. Clique em **"Concluído"**

### Passo 2: Verificar a Estrutura da Planilha
Certifique-se de que sua planilha tem as seguintes colunas (na primeira linha):

| Dia | Grupo | Exercicio | Series | Repeticoes | Peso | Descanso |
|-----|-------|-----------|--------|------------|------|----------|
| Segunda | Peito | Supino Reto | 4 | 8-12 | 80 | 2min |
| Segunda | Peito | Supino Inclinado | 3 | 10-12 | 70 | 90s |
| Terça | Costas | Puxada Frente | 4 | 8-12 | 70 | 2min |

### Passo 3: Executar o Sistema
1. Abra o arquivo `index.html` no navegador
2. O sistema deve carregar automaticamente os dados da sua planilha

---

## Método 2: Com API Key (Mais Seguro)

### Passo 1: Criar uma API Key
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**
4. Vá em **"Credenciais"** > **"Criar Credenciais"** > **"Chave de API"**
5. Copie a chave gerada

### Passo 2: Configurar a API Key
1. Abra o arquivo `config.js`
2. Substitua a linha:
   ```javascript
   API_KEY: '', // Deixe vazio para usar modo público
   ```
   Por:
   ```javascript
   API_KEY: 'SUA_CHAVE_API_AQUI',
   ```

### Passo 3: Configurar Permissões da Planilha
1. Compartilhe a planilha com a conta de serviço (se usar)
2. Ou mantenha as configurações de compartilhamento atuais

---

## 🔧 Personalização Avançada

### Alterar Nomes das Colunas
Se sua planilha usa nomes diferentes, edite o arquivo `config.js`:

```javascript
COLUMNS: {
    DAY: 'Dia',           // Altere para o nome da coluna do dia
    GROUP: 'Musculo',     // Altere para o nome da coluna do grupo muscular
    EXERCISE: 'Nome',     // Altere para o nome da coluna do exercício
    SERIES: 'Séries',     // Altere para o nome da coluna de séries
    REPS: 'Reps',         // Altere para o nome da coluna de repetições
    WEIGHT: 'Carga',      // Altere para o nome da coluna de peso
    REST: 'Rest'          // Altere para o nome da coluna de descanso
}
```

### Alterar Aba da Planilha
Se você quer usar uma aba específica:

```javascript
SHEET: {
    ID: '13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q',
    NAME: 'MeuTreino',    // Nome da aba
    GID: '684511506',     // ID da aba (encontre na URL)
}
```

---

## 🐛 Solução de Problemas

### Problema: "Carregando treino..." não sai
**Soluções:**
1. Verifique se a planilha está pública
2. Confirme se o ID da planilha está correto no `config.js`
3. Verifique se há conexão com a internet
4. Abra o console do navegador (F12) para ver erros

### Problema: Treino não aparece para hoje
**Soluções:**
1. Verifique se há dados para o dia atual na planilha
2. Confirme se a coluna "Dia" está preenchida corretamente
3. Use variações como "Segunda", "Segunda-feira", "SEG"

### Problema: Dados não carregam
**Soluções:**
1. Tente o Método 1 (planilha pública) primeiro
2. Verifique se a API Key está correta (Método 2)
3. O sistema usará dados de exemplo se não conseguir acessar a planilha

---

## 📱 Uso na TV

### Para Smart TV
1. Abra o navegador da TV
2. Navegue até o arquivo `index.html`
3. Pressione F11 ou use o controle para tela cheia

### Para TV com Chromecast
1. Abra no computador/celular
2. Use "Transmitir" do Chrome
3. Selecione "Transmitir área de trabalho"

### Para TV com cabo HDMI
1. Conecte o computador na TV
2. Abra o arquivo no navegador
3. Pressione F11 para tela cheia

---

## 🎯 Dicas de Uso

- **Recarregar dados**: Pressione R ou clique 3 vezes rápido
- **Tela cheia**: Pressione F11
- **Atualização automática**: Sistema atualiza sozinho a cada 5 minutos
- **Backup local**: Se não acessar a planilha, usa dados de exemplo
