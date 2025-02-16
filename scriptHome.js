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

        // Salva os valores no localStorage, organizando por sensor ID
        let sensorData = JSON.parse(localStorage.getItem("sensorData")) || [];
        sensorData.push({ id: deviceId, time: new Date().toLocaleTimeString(), value: updatedData.valor });

        if (sensorData.length > 50) { // Limita o histórico de valores para evitar sobrecarga
            sensorData.shift();
        }

        localStorage.setItem("sensorData", JSON.stringify(sensorData));

        // Atualiza a interface de usuário na página home
        const deviceItem = document.getElementById(`device-${deviceId}`);
        if (deviceItem) {
            const deviceInfo = deviceItem.querySelector("span");
            deviceInfo.textContent = `ID: ${deviceId} | Valor: ${updatedData.valor}`;
        }

        // Redireciona para graphs.html
        //window.location.href = "graphs.html";

    } catch (error) {
        console.error(`Erro ao atualizar dispositivo ${deviceId}:`, error);
    }
}




// Função para iniciar a coleta automática de dados
function startAutomaticDataCollection(sensors) {
    sensors.forEach(sensor => {
        setInterval(async () => {
            await updateDevice(sensor.id);
        }, 300000); // Coleta dados a cada 5 minutos
    });
}

// Função para visualizar gráficos
document.getElementById('viewGraphs').addEventListener('click', () => {
    window.location.href = "graphs.html"; // Redireciona para a página de gráficos
});


async function toggleDeviceStatus(deviceId) {
    try {
        await fetch(`http://localhost:3000/sensor/toggle/${deviceId}`, { method: 'POST' });
        await fetchAndDisplayDevices();
    } catch (error) {
        console.error(`Erro ao alternar status do dispositivo ${deviceId}:`, error);
    }
}

window.onload = async () => {
    await fetchAndDisplayDevices();
};


// Simula o clique no botão "Carregar Sensores" ao carregar a página
/*window.onload = () => {
    document.getElementById('loadSensors').click();
};*/
