// Função para carregar sensores
document.getElementById('loadSensors').addEventListener('click', async () => {
    await fetchAndDisplayDevices();
});

document.getElementById('filterDevices').addEventListener('click', async () => {
    await fetchAndDisplayDevices();
});

function getUnitForType(tipo) {
    switch (tipo) {
        case "Temperatura":
            return "°C";
        case "Humidade":
            return "g/m³";
        case "Pressao":
            return "mmHg";
        default:
            return ""; // Atuadores não possuem unidade específica
    }
}

async function fetchAndDisplayDevices() {
    try {
        const circuitIds = ["1", "2", "3"];
        const sensorList = document.getElementById('sensorList');
        const filterCircuit = document.getElementById('deviceFilterCircuit').value;
        const filterType = document.getElementById('deviceTypeFilter').value;

        sensorList.innerHTML = '';

        for (const circuitId of circuitIds) {
            if (filterCircuit !== "all" && filterCircuit !== `circuit${circuitId}`) {
                continue; // Filtra por circuito
            }

            const response = await fetch(`http://localhost:5001/circuits/${circuitId}/devices`);
            const devices = await response.json();

            devices.forEach(device => {
                const isSensor = device.tipo !== "Atuador"; // Se não for Atuador, é Sensor

                // Aplicando filtro de tipo (sensor ou atuador)
                if ((filterType === "sensors" && !isSensor) || (filterType === "actuators" && isSensor)) {
                    return;
                }

                const lastRecord = device.registros[device.registros.length - 1]; // Pega o último registro
                const unidade = getUnitForType(device.tipo); // Obtém a unidade correspondente

                const deviceItem = document.createElement('div');
                deviceItem.className = "bg-white p-4 rounded shadow mb-2 flex justify-between items-center";
                deviceItem.id = `device-${device.id}`;

                const deviceInfo = document.createElement('span');
                deviceInfo.textContent = `Circuito: ${device.circuito_id} | ID: ${device.id} | Tipo: ${device.tipo} | Valor Atual: ${lastRecord.valor} ${unidade}`;

                deviceItem.appendChild(deviceInfo);

                if (isSensor) {
                    const updateButton = document.createElement('button');
                    updateButton.className = "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded ml-auto";
                    updateButton.textContent = "Atualizar";
                    updateButton.onclick = async () => await updateDevice(device.id, device.circuito_id);
                    deviceItem.appendChild(updateButton);
                }

                if (!isSensor) {
                    const toggleButton = document.createElement('button');
                    toggleButton.className = "bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded ml-2";
                    toggleButton.textContent = "Alternar Status";
                    toggleButton.onclick = async () => await toggleDeviceStatus( device.circuito_id, device.id);
                    deviceItem.appendChild(toggleButton);
                }

                sensorList.appendChild(deviceItem);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar dispositivos:', error);
    }
}

// Função para coletar dados do sensor
async function updateDevice(deviceId, circuitId) {
    try {
        const response = await fetch(`http://localhost:5001/circuits/${circuitId}/sensor/${deviceId}/last`);
        const updatedData = await response.json();

        // Verifica se há registros disponíveis
        if (!updatedData.registros || updatedData.registros.length === 0) {
            console.warn(`Nenhum registro encontrado para o dispositivo ${deviceId} no circuito ${circuitId}`);
            return;
        }

        const lastRecord = updatedData.registros[0]; // Obtém o último registro
        const unidade = getUnitForType(updatedData.tipo); // Obtém a unidade correspondente

        // Atualiza a interface de usuário na página home
        const deviceItem = document.getElementById(`device-${deviceId}`);
        if (deviceItem) {
            const deviceInfo = deviceItem.querySelector("span");
            deviceInfo.textContent = `Circuito: ${updatedData.circuito_id} | ID: ${updatedData.id} | Tipo: ${updatedData.tipo} | Valor Atual: ${lastRecord.valor} ${unidade}`;
        }

    } catch (error) {
        console.error(`Erro ao atualizar dispositivo ${deviceId} no circuito ${circuitId}:`, error);
    }
}

// Função para iniciar a coleta automática de dados
function startAutomaticDataCollection(sensors) {
    sensors.forEach(sensor => {
        setInterval(async () => {
            await updateDevice(sensor.id);
        }, 300000); // Coleta dados a cada x minutos
    });
}

// Função para visualizar gráficos
document.getElementById('viewGraphs').addEventListener('click', () => {
    window.location.href = "graphs2.html"; 
});

async function toggleDeviceStatus(circuitId, actuatorId) {
    try {
        // Envia a requisição para alternar o status do atuador
        const response = await fetch(`http://localhost:5001/circuits/${circuitId}/actuator/${actuatorId}/toggle`, { 
            method: 'POST' 
        });
        const updatedData = await response.json();

        if (response.ok) {
            const deviceItem = document.getElementById(`device-${actuatorId}`);
            if (deviceItem) {
                const deviceInfo = deviceItem.querySelector("span");

                // Verifica se os dados estão dentro de updatedData.actuator
                if (updatedData.actuator) {
                    const lastRegistro = updatedData.actuator.registros?.[updatedData.actuator.registros.length - 1];

                    deviceInfo.textContent = `Circuito: ${updatedData.actuator.circuito_id} | ID: ${updatedData.actuator.id} | Tipo: ${updatedData.actuator.tipo} | Valor Atual: ${lastRegistro?.valor}`;
                } else {
                    console.error("Erro: Estrutura de resposta inesperada", updatedData);
                }
            }
        } else {
            console.error('Erro ao alternar status:', updatedData.error);
        }

    } catch (error) {
        console.error(`Erro ao alternar status do dispositivo ${actuatorId}:`, error);
    }
}



window.onload = async () => {
    await fetchAndDisplayDevices();
};