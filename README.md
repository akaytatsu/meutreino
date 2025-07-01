# Relógio de Academia - Meu Treino

Um sistema de exibição para TV que simula um relógio LED vermelho de academia e mostra o treino do dia a partir de uma planilha do Google Sheets.

## Características

- 🕒 **Relógio LED Digital**: Interface que simula um display LED vermelho como os relógios de academia
- 📅 **Data e Temperatura**: Exibe data atual e temperatura simulada
- 🏋️ **Treino do Dia**: Carrega automaticamente o treino do dia da sua planilha do Google Sheets
- 📺 **Otimizado para TV**: Interface responsiva ideal para exibição em televisão
- ⏰ **Atualização Automática**: Relógio atualiza a cada segundo, treino a cada 5 minutos

## Como Usar

### Opção 1: Planilha Pública (Recomendado)

1. Torne sua planilha do Google Sheets pública:
   - Abra sua planilha
   - Clique em "Compartilhar" > "Alterar para qualquer pessoa com o link"
   - Defina permissão como "Visualizador"

2. Abra o arquivo `script.js` e certifique-se de que o `SHEET_ID` está correto:
   ```javascript
   const SHEET_ID = '13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q';
   ```

### Opção 2: Com API Key do Google

1. Crie uma API Key no Google Cloud Console
2. Ative a API do Google Sheets
3. Substitua `'SUA_API_KEY_AQUI'` pela sua API Key no arquivo `script.js`

## Estrutura da Planilha

Sua planilha deve ter as seguintes colunas (adapte os nomes no código se necessário):

- **Dia**: Dia da semana (Segunda, Terça, etc.)
- **Grupo/Musculo**: Grupo muscular ou categoria do exercício
- **Exercicio/Nome**: Nome do exercício
- **Series/Séries**: Número de séries
- **Repeticoes/Reps**: Número de repetições
- **Peso/Carga**: Peso a ser utilizado
- **Descanso/Rest**: Tempo de descanso

## Controles

- **F11 ou F**: Entrar/sair do modo tela cheia
- **R**: Recarregar dados do treino
- **3 cliques rápidos**: Recarregar dados (útil para controle remoto)

## Executar

1. Abra o arquivo `index.html` em um navegador
2. Para melhor experiência na TV, use modo tela cheia (F11)
3. Certifique-se de que há conexão com a internet para carregar os dados da planilha

## Personalização

- **Cores**: Modifique as cores no arquivo `style.css`
- **Layout**: Ajuste o grid no CSS para diferentes proporções de tela
- **Dados**: Se não conseguir acessar a planilha, o sistema usa dados de exemplo

## Compatibilidade

- Funciona em navegadores modernos
- Otimizado para TVs e monitores grandes
- Responsivo para diferentes resoluções

## Troubleshooting

Se o treino não carregar:
1. Verifique se a planilha está pública
2. Confirme o ID da planilha no código
3. Verifique a conexão com a internet
4. O sistema usará dados de exemplo em caso de erro
