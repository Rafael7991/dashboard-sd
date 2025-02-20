const express = require("express");
const cors = require("cors");

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

let devices = [];
const CIRCUITS = ["1", "2", "3"];
const SENSOR_TYPES = ["Temperatura", "Pressao", "Humidade"];

// Função para gerar sensores e atuadores com múltiplos registros de valor
function generateDevices() {
    devices = [];
    for (let i = 0; i < 50; i++) {
        let circuito_id = CIRCUITS[Math.floor(Math.random() * CIRCUITS.length)];
        let isSensor = Math.random() < 0.5;
        let tipo = isSensor ? SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)] : "Atuador";
        let id = i + 1;
        
        let registros = [];
        let numRegistros = Math.floor(Math.random() * 6) + 5; // Entre 5 e 10 registros
        for (let j = 0; j < numRegistros; j++) {
            let valor = isSensor ? parseFloat((Math.random() * 100).toFixed(2)) : Math.random() < 0.5 ? 1 : 0;
            let timestamp = new Date(Date.now() - Math.random() * 1000000000).toISOString();
            registros.push({ timestamp, valor });
        }
        registros.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Ordena por data
        
        devices.push({ circuito_id, id, tipo, registros });
    }
}

// Rota: GET /circuits
app.get("/circuits", (req, res) => {
    res.json(CIRCUITS);
});

// Rota: GET /circuits/{circuit_id}/devices
app.get("/circuits/:circuit_id/devices", (req, res) => {
    const { circuit_id } = req.params;
    const filteredDevices = devices.filter(d => d.circuito_id === circuit_id);
    res.json(filteredDevices);
});

// Rota: GET /circuits/{circuit_id}/sensor/{sensor_id}/last
app.get("/circuits/:circuit_id/sensor/:sensor_id/last", (req, res) => {
    const { circuit_id, sensor_id } = req.params;
    const sensor = devices.find(d => d.circuito_id === circuit_id && d.id == sensor_id && d.tipo !== "Atuador");
    
    if (sensor) {
        res.json({ ...sensor, registros: [sensor.registros[sensor.registros.length - 1]] });
    } else {
        res.status(404).json({ message: "No data found" });
    }
});

// Rota: GET /circuits/{circuit_id}/actuator/{actuator_id}/last
app.get("/circuits/:circuit_id/actuator/:actuator_id/last", (req, res) => {
    const { circuit_id, actuator_id } = req.params;
    const actuator = devices.find(d => d.circuito_id === circuit_id && d.id == actuator_id && d.tipo === "Atuador");
    
    if (actuator) {
        res.json({ ...actuator, registros: [actuator.registros[actuator.registros.length - 1]] });
    } else {
        res.status(404).json({ message: "No data found" });
    }
});

// Rota: GET /circuits/{circuit_id}/sensor/{sensor_id}/all
app.get("/circuits/:circuit_id/sensor/:sensor_id/all", (req, res) => {
    const { circuit_id, sensor_id } = req.params;
    const { start_date, end_date } = req.query;
    
    const sensor = devices.find(d => d.circuito_id === circuit_id && d.id == sensor_id && d.tipo !== "Atuador");
    if (!sensor) {
        return res.json({ message: "No data found", start_date, end_date });
    }
    
    const filteredData = sensor.registros.filter(d =>
        new Date(d.timestamp) >= new Date(start_date) && new Date(d.timestamp) <= new Date(end_date)
    );
    
    if (filteredData.length > 0) {
        res.json(filteredData);
    } else {
        res.json({ message: "No data found", start_date, end_date });
    }
});

// Rota: PUT /circuits/{circuit_id}/sensor/{sensor_id}/update
app.put("/circuits/:circuit_id/sensor/:sensor_id/update", (req, res) => {
    const { circuit_id, sensor_id } = req.params;
    const { valor } = req.body; // O novo valor do sensor

    // Encontrar o sensor
    const sensor = devices.find(d => d.circuito_id === circuit_id && d.id == sensor_id && d.tipo !== "Atuador");

    if (!sensor) {
        return res.status(404).json({ message: "Sensor not found" });
    }

    // Atualizando o valor do sensor
    const lastRecord = sensor.registros[sensor.registros.length - 1];
    lastRecord.valor = valor; // Atualiza o valor do último registro
    
    // Adiciona um novo registro com o valor atualizado
    const timestamp = new Date().toISOString();
    sensor.registros.push({ timestamp, valor });

    res.json({ message: "Sensor value updated successfully", sensor });
});

app.post("/circuits/:circuit_id/actuator/:actuator_id/toggle", (req, res) => {
    const { circuit_id, actuator_id } = req.params;
    
    let actuator = devices.find(d => d.circuito_id === circuit_id && d.id == actuator_id && d.tipo === "Atuador");

    if (actuator) {
        // Alterna o valor do último registro (0 para 1 e vice-versa)
        let lastRegistro = actuator.registros[actuator.registros.length - 1];
        let novoValor = lastRegistro.valor === 1 ? 0 : 1;
        
        // Adiciona um novo registro com a alteração
        let novoRegistro = {
            timestamp: new Date().toISOString(),
            valor: novoValor
        };
        actuator.registros.push(novoRegistro);

        res.json({ msg: "Atuador alternado com sucesso!", actuator });
    } else {
        res.status(404).json({ error: "Atuador não encontrado" });
    }
});


// Inicializa os dispositivos ao iniciar o servidor
app.listen(port, () => {
    generateDevices();
    console.log(`Servidor rodando em http://localhost:${port}`);
});
