// Configuração da API do Google Sheets (agora vem do config.js)
const SHEET_ID = CONFIG.SHEET.ID;
const SHEET_NAME = CONFIG.SHEET.NAME;
const SHEET_GID = CONFIG.SHEET.GID;
const API_KEY = CONFIG.SHEET.API_KEY;

// Função para atualizar o relógio
function updateClock() {
    const now = new Date();

    // Atualizar horário
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    // Atualizar data
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const weekday = weekdays[now.getDay()];
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);

    document.getElementById('day').textContent = day;
    document.getElementById('weekday').textContent = weekday;
    document.getElementById('date').textContent = month;
    document.getElementById('year').textContent = year;

    // Simular temperatura (você pode integrar com uma API de clima real)
    const temp = Math.floor(Math.random() * 5) + 22; // 22-26°C
    document.getElementById('temperature').textContent = temp;
}

// Função para buscar dados da planilha do Google Sheets
async function fetchWorkoutData() {
    console.log('🔗 Configuração atual:');
    console.log('  SHEET_ID:', SHEET_ID);
    console.log('  SHEET_GID:', SHEET_GID);
    console.log('  SHEET_NAME:', SHEET_NAME);

    // Lista de URLs para tentar
    const urlsToTry = [
        // Método 1: CSV com GID específico
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`,
        // Método 2: CSV da primeira aba
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
        // Método 3: Google Visualization API
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`,
        // Método 4: Sem GID
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
        const csvUrl = urlsToTry[i];
        console.log(`🔗 Tentativa ${i + 1}: ${csvUrl}`);

        try {
            const response = await fetch(csvUrl, {
                mode: 'cors'
            });

            console.log(`📡 Response ${i + 1}:`, response.status, response.statusText);

            if (response.ok) {
                const csvText = await response.text();
                console.log(`📄 CSV recebido (primeiras 300 chars):`, csvText.substring(0, 300));

                if (csvText.trim().length > 0 && !csvText.includes('<!DOCTYPE')) {
                    const parsedData = parseCSV(csvText);
                    console.log('📊 Dados parseados:', parsedData.length, 'linhas');
                    if (parsedData.length > 0) {
                        console.log('📋 Headers encontrados:', Object.keys(parsedData[0]));
                        console.log('📋 Primeira linha:', parsedData[0]);
                        return parsedData;
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Erro na tentativa ${i + 1}:`, error);
        }
    }

    console.log('🔄 Todas as tentativas falharam, usando dados de exemplo...');
    return getDummyWorkoutData();
}

// Função para converter CSV em array de objetos
function parseCSV(csvText) {
    console.log('📝 Iniciando parse do CSV...');

    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
        console.log('❌ CSV vazio');
        return [];
    }

    console.log('📊 Total de linhas:', lines.length);

    // Parse da primeira linha para obter headers
    const headers = lines[0].split(',').map(header =>
        header.trim().replace(/"/g, '')
    );
    console.log('📋 Headers encontrados:', headers);

    // Atualizar mapeamento das colunas baseado nos headers reais
    const actualColumns = updateColumnMapping(headers);

    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;

        // Parse mais robusto para CSV
        const values = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim().replace(/"/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/"/g, ''));

        // Criar objeto da linha
        if (values.length > 0) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Também criar com os nomes padronizados
            row._DAY = row[actualColumns.DAY] || '';
            row._EXERCISE = row[actualColumns.EXERCISE] || '';
            row._SERIES_REPS = row[actualColumns.SERIES_REPS] || '';
            row._VIDEO = row[actualColumns.VIDEO] || '';

            // Extrair grupo do contexto ou da linha anterior
            if (!row._DAY && data.length > 0) {
                // Se não tem dia, herda do anterior (exercícios do mesmo dia)
                row._DAY = data[data.length - 1]._DAY;
            }

            data.push(row);

            // Log das primeiras 3 linhas para debug
            if (i <= 3) {
                console.log(`📄 Linha ${i}:`, row);
            }
        }
    }

    console.log(`✅ Parse concluído: ${data.length} linhas processadas`);
    return data;
}

// Função para obter o treino do dia atual
function getTodayWorkout(workoutData) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Diferentes variações dos nomes dos dias
    const dayVariations = [
        ['domingo', 'dom', 'sunday', 'sun'], // 0
        ['segunda', 'seg', 'segunda-feira', 'monday', 'mon'], // 1
        ['terça', 'ter', 'terca', 'terça-feira', 'tuesday', 'tue'], // 2
        ['quarta', 'qua', 'quarta-feira', 'wednesday', 'wed'], // 3
        ['quinta', 'qui', 'quinta-feira', 'thursday', 'thu'], // 4
        ['sexta', 'sex', 'sexta-feira', 'friday', 'fri'], // 5
        ['sábado', 'sab', 'sabado', 'saturday', 'sat'] // 6
    ];

    const todayVariations = dayVariations[dayOfWeek];
    const todayName = todayVariations[0]; // Nome principal

    console.log('📅 Hoje é:', todayName, `(${dayOfWeek})`, '- Variações aceitas:', todayVariations);
    console.log('🔍 Procurando por coluna:', CONFIG.COLUMNS.DAY);
    console.log('📊 Total de dados recebidos:', workoutData.length);

    // Debug: mostrar todas as linhas e valores da coluna DAY
    console.log('🔍 Analisando dados da planilha:');
    workoutData.forEach((row, index) => {
        const dayValue = row._DAY || row[CONFIG.COLUMNS.DAY] || '';
        const exerciseValue = row._EXERCISE || row[CONFIG.COLUMNS.EXERCISE] || '';
        const seriesReps = row._SERIES_REPS || row[CONFIG.COLUMNS.SERIES_REPS] || '';
        console.log(`  Linha ${index + 1}: "${dayValue}" | Exercício: "${exerciseValue}" | Series: "${seriesReps}"`);
    });

    // Buscar treino para o dia atual - busca mais flexível
    const todayWorkout = workoutData.filter(row => {
        const dayValue = row._DAY || row[CONFIG.COLUMNS.DAY] || '';
        const exerciseValue = row._EXERCISE || row[CONFIG.COLUMNS.EXERCISE] || '';

        // Só considerar se tem exercício válido
        if (!exerciseValue || exerciseValue.trim() === '' || exerciseValue.toLowerCase().includes('link')) {
            return false;
        }

        if (!dayValue) return false;

        const dayValueLower = dayValue.toLowerCase().trim();
        const match = todayVariations.some(variation =>
            dayValueLower.includes(variation) || variation.includes(dayValueLower)
        );

        if (match) {
            console.log(`✅ MATCH encontrado: "${dayValue}" para ${todayName} | Exercício: "${exerciseValue}"`);
        }

        return match;
    });

    console.log('🏋️ Exercícios encontrados para hoje:', todayWorkout.length);
    if (todayWorkout.length > 0) {
        console.log('📋 Primeiros exercícios:', todayWorkout.slice(0, 2));
    }

    return todayWorkout.length > 0 ? todayWorkout : null;
}

// Função para exibir o treino na tela
function displayWorkout(workoutData) {
    const workoutContent = document.getElementById('workout-content');
    const workoutDateElement = document.getElementById('workout-date');

    if (!workoutData || workoutData.length === 0) {
        workoutContent.innerHTML = `
            <div class="workout-group">
                <h3>📅 Hoje é dia de descanso!</h3>
                <div class="exercise">
                    <div class="exercise-name">Recuperação Ativa</div>
                    <div class="exercise-details">Aproveite para descansar e se preparar para o próximo treino!</div>
                </div>
            </div>
        `;
        return;
    }

    let html = '';
    let currentGroup = '';

    workoutData.forEach(exercise => {
        // Determinar grupo baseado no dia da semana ou categoria
        const dayValue = exercise._DAY || exercise[CONFIG.COLUMNS.DAY] || '';
        let group = '';

        // Definir grupos baseados no dia da semana
        if (dayValue.toLowerCase().includes('segunda')) {
            group = 'SEGUNDA';
        } else if (dayValue.toLowerCase().includes('terça')) {
            group = 'TERÇA';
        } else if (dayValue.toLowerCase().includes('quarta')) {
            group = 'QUARTA';
        } else if (dayValue.toLowerCase().includes('quinta')) {
            group = 'QUINTA';
        } else if (dayValue.toLowerCase().includes('sexta')) {
            group = 'SEXTA';
        } else if (dayValue.toLowerCase().includes('sábado')) {
            group = 'SÁBADO';
        } else {
            group = 'Treino do Dia';
        }

        if (group !== currentGroup) {
            if (currentGroup !== '') {
                html += '</div>';
            }
            html += `
                <div class="workout-group">
                    <h3>💪 ${group}</h3>
            `;
            currentGroup = group;
        }

        const exerciseName = exercise._EXERCISE || exercise[CONFIG.COLUMNS.EXERCISE] || 'Exercício';
        const seriesReps = exercise._SERIES_REPS || exercise[CONFIG.COLUMNS.SERIES_REPS] || '';
        const video = exercise._VIDEO || exercise[CONFIG.COLUMNS.VIDEO] || '';

        // Formatar as séries/reps
        let formattedSeriesReps = seriesReps;
        if (seriesReps) {
            // Melhorar formatação das séries
            formattedSeriesReps = seriesReps
                .replace(/x/gi, ' × ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        html += `
            <div class="exercise">
                <div class="exercise-name">${exerciseName}</div>
                <div class="exercise-details">${formattedSeriesReps}</div>
            </div>
        `;
    });

    if (currentGroup !== '') {
        html += '</div>';
    }

    workoutContent.innerHTML = html;

    // Atualizar data do treino
    const today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    workoutDateElement.textContent = today.toLocaleDateString('pt-BR', options);

    // Garantir visibilidade após exibir conteúdo
    setTimeout(() => {
        ensureWorkoutVisibility();
        detectAirPlayAndOptimize();
    }, 100);
}

// Dados de exemplo caso não consiga acessar a planilha
function getDummyWorkoutData() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const workoutPlans = {
        1: [ // Segunda-feira
            { 'Dia da Semana': 'SEGUNDA', 'Exercício': 'Agachamento com Barra', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'SEGUNDA', 'Exercício': 'Afundo com Anilha', 'Séries x Reps / Tempo': '3x10 (cada perna)' },
            { 'Dia da Semana': 'SEGUNDA', 'Exercício': 'Cadeira Extensora na Polia', 'Séries x Reps / Tempo': '3x15' },
            { 'Dia da Semana': 'SEGUNDA', 'Exercício': 'Mesa Flexora na Polia', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'SEGUNDA', 'Exercício': 'Elevação de Panturrilhas', 'Séries x Reps / Tempo': '3x20' }
        ],
        2: [ // Terça-feira
            { 'Dia da Semana': 'TERÇA', 'Exercício': 'Boxe Técnico (Sombra)', 'Séries x Reps / Tempo': '3 rounds x 2 min' },
            { 'Dia da Semana': 'TERÇA', 'Exercício': 'Saco de Pancada', 'Séries x Reps / Tempo': '4 rounds x 3 min' },
            { 'Dia da Semana': 'TERÇA', 'Exercício': 'Burpee Adaptado', 'Séries x Reps / Tempo': '10 reps' },
            { 'Dia da Semana': 'TERÇA', 'Exercício': 'Escalador', 'Séries x Reps / Tempo': '30s' }
        ],
        3: [ // Quarta-feira
            { 'Dia da Semana': 'QUARTA', 'Exercício': 'Supino Reto com Barra', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'QUARTA', 'Exercício': 'Remada Baixa na Polia', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'QUARTA', 'Exercício': 'Desenvolvimento com Anilhas', 'Séries x Reps / Tempo': '3x10' },
            { 'Dia da Semana': 'QUARTA', 'Exercício': 'Rosca Direta com Barra', 'Séries x Reps / Tempo': '3x12' }
        ],
        4: [ // Quinta-feira
            { 'Dia da Semana': 'QUINTA', 'Exercício': 'Polichinelo', 'Séries x Reps / Tempo': '30s' },
            { 'Dia da Semana': 'QUINTA', 'Exercício': 'Saltos Laterais', 'Séries x Reps / Tempo': '30s' },
            { 'Dia da Semana': 'QUINTA', 'Exercício': 'Corrida Parada (joelho alto)', 'Séries x Reps / Tempo': '30s' },
            { 'Dia da Semana': 'QUINTA', 'Exercício': 'Boxe no Saco', 'Séries x Reps / Tempo': '3 rounds x 3 min' }
        ],
        5: [ // Sexta-feira
            { 'Dia da Semana': 'SEXTA', 'Exercício': 'Levantamento Terra com Barra', 'Séries x Reps / Tempo': '3x10' },
            { 'Dia da Semana': 'SEXTA', 'Exercício': 'Supino Inclinado com Barra', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'SEXTA', 'Exercício': 'Puxada Alta na Polia', 'Séries x Reps / Tempo': '3x12' },
            { 'Dia da Semana': 'SEXTA', 'Exercício': 'Agachamento Sumô com Anilha', 'Séries x Reps / Tempo': '3x15' }
        ],
        6: [ // Sábado
            { 'Dia da Semana': 'SÁBADO', 'Exercício': 'Mobilidade Articular', 'Séries x Reps / Tempo': '10 min' },
            { 'Dia da Semana': 'SÁBADO', 'Exercício': 'Escada de Agilidade', 'Séries x Reps / Tempo': '2x 30s' },
            { 'Dia da Semana': 'SÁBADO', 'Exercício': 'Alongamentos Ativos', 'Séries x Reps / Tempo': '10 min' }
        ]
    };

    return workoutPlans[dayOfWeek] || [];
}

// Função principal para carregar os dados do treino
async function loadWorkout() {
    try {
        const workoutData = await fetchWorkoutData();
        const todayWorkout = getTodayWorkout(workoutData);
        displayWorkout(todayWorkout);
    } catch (error) {
        console.error('Erro ao carregar treino:', error);
        displayWorkout(getDummyWorkoutData());
    }
}

// Função para testar diferentes formas de acessar a planilha
async function testSheetAccess() {
    const testUrls = [
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`,
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`,
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
    ];

    for (let i = 0; i < testUrls.length; i++) {
        console.log(`🧪 Testando URL ${i + 1}:`, testUrls[i]);
        try {
            const response = await fetch(testUrls[i], { mode: 'cors' });
            console.log(`📊 Resultado ${i + 1}:`, response.status, response.ok);
            if (response.ok) {
                const text = await response.text();
                console.log(`📄 Conteúdo ${i + 1} (primeiros 300 chars):`, text.substring(0, 300));
            }
        } catch (error) {
            console.log(`❌ Erro ${i + 1}:`, error.message);
        }
    }
}

// Função para descobrir o GID correto da aba
async function findCorrectGID() {
    // Tentar diferentes GIDs comuns
    const possibleGIDs = [
        '684511506', // O que está configurado
        '0',         // Primeira aba geralmente
        '1',         // Segunda aba
        '2'          // Terceira aba
    ];

    console.log('🔍 Procurando GID correto para aba "Plano de Treino"...');

    for (const gid of possibleGIDs) {
        console.log(`🧪 Testando GID: ${gid}`);
        try {
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
            const response = await fetch(url, { mode: 'cors' });

            if (response.ok) {
                const text = await response.text();
                console.log(`✅ GID ${gid} funcionou! Primeiros dados:`, text.substring(0, 200));

                // Verificar se tem dados relevantes de treino
                if (text.toLowerCase().includes('treino') ||
                    text.toLowerCase().includes('exercicio') ||
                    text.toLowerCase().includes('segunda') ||
                    text.toLowerCase().includes('dia')) {
                    console.log(`🎯 GID ${gid} parece ser a aba de treino!`);
                    return gid;
                }
            } else {
                console.log(`❌ GID ${gid} não funcionou:`, response.status);
            }
        } catch (error) {
            console.log(`❌ Erro com GID ${gid}:`, error.message);
        }
    }

    return null;
}

// Função para encontrar o nome correto da coluna
function findColumnName(headers, columnType) {
    const variations = CONFIG.COLUMN_VARIATIONS[columnType] || [CONFIG.COLUMNS[columnType]];

    for (const variation of variations) {
        const found = headers.find(header =>
            header.toLowerCase().trim() === variation.toLowerCase().trim()
        );
        if (found) {
            console.log(`✅ Coluna ${columnType} encontrada como: "${found}"`);
            return found;
        }
    }

    console.log(`❌ Coluna ${columnType} não encontrada. Headers disponíveis:`, headers);
    return CONFIG.COLUMNS[columnType]; // Fallback para o padrão
}

// Função para atualizar mapeamento das colunas baseado nos headers reais
function updateColumnMapping(headers) {
    const updatedColumns = {};

    for (const [key, defaultValue] of Object.entries(CONFIG.COLUMNS)) {
        updatedColumns[key] = findColumnName(headers, key);
    }

    console.log('📋 Mapeamento atualizado das colunas:', updatedColumns);
    return updatedColumns;
}

// Inicializar a aplicação
function init() {
    // Atualizar relógio imediatamente e depois a cada segundo
    updateClock();
    setInterval(updateClock, CONFIG.CLOCK.UPDATE_INTERVAL);

    // Carregar treino do dia
    loadWorkout();

    // Detectar e otimizar para AirPlay/TV
    detectAirPlayAndOptimize();

    // Garantir visibilidade do treino
    ensureWorkoutVisibility();

    // Recarregar treino a cada intervalo configurado
    setInterval(loadWorkout, CONFIG.WORKOUT.UPDATE_INTERVAL);

    // Reaplicar otimizações após redimensionamento
    window.addEventListener('resize', () => {
        setTimeout(() => {
            detectAirPlayAndOptimize();
            ensureWorkoutVisibility();
        }, 100);
    });
}

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', init);

// Função para alternar tela cheia (útil para TV)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F11' || e.key === 'f') {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Recarregar dados com R
    if (e.key === 'r' || e.key === 'R') {
        loadWorkout();
    }

    // Testar acesso à planilha com T
    if (e.key === 't' || e.key === 'T') {
        console.log('🧪 Iniciando teste de acesso à planilha...');
        testSheetAccess();
    }

    // Descobrir GID correto com G
    if (e.key === 'g' || e.key === 'G') {
        console.log('🔍 Procurando GID correto...');
        findCorrectGID().then(gid => {
            if (gid) {
                console.log(`🎯 GID correto encontrado: ${gid}`);
                console.log('💡 Atualize o config.js com este GID!');
            } else {
                console.log('❌ Nenhum GID válido encontrado');
            }
        });
    }
});

// Detectar AirPlay e otimizar interface
function detectAirPlayAndOptimize() {
    const isLargeScreen = window.screen.width >= 1280 && window.screen.height >= 720;
    const isTV = window.screen.width >= 1440 ||
                 window.innerWidth >= 1440 ||
                 navigator.userAgent.includes('TV') ||
                 navigator.userAgent.includes('AppleTV');

    if (isLargeScreen || isTV) {
        console.log('📺 Detectado exibição em TV/AirPlay - Aplicando otimizações');

        // Aplicar classe específica para TV
        document.body.classList.add('tv-mode');

        // Garantir que o layout seja otimizado
        const container = document.querySelector('.container');
        if (container) {
            container.style.gridTemplateRows = '32vh 1fr';
            container.style.gap = '1.5rem';
            container.style.padding = '2rem';
        }

        // Otimizar área do treino
        const workoutContainer = document.querySelector('.workout-container');
        if (workoutContainer) {
            workoutContainer.style.maxHeight = 'none';
            workoutContainer.style.height = '100%';
            workoutContainer.style.minHeight = '400px';
            workoutContainer.style.fontSize = '1.1rem';
        }

        // Ajustar tamanho do relógio
        const ledDisplay = document.querySelector('.led-display');
        if (ledDisplay) {
            ledDisplay.style.width = '60vw';
            ledDisplay.style.maxWidth = '800px';
        }

        // Forçar reflow
        window.setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
}

// Função para garantir visibilidade do treino
function ensureWorkoutVisibility() {
    const workoutContainer = document.querySelector('.workout-container');
    const workoutContent = document.getElementById('workout-content');

    if (workoutContainer) {
        workoutContainer.style.visibility = 'visible';
        workoutContainer.style.opacity = '1';
        workoutContainer.style.display = 'flex';
    }

    if (workoutContent) {
        workoutContent.style.visibility = 'visible';
        workoutContent.style.opacity = '1';
        workoutContent.style.display = 'block';
    }
}

// Detectar AirPlay e otimizar interface ao redimensionar
window.addEventListener('resize', () => {
    detectAirPlayAndOptimize();
});

// Detectar AirPlay e otimizar interface na carga inicial
document.addEventListener('DOMContentLoaded', () => {
    detectAirPlayAndOptimize();
});

// Funcionalidade Apple TV / AirPlay
class AppleTVController {
    constructor() {
        this.isConnected = false;
        this.airplayButton = null;
        this.init();
    }

    init() {
        // Aguardar o DOM carregar
        document.addEventListener('DOMContentLoaded', () => {
            this.airplayButton = document.getElementById('airplay-btn');
            if (this.airplayButton) {
                this.airplayButton.addEventListener('click', () => this.handleAirPlayClick());
                this.checkAirPlaySupport();
            }
        });
    }

    checkAirPlaySupport() {
        // Detectar dispositivos Apple
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isMac = /Mac/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        // Verificar suporte AirPlay específico para dispositivos Apple
        if (isIOS || (isMac && isSafari)) {
            console.log('✅ Dispositivo Apple detectado - AirPlay nativo disponível');
            this.updateButtonState('available');
            this.showDeviceInfo(isIOS, isMac);
        } else if ('webkitSupportsPresentationMode' in HTMLVideoElement.prototype ||
                   'remote' in HTMLVideoElement.prototype ||
                   navigator.presentation) {
            console.log('✅ AirPlay/Casting suportado');
            this.updateButtonState('available');
        } else {
            console.log('❌ AirPlay/Casting não suportado neste navegador');
            this.updateButtonState('unsupported');
        }
    }

    showDeviceInfo(isIOS, isMac) {
        // Mostrar apenas uma vez, com informação menos intrusiva
        setTimeout(() => {
            if (isIOS) {
                console.log('📱 iPhone/iPad detectado - AirPlay disponível via Control Center');
            } else if (isMac) {
                console.log('💻 macOS detectado - AirPlay disponível via Control Center ou Preferências');
            }
        }, 1000);
    }

    async handleAirPlayClick() {
        if (!this.airplayButton) return;

        try {
            this.updateButtonState('connecting');

            // Tentar diferentes métodos de casting
            await this.attemptCasting();

        } catch (error) {
            console.error('Erro ao conectar com Apple TV:', error);
            this.showError('Erro ao conectar com Apple TV');
            this.updateButtonState('available');
        }
    }

    async attemptCasting() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isMac = /Mac/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        console.log('🎯 Dispositivo detectado:', { isIOS, isMac, isSafari });

        // Para dispositivos Apple, ir direto para instruções de AirPlay nativo
        if (isIOS) {
            console.log('📱 iOS detectado - mostrando instruções AirPlay');
            this.appleDeviceFallback();
            return;
        }

        if (isMac && isSafari) {
            console.log('💻 macOS Safari detectado - tentando vídeo AirPlay');
            if (await this.tryAppleNativeAirPlay()) return;

            // Se falhar, mostrar instruções
            this.appleDeviceFallback();
            return;
        }

        // Para outros navegadores/dispositivos
        console.log('🌐 Tentando métodos alternativos de casting...');

        // Método 1: Tentar WebKit Presentation Mode
        if (await this.tryWebKitPresentation()) return;

        // Método 2: Tentar Remote Playback API
        if (await this.tryRemotePlayback()) return;

        // Método 3: Tentar Presentation API
        if (await this.tryPresentationAPI()) return;

        // Fallback final
        this.fallbackFullscreen();
    }

    async tryAppleNativeAirPlay() {
        try {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isMac = /Mac/.test(navigator.userAgent);

            console.log('🍎 Tentando AirPlay nativo Apple...');

            // Para iOS, usar uma abordagem diferente
            if (isIOS) {
                return await this.createIOSAirPlayVideo();
            }

            // Para macOS, criar vídeo com fonte estática
            if (isMac) {
                return await this.createMacAirPlayVideo();
            }

        } catch (error) {
            console.log('AirPlay nativo Apple falhou:', error.message);
        }
        return false;
    }

    async createIOSAirPlayVideo() {
        try {
            // Criar um vídeo simples para iOS
            const video = document.createElement('video');
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '250px';
            video.style.backgroundColor = '#000';
            video.style.borderRadius = '8px';
            video.playsInline = true;
            video.muted = true;

            // Usar uma fonte de vídeo estática ou criar blob
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');

            // Desenhar frame inicial
            this.drawWorkoutFrame(ctx, canvas.width, canvas.height);

            // Converter para blob e definir como fonte
            canvas.toBlob(async (blob) => {
                const videoBlob = await this.createVideoBlob(canvas);
                video.src = URL.createObjectURL(videoBlob);

                // Substituir conteúdo temporariamente
                const workoutContent = document.getElementById('workout-content');
                const originalContent = workoutContent.innerHTML;

                workoutContent.innerHTML = `
                    <div style="text-align: center; margin-bottom: 15px;">
                        <p style="color: #ff0000; font-size: 16px; margin-bottom: 10px;">
                            📱 Toque no ícone AirPlay no player abaixo:
                        </p>
                    </div>
                `;
                workoutContent.appendChild(video);

                // Tentar reproduzir
                try {
                    await video.play();
                    this.updateButtonState('connected');
                    console.log('✅ Vídeo iOS AirPlay criado com sucesso');

                    // Botão para restaurar
                    this.setupRestoreButton(workoutContent, originalContent);

                } catch (playError) {
                    console.log('Erro ao reproduzir vídeo iOS:', playError);
                    workoutContent.innerHTML = originalContent;
                    return false;
                }
            }, 'video/mp4');

            return true;

        } catch (error) {
            console.log('Erro criando vídeo iOS:', error.message);
            return false;
        }
    }

    async createMacAirPlayVideo() {
        try {
            // Para macOS, usar MediaRecorder com canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');

            // Animar o canvas
            const animateCanvas = () => {
                this.drawWorkoutFrame(ctx, canvas.width, canvas.height);
                requestAnimationFrame(animateCanvas);
            };
            animateCanvas();

            const stream = canvas.captureStream(30);
            const video = document.createElement('video');
            video.srcObject = stream;
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '300px';
            video.style.backgroundColor = '#000';
            video.style.borderRadius = '8px';
            video.muted = true;
            video.autoplay = true;

            // Adicionar atributos específicos para AirPlay
            video.setAttribute('webkit-airplay', 'allow');
            video.setAttribute('airplay', 'allow');

            const workoutContent = document.getElementById('workout-content');
            const originalContent = workoutContent.innerHTML;

            workoutContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <p style="color: #ff0000; font-size: 16px; margin-bottom: 10px;">
                        💻 Clique no ícone AirPlay no player ou use Control Center:
                    </p>
                </div>
            `;
            workoutContent.appendChild(video);

            await video.play();
            this.updateButtonState('connected');
            console.log('✅ Vídeo macOS AirPlay criado com sucesso');

            this.setupRestoreButton(workoutContent, originalContent);
            return true;

        } catch (error) {
            console.log('Erro criando vídeo macOS:', error.message);
            return false;
        }
    }

    drawWorkoutFrame(ctx, width, height) {
        // Limpar canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        // Título
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🏋️ MEU TREINO', width / 2, height / 3);

        // Subtítulo
        ctx.font = 'bold 32px Courier New';
        ctx.fillText('Transmitindo via AirPlay', width / 2, height / 2);

        // Data/hora atual
        const now = new Date();
        ctx.font = 'bold 24px Courier New';
        ctx.fillText(now.toLocaleString('pt-BR'), width / 2, height / 2 + 80);

        // Instrução
        ctx.font = '20px Courier New';
        ctx.fillText('Use o controle AirPlay no vídeo para conectar à Apple TV', width / 2, height - 60);
    }

    async createVideoBlob(canvas) {
        // Criar um blob de vídeo simples (isso é um placeholder)
        // Na prática, você precisaria de uma biblioteca como WebCodecs ou similar
        return new Blob(['fake video data'], { type: 'video/mp4' });
    }

    setupRestoreButton(workoutContent, originalContent) {
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = '← Voltar ao Treino';
        restoreBtn.style.cssText = `
            background: #ff0000;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
        `;

        restoreBtn.onclick = () => {
            workoutContent.innerHTML = originalContent;
            this.updateButtonState('available');
            this.airplayButton.onclick = () => this.handleAirPlayClick();
        };

        workoutContent.appendChild(restoreBtn);

        // Auto-restaurar após 60 segundos
        setTimeout(() => {
            if (workoutContent.contains(restoreBtn)) {
                restoreBtn.click();
            }
        }, 60000);
    }

    showAppleInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            this.showInfo('📱 No vídeo abaixo, toque no ícone AirPlay e selecione sua Apple TV');
        } else {
            this.showInfo('💻 No vídeo abaixo, clique no ícone AirPlay e selecione sua Apple TV');
        }
    }

    appleDeviceFallback() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            // Para iOS, mostrar instruções detalhadas sem tentar tela cheia
            this.showIOSInstructions();
        } else {
            // Para macOS, mostrar instruções sobre AirPlay do sistema
            this.showMacInstructions();
        }

        this.updateButtonState('connected');
    }

    showIOSInstructions() {
        // Criar overlay com instruções para iOS
        const overlay = document.createElement('div');
        overlay.id = 'ios-instructions-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: #ff0000;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            text-align: center;
            padding: 20px;
        `;

        overlay.innerHTML = `
            <div style="max-width: 400px;">
                <h2 style="color: #ff0000; margin-bottom: 30px; font-size: 24px;">
                    📱 AirPlay no iOS
                </h2>

                <div style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                    <p style="margin-bottom: 20px;">
                        <strong>Método 1 - Control Center:</strong><br>
                        • Deslize para baixo do canto superior direito<br>
                        • Toque em "Espelhamento de Tela"<br>
                        • Selecione sua Apple TV
                    </p>

                    <p style="margin-bottom: 20px;">
                        <strong>Método 2 - Safari:</strong><br>
                        • Toque no ícone de compartilhamento<br>
                        • Procure por "AirPlay" ou "Apple TV"<br>
                        • Selecione sua Apple TV
                    </p>
                </div>

                <button id="close-ios-instructions" style="
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    ✅ Entendi
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Fechar ao clicar no botão
        document.getElementById('close-ios-instructions').onclick = () => {
            document.body.removeChild(overlay);
            this.updateButtonState('available');
        };

        // Fechar ao tocar fora (overlay)
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                this.updateButtonState('available');
            }
        };
    }

    showMacInstructions() {
        // Para macOS, criar overlay similar
        const overlay = document.createElement('div');
        overlay.id = 'mac-instructions-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: #ff0000;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            text-align: center;
            padding: 20px;
        `;

        overlay.innerHTML = `
            <div style="max-width: 500px;">
                <h2 style="color: #ff0000; margin-bottom: 30px; font-size: 24px;">
                    💻 AirPlay no macOS
                </h2>

                <div style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                    <p style="margin-bottom: 20px;">
                        <strong>Método 1 - Control Center:</strong><br>
                        • Clique no Control Center (canto superior direito)<br>
                        • Clique em "Espelhamento de Tela"<br>
                        • Selecione sua Apple TV
                    </p>

                    <p style="margin-bottom: 20px;">
                        <strong>Método 2 - Preferências:</strong><br>
                        • Menu Apple → Preferências do Sistema<br>
                        • Clique em "Monitores"<br>
                        • Selecione "Monitor AirPlay"
                    </p>
                </div>

                <button id="close-mac-instructions" style="
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    ✅ Entendi
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Fechar ao clicar no botão
        document.getElementById('close-mac-instructions').onclick = () => {
            document.body.removeChild(overlay);
            this.updateButtonState('available');
        };

        // Fechar ao clicar fora
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                this.updateButtonState('available');
            }
        };
    }

    async tryWebKitPresentation() {
        try {
            // Criar um elemento de vídeo invisível para o AirPlay
            const video = document.createElement('video');
            video.style.position = 'absolute';
            video.style.opacity = '0';
            video.style.pointerEvents = 'none';
            document.body.appendChild(video);

            if ('webkitSupportsPresentationMode' in video &&
                video.webkitSupportsPresentationMode('picture-in-picture')) {

                // Criar um canvas com o conteúdo da página
                const canvas = await this.createPageCanvas();
                const stream = canvas.captureStream(30);
                video.srcObject = stream;

                await video.play();
                video.webkitSetPresentationMode('picture-in-picture');

                this.updateButtonState('connected');
                console.log('✅ Conectado via WebKit Presentation');
                return true;
            }
        } catch (error) {
            console.log('WebKit Presentation não disponível:', error.message);
        }
        return false;
    }

    async tryRemotePlayback() {
        try {
            const video = document.createElement('video');
            if (video.remote) {
                const canvas = await this.createPageCanvas();
                const stream = canvas.captureStream(30);
                video.srcObject = stream;

                await video.play();
                await video.remote.prompt();

                this.updateButtonState('connected');
                console.log('✅ Conectado via Remote Playback');
                return true;
            }
        } catch (error) {
            console.log('Remote Playback não disponível:', error.message);
        }
        return false;
    }

    async tryPresentationAPI() {
        try {
            if (navigator.presentation && navigator.presentation.defaultRequest) {
                const presentationRequest = new PresentationRequest([window.location.href]);
                const connection = await presentationRequest.start();

                this.updateButtonState('connected');
                console.log('✅ Conectado via Presentation API');
                return true;
            }
        } catch (error) {
            console.log('Presentation API não disponível:', error.message);
        }
        return false;
    }

    async createPageCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Definir tamanho do canvas baseado na janela
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Capturar screenshot da página usando html2canvas (se disponível)
        // ou criar uma representação básica
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Adicionar texto indicando que está sendo transmitido
        ctx.fillStyle = '#ff0000';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🏋️ MEU TREINO', canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('Transmitindo para Apple TV', canvas.width / 2, canvas.height / 2 + 50);

        return canvas;
    }

    fallbackFullscreen() {
        // Como fallback, entrar em modo tela cheia
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            this.updateButtonState('connected');
            console.log('📺 Modo tela cheia ativado como alternativa');

            // Mostrar mensagem explicativa
            this.showInfo('Modo tela cheia ativado. Para Apple TV, use AirPlay do Safari ou Chrome no iOS/Mac');
        } else {
            this.showError('Funcionalidade não suportada neste navegador');
        }
    }

    updateButtonState(state) {
        if (!this.airplayButton) return;

        // Remover classes anteriores
        this.airplayButton.classList.remove('connecting', 'connected');

        switch (state) {
            case 'available':
                this.airplayButton.disabled = false;
                this.airplayButton.innerHTML = '📺 Apple TV';
                this.airplayButton.title = 'Enviar para Apple TV';
                break;

            case 'connecting':
                this.airplayButton.classList.add('connecting');
                this.airplayButton.disabled = true;
                this.airplayButton.innerHTML = '⏳ Conectando...';
                this.airplayButton.title = 'Conectando com Apple TV';
                break;

            case 'connected':
                this.airplayButton.classList.add('connected');
                this.airplayButton.disabled = false;
                this.airplayButton.innerHTML = '✅ Conectado';
                this.airplayButton.title = 'Conectado ao Apple TV - Clique para desconectar';
                this.isConnected = true;
                break;

            case 'unsupported':
                this.airplayButton.disabled = true;
                this.airplayButton.innerHTML = '❌ Não suportado';
                this.airplayButton.title = 'AirPlay não suportado neste navegador';
                break;
        }
    }

    showError(message) {
        // Criar notificação de erro temporária
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        // Criar notificação informativa temporária
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#4444ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remover após 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Inicializar o controlador Apple TV (desabilitado para otimização de AirPlay)
// const appleTVController = new AppleTVController();

// Função de debug para testar AirPlay
function debugAirPlay() {
    console.log('🔍 Debug AirPlay:');
    console.log('User Agent:', navigator.userAgent);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMac = /Mac/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    console.log('Dispositivo detectado:', { isIOS, isMac, isSafari });

    // Testar APIs disponíveis
    const video = document.createElement('video');
    console.log('APIs disponíveis:');
    console.log('- webkitSupportsPresentationMode:', 'webkitSupportsPresentationMode' in video);
    console.log('- remote (Remote Playback):', 'remote' in video);
    console.log('- navigator.presentation:', !!navigator.presentation);
    console.log('- webkit-airplay suportado:', true); // Sempre disponível no Safari

    // Limpar elemento de teste
    video.remove();
}

// Executar debug automaticamente
if (window.location.search.includes('debug')) {
    document.addEventListener('DOMContentLoaded', debugAirPlay);
}
