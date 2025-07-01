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
    try {
        // Para funcionar sem API Key, vamos usar uma versão pública da planilha
        // Você pode tornar a planilha pública e usar o CSV export
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
        
        const response = await fetch(csvUrl, {
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao acessar a planilha');
        }
        
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        return getDummyWorkoutData(); // Retorna dados de exemplo em caso de erro
    }
}

// Função para converter CSV em array de objetos
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
    }
    
    return data;
}

// Função para obter o treino do dia atual
function getTodayWorkout(workoutData) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const todayName = weekdays[dayOfWeek];
    
    // Buscar treino para o dia atual
    const todayWorkout = workoutData.filter(row => 
        row[CONFIG.COLUMNS.DAY] && row[CONFIG.COLUMNS.DAY].toLowerCase().includes(todayName.toLowerCase())
    );
    
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
        const group = exercise[CONFIG.COLUMNS.GROUP] || exercise.Musculo || 'Exercícios';
        
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
        
        const exerciseName = exercise[CONFIG.COLUMNS.EXERCISE] || exercise.Nome || 'Exercício';
        const series = exercise[CONFIG.COLUMNS.SERIES] || exercise.Séries || '';
        const reps = exercise[CONFIG.COLUMNS.REPS] || exercise.Reps || '';
        const weight = exercise[CONFIG.COLUMNS.WEIGHT] || exercise.Carga || '';
        const rest = exercise[CONFIG.COLUMNS.REST] || exercise.Rest || '';
        
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
