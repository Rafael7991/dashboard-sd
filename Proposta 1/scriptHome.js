// Função para carregar sensores
document.getElementById('loadSensors').addEventListener('click', async () => {
    await fetchAndDisplayDevices();
});

document.getElementById('filterDevices').addEventListener('click', async () => {
    await fetchAndDisplayDevices();
});

async function fetchAndDisplayDevices() {
    try {
        const response = await fetch('http://localhost:3000/sensores');
        const data = await response.json();
        const sensorList = document.getElementById('sensorList');
        const filterType = document.getElementById('deviceFilter').value;
        
        sensorList.innerHTML = '';
        data.devices.forEach(device => {
            const secondDigit = device.id[1]; 


            const isSensor = secondDigit === '1'; // Se o segundo dígito for '1', é um sensor
            const isActuator = secondDigit === '0'; // Se o segundo dígito for '0', é um atuador

            
            if ((filterType === 'sensors' && !isSensor) || (filterType === 'actuators' && !isActuator)) {
                return;
            }
            
            const deviceItem = document.createElement('div');
            deviceItem.className = "bg-white p-4 rounded shadow mb-2 flex justify-between items-center";
            deviceItem.id = `device-${device.id}`;

            const deviceInfo = document.createElement('span');
            deviceInfo.textContent = `ID: ${device.id} | Valor: ${device.valor} `;

            deviceItem.appendChild(deviceInfo);
            
            if (isSensor) {
                const updateButton = document.createElement('button');
                updateButton.className = "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded ml-auto";
                updateButton.textContent = "Atualizar";
                updateButton.onclick = async () => await updateDevice(device.id);
                deviceItem.appendChild(updateButton);
            }
            
            if (isActuator) {
                const toggleButton = document.createElement('button');
                toggleButton.className = "bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded ml-2";
                toggleButton.textContent = "Alternar Status";
                toggleButton.onclick = async () => await toggleDeviceStatus(device.id);
                deviceItem.appendChild(toggleButton);
            }
            
            sensorList.appendChild(deviceItem);
        });
    } catch (error) {
        console.error('Erro ao carregar dispositivos:', error);
    }
}

// Função para coletar dados do sensor
async function updateDevice(deviceId) {
    try {
        const response = await fetch(`http://localhost:3000/sensor/${deviceId}`);
        const updatedData = await response.json();

        // Atualiza a interface de usuário na página home
        const deviceItem = document.getElementById(`device-${deviceId}`);
        if (deviceItem) {
            const deviceInfo = deviceItem.querySelector("span");
            deviceInfo.textContent = `ID: ${deviceId} | Valor: ${updatedData.valor}`;
        }

    } catch (error) {
        console.error(`Erro ao atualizar dispositivo ${deviceId}:`, error);
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
    window.location.href = "graphs.html"; 
});


async function toggleDeviceStatus(deviceId) {
    try {
        // Envia a requisição para alternar o status do atuador
        const response = await fetch(`http://localhost:3000/sensor/toggle/${deviceId}`, { method: 'POST' });
        const updatedData = await response.json();

        if (response.ok) {
            // Atualiza a interface de usuário diretamente após alternar o status
            const deviceItem = document.getElementById(`device-${deviceId}`);
            if (deviceItem) {
                const deviceInfo = deviceItem.querySelector("span");
                deviceInfo.textContent = `ID: ${deviceId} | Valor: ${updatedData.sensor.valor}`;
            }
        } else {
            console.error('Erro ao alternar status:', updatedData.error);
        }

    } catch (error) {
        console.error(`Erro ao alternar status do dispositivo ${deviceId}:`, error);
    }
}


window.onload = async () => {
    await fetchAndDisplayDevices();
};