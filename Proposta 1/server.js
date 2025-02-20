const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

let devices = [];
let sensorHistory = {}; // Simula um banco de dados

const MAX_SENSORES = 85; 

// Fun��o para gerar sensores e atuadores
function generateDevices() {
    devices = []; 

    for (let i = 1; i <= 100; i++) {
        let circuito = Math.floor(Math.random() * 9) + 1;
        let isSensor = Math.random() < 0.5 ? 1 : 0; // 1 para sensor, 0 para atuador
        let categoria = isSensor === 1 ? Math.floor(Math.random() * 3) + 1 : 0; // 1 temperatura, 2 umidade, 3 press�o
        
        let id = `${circuito}${isSensor}${categoria}${String(i).padStart(3, '0')}`;
        let valor = isSensor === 1 ? parseFloat((Math.random() * 100).toFixed(2)) : Math.random() < 0.5;

        devices.push({ id, valor });

        if (isSensor) {
            generateSensorHistory(id);
        }
    }
}

// Fun��o para simular dados hist�ricos de sensores
function generateSensorHistory(sensorId) {
    const history = [];
    let currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 30); // Começa há 30 dias atrás

    for (let i = 0; i < 720; i++) { // 336 registros (7 dias * 24h * 2 medições/hora)
        history.push({
            id: sensorId,
            time: currentTime.toISOString().slice(0, 19).replace("T", " "), // "YYYY-MM-DD HH:MM:SS"
            value: parseFloat((Math.random() * 100).toFixed(2))
        });
        currentTime.setMinutes(currentTime.getMinutes() + 60); // Adiciona 120 minutos
    }

    sensorHistory[sensorId] = history;
}



// Atualiza o valor de um sensor
app.patch("/sensor/:id", (req, res) => {
    const { id } = req.params;
    const { valor } = req.body;

    let sensor = devices.find(s => s.id === id);
    if (sensor) {
        sensor.valor = valor;
        res.json({ msg: "Valor atualizado com sucesso!", sensor });
    } else {
        res.status(404).json({ error: "Sensor n�o encontrado" });
    }
});

// Rota para listar sensores
app.get("/sensores", (req, res) => {
    res.json({ devices });
});

// Buscar dados hist�ricos de um sensor a partir de um timestamp
app.get("/sensores/dados", (req, res) => {
    const { id, from, to } = req.query;

    if (!id || !from || !to) {
        return res.status(400).json({ error: "ID do sensor, data inicial e data final são obrigatórios!" });
    }

    const sensorData = sensorHistory[id] || [];
    const filteredData = sensorData.filter(entry => entry.time >= from && entry.time <= to);

    if (filteredData.length === 0) {
        return res.status(404).json({ error: "Nenhum dado encontrado para esse período." });
    }

    res.json(filteredData);
});


// Recarregar sensores
app.post("/reload", (req, res) => {
    generateDevices();
    res.json({ msg: "Sensores recarregados!", sensores: devices });
});

// Buscar dados individuais de um sensor
app.get("/sensor/:id", (req, res) => {
    const sensor = devices.find(s => s.id === req.params.id);
    if (sensor) {
        res.json(sensor);
    } else {
        res.status(404).json({ error: "Sensor n�o encontrado" });
    }
});

// Alterna o status de um atuador
app.post("/sensor/toggle/:id", (req, res) => {
    const { id } = req.params;
    let sensor = devices.find(s => s.id === id);
    
    if (sensor) {
        // Alterna o valor do sensor/atuador (true para false e vice-versa)
        if (sensor.valor === true) {
            sensor.valor = false;
        } else {
            sensor.valor = true;
        }
        res.json({ msg: "Status alternado com sucesso!", sensor });
    } else {
        res.status(404).json({ error: "Sensor ou atuador não encontrado" });
    }
});


// Inicializa os sensores ao iniciar o servidor
app.listen(port, () => {
    generateDevices();
    console.log(`Middleware rodando em http://localhost:${port}`);
});
