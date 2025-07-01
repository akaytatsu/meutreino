// Configuração do Sistema
const CONFIG = {
    // Configurações da Planilha Google Sheets
    SHEET: {
        ID: '13yJQe1C_EfBX2EIioDcq1FE4eMGMilsa7ZS2tc87Z7Q',
        NAME: 'Plano de Treino', // Nome da aba da planilha
        GID: '684511506', // ID da aba específica
        API_KEY: '', // Deixe vazio para usar modo público
    },

    // Mapeamento das colunas da planilha
    COLUMNS: {
        DAY: 'Dia',
        GROUP: 'Grupo',
        EXERCISE: 'Exercicio',
        SERIES: 'Series',
        REPS: 'Repeticoes',
        WEIGHT: 'Peso',
        REST: 'Descanso'
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
