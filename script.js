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
        // Agrupar exercícios por categoria se houver uma coluna de grupo
        const group = exercise._GROUP || exercise[CONFIG.COLUMNS.GROUP] || exercise.Musculo || 'Exercícios';
        
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
        
        const exerciseName = exercise._EXERCISE || exercise[CONFIG.COLUMNS.EXERCISE] || exercise.Nome || 'Exercício';
        const series = exercise._SERIES || exercise[CONFIG.COLUMNS.SERIES] || exercise.Séries || '';
        const reps = exercise._REPS || exercise[CONFIG.COLUMNS.REPS] || exercise.Reps || '';
        const weight = exercise._WEIGHT || exercise[CONFIG.COLUMNS.WEIGHT] || exercise.Carga || '';
        const rest = exercise._REST || exercise[CONFIG.COLUMNS.REST] || exercise.Rest || '';
        
        let details = [];
        if (series) details.push(`${series} séries`);
        if (reps) details.push(`${reps} repetições`);
        if (weight) details.push(`${weight} kg`);
        if (rest) details.push(`${rest} descanso`);
        
        html += `
            <div class="exercise">
                <div class="exercise-name">${exerciseName}</div>
                <div class="exercise-details">${details.join(' • ')}</div>
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
}

// Dados de exemplo caso não consiga acessar a planilha
function getDummyWorkoutData() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const workoutPlans = {
        1: [ // Segunda-feira
            { Grupo: 'Peito', Exercicio: 'Supino Reto', Series: '4', Repeticoes: '8-12', Peso: '80', Descanso: '2min' },
            { Grupo: 'Peito', Exercicio: 'Supino Inclinado', Series: '3', Repeticoes: '10-12', Peso: '70', Descanso: '90s' },
            { Grupo: 'Tríceps', Exercicio: 'Tríceps Pulley', Series: '3', Repeticoes: '12-15', Peso: '40', Descanso: '60s' },
            { Grupo: 'Tríceps', Exercicio: 'Mergulho', Series: '3', Repeticoes: '10-12', Peso: 'Corporal', Descanso: '90s' }
        ],
        2: [ // Terça-feira
            { Grupo: 'Costas', Exercicio: 'Puxada Frente', Series: '4', Repeticoes: '8-12', Peso: '70', Descanso: '2min' },
            { Grupo: 'Costas', Exercicio: 'Remada Curvada', Series: '3', Repeticoes: '10-12', Peso: '60', Descanso: '90s' },
            { Grupo: 'Bíceps', Exercicio: 'Rosca Direta', Series: '3', Repeticoes: '12-15', Peso: '30', Descanso: '60s' },
            { Grupo: 'Bíceps', Exercicio: 'Rosca Martelo', Series: '3', Repeticoes: '10-12', Peso: '25', Descanso: '60s' }
        ],
        3: [ // Quarta-feira
            { Grupo: 'Pernas', Exercicio: 'Agachamento', Series: '4', Repeticoes: '8-12', Peso: '100', Descanso: '3min' },
            { Grupo: 'Pernas', Exercicio: 'Leg Press', Series: '3', Repeticoes: '12-15', Peso: '200', Descanso: '2min' },
            { Grupo: 'Pernas', Exercicio: 'Panturrilha', Series: '4', Repeticoes: '15-20', Peso: '80', Descanso: '60s' }
        ],
        4: [ // Quinta-feira
            { Grupo: 'Ombros', Exercicio: 'Desenvolvimento', Series: '4', Repeticoes: '8-12', Peso: '50', Descanso: '2min' },
            { Grupo: 'Ombros', Exercicio: 'Elevação Lateral', Series: '3', Repeticoes: '12-15', Peso: '15', Descanso: '60s' },
            { Grupo: 'Ombros', Exercicio: 'Elevação Posterior', Series: '3', Repeticoes: '12-15', Peso: '12', Descanso: '60s' }
        ],
        5: [ // Sexta-feira
            { Grupo: 'Cardio', Exercicio: 'Esteira', Series: '1', Repeticoes: '30min', Peso: 'Moderado', Descanso: '-' },
            { Grupo: 'Core', Exercicio: 'Prancha', Series: '3', Repeticoes: '60s', Peso: 'Corporal', Descanso: '30s' },
            { Grupo: 'Core', Exercicio: 'Abdominal', Series: '3', Repeticoes: '20', Peso: 'Corporal', Descanso: '30s' }
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
    
    // Recarregar treino a cada intervalo configurado
    setInterval(loadWorkout, CONFIG.WORKOUT.UPDATE_INTERVAL);
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

// Detectar cliques para recarregar (útil para controle remoto da TV)
let clickCount = 0;
document.addEventListener('click', function() {
    clickCount++;
    setTimeout(() => {
        if (clickCount === 3) {
            loadWorkout();
        }
        clickCount = 0;
    }, 1000);
});
