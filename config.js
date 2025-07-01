// Configuração do Sistema
const CONFIG = {
    // Configurações da Planilha Google Sheets
    SHEET: {
        ID: '13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q',
        NAME: 'Plano de Treino', // Nome da aba da planilha
        GID: '684511506', // ID da aba específica
        API_KEY: '', // Deixe vazio para usar modo público
    },

    // Mapeamento das colunas da planilha (baseado na estrutura real)
    COLUMNS: {
        DAY: 'Dia da Semana',
        EXERCISE: 'Exercício',
        SERIES_REPS: 'Séries x Reps / Tempo',
        VIDEO: 'Vídeo Demonstrativo'
    },
    
    // Variações alternativas dos nomes das colunas
    COLUMN_VARIATIONS: {
        DAY: ['Dia da Semana', 'Dia', 'Day', 'Weekday'],
        EXERCISE: ['Exercício', 'Exercicio', 'Nome', 'Exercise', 'Movement'],
        SERIES_REPS: ['Séries x Reps / Tempo', 'Series x Reps', 'Sets x Reps', 'Series', 'Reps'],
        VIDEO: ['Vídeo Demonstrativo', 'Video', 'Link', 'Demonstração']
    },

    // Configurações do relógio
    CLOCK: {
        UPDATE_INTERVAL: 1000, // 1 segundo
        SHOW_TEMPERATURE: true,
        TEMPERATURE_RANGE: { min: 22, max: 26 } // °C
    },

    // Configurações do treino
    WORKOUT: {
        UPDATE_INTERVAL: 5 * 60 * 1000, // 5 minutos
        SHOW_REST_DAY_MESSAGE: true
    },

    // Configurações visuais
    DISPLAY: {
        FULLSCREEN_ON_LOAD: false,
        AUTO_RELOAD_ON_ERROR: true,
        ANIMATION_SPEED: 1000 // ms
    }
};

// Exportar configuração para uso global
window.CONFIG = CONFIG;
