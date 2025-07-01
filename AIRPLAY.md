# 📺 GUIA AIRPLAY - MEU TREINO

## Como usar com AirPlay/Apple TV

### Versão Otimizada para TV
Use o arquivo: `airplay.html` - Esta versão foi especialmente otimizada para exibição via AirPlay.

### Passos para usar com AirPlay:

1. **No iPhone/iPad:**
   - Abra o Safari
   - Acesse: `http://[SEU-IP]:8000/airplay.html`
   - Ative o AirPlay deslizando para baixo (Control Center)
   - Selecione sua Apple TV
   - Escolha "Espelhar Tela"

2. **Otimizações implementadas:**
   - ✅ Layout responsivo específico para TVs
   - ✅ Tamanhos de fonte otimizados para visualização à distância
   - ✅ Área do treino maximizada
   - ✅ Relógio compacto mas legível
   - ✅ Detecção automática de modo TV
   - ✅ Prevenção de problemas de zoom/escala
   - ✅ Garantia de visibilidade do conteúdo

3. **Resoluções suportadas:**
   - 📺 HD (1280x720)
   - 📺 Full HD (1920x1080)
   - 📺 4K (3840x2160)

### Diferenças da versão otimizada:

#### Layout:
- Relógio ocupa menos espaço vertical (30vh vs 40vh)
- Área do treino maximizada
- Espaçamento otimizado para TVs

#### Tipografia:
- Fontes maiores para leitura à distância
- Contrastes melhorados
- Texto mais legível em telas grandes

#### Compatibilidade:
- Meta tags específicas para Apple TV
- Prevenção de zoom automático
- Detecção automática de dispositivo

### Comandos úteis:
- **F11** ou **F**: Tela cheia
- **R**: Recarregar treino
- **T**: Testar conexão com planilha

### Problemas conhecidos e soluções:

**Problema**: Treino não aparece na TV
**Solução**: Use `airplay.html` em vez de `index.html`

**Problema**: Texto muito pequeno
**Solução**: A versão otimizada ajusta automaticamente

**Problema**: Layout cortado
**Solução**: Certifique-se de usar "Espelhar Tela" no AirPlay

### IP do servidor:
Para acessar de outros dispositivos, substitua `localhost` pelo IP do seu computador:
```
# Descobrir seu IP:
ip addr show | grep inet
# ou
hostname -I
```

Então acesse: `http://[SEU-IP]:8000/airplay.html`
