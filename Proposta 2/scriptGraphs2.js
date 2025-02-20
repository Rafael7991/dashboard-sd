document.addEventListener("DOMContentLoaded", async () => {
    const circuitSelect = document.createElement("select");
    circuitSelect.id = "circuitSelect";
    circuitSelect.className = "border p-2 rounded";
    
    const sensorSelect = document.getElementById("sensorSelect");
    const loadGraphButton = document.getElementById("loadGraph");
    const chartsContainer = document.getElementById("chartsContainer");

    // Adiciona a seleção de circuito no HTML antes do seletor de sensores
    const sensorContainer = sensorSelect.parentElement;
    sensorContainer.insertBefore(circuitSelect, sensorSelect);

    // Função para buscar os circuitos disponíveis
    async function fetchCircuits() {
        try {
            const response = await fetch("http://localhost:5001/circuits");
            if (!response.ok) throw new Error("Erro ao buscar circuitos");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar circuitos:", error);
            return [];
        }
    }

    // Popula a seleção de circuitos
    async function populateCircuitSelect() {
        const circuits = await fetchCircuits();
        circuitSelect.innerHTML = "<option value=''>Selecione um circuito</option>";

        circuits.forEach(circuit => {
            const option = document.createElement("option");
            option.value = circuit;
            option.textContent = `Circuito ${circuit}`;
            circuitSelect.appendChild(option);
        });
    }

    // Função para buscar os sensores de um circuito
    async function fetchSensors(circuitId) {
        try {
            const response = await fetch(`http://localhost:5001/circuits/${circuitId}/devices`);
            if (!response.ok) throw new Error("Erro ao buscar dispositivos");

            const devices = await response.json();
            return devices.filter(device => device.tipo !== "Atuador"); // Apenas sensores
        } catch (error) {
            console.error("Erro ao buscar sensores:", error);
            return [];
        }
    }

    // Popula a seleção de sensores ao escolher um circuito
    async function populateSensorSelect(circuitId) {
        sensorSelect.innerHTML = "<option value=''>Selecione um sensor</option>";

        if (!circuitId) return; // Se nenhum circuito for selecionado, não carrega sensores

        const sensors = await fetchSensors(circuitId);
        if (sensors.length === 0) {
            alert("Nenhum sensor disponível nesse circuito!");
            return;
        }

        sensors.forEach(sensor => {
            const option = document.createElement("option");
            option.value = sensor.id;
            option.textContent = `${sensor.tipo} (ID ${sensor.id})`;
            sensorSelect.appendChild(option);
        });
    }

    // Função para carregar o gráfico do sensor selecionado
    async function loadGraph(circuitId, sensorId) {
        chartsContainer.innerHTML = ""; // Limpa gráficos antigos
        
        try {
            const response = await fetch(`http://localhost:5001/circuits/${circuitId}/devices`);
            if (!response.ok) throw new Error("Erro ao buscar dados");

            const devices = await response.json();
            const sensor = devices.find(device => device.id == sensorId && device.tipo !== "Atuador");

            if (!sensor || !sensor.registros || sensor.registros.length === 0) {
                alert("Nenhum dado encontrado para esse sensor!");
                return;
            }

            // Criando o contêiner do gráfico
            const card = document.createElement("div");
            card.className = "bg-white p-4 rounded-lg shadow-md";

            const title = document.createElement("h2");
            title.className = "text-xl font-semibold text-gray-700 text-center mb-2";
            title.textContent = `${sensor.tipo} (ID ${sensor.id})`;

            const canvasContainer = document.createElement("div");
            canvasContainer.className = "relative chart-container";

            const canvas = document.createElement("canvas");
            canvas.id = `chart-${sensorId}`;
            canvas.className = "w-full h-full";

            canvasContainer.appendChild(canvas);
            card.appendChild(title);
            card.appendChild(canvasContainer);
            chartsContainer.appendChild(card);

            // Preparando os dados do gráfico
            const ctx = canvas.getContext("2d");
            const timestamps = sensor.registros.map(entry => new Date(entry.timestamp).toLocaleString());
            const values = sensor.registros.map(entry => entry.valor);

            new Chart(ctx, {
                type: "line",
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: `${sensor.tipo} (ID ${sensor.id})`,
                        data: values,
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
                
            });
        

        } catch (error) {
            console.error("Erro ao carregar gráfico:", error);
        }
    }

    // Atualiza os sensores quando um circuito é selecionado
    circuitSelect.addEventListener("change", async (event) => {
        await populateSensorSelect(event.target.value);

        
    });

    // Carregar o gráfico quando o botão for clicado
    loadGraphButton.addEventListener("click", async () => {
        const circuitId = circuitSelect.value;
        const sensorId = sensorSelect.value;

        if (!circuitId || !sensorId) {
            alert("Selecione um circuito e um sensor!");
            return;
        }

        await loadGraph(circuitId, sensorId);


        homeButton.addEventListener("click", () => {
            window.location.href = "home2.html";
        });

        resetButton.addEventListener("click", () => {
            circuitSelect.value = ""; // Reseta a seleção de circuito
            sensorSelect.innerHTML = "<option value=''>Selecione um sensor</option>"; // Limpa sensores
            chartsContainer.innerHTML = ""; // Remove gráficos
        });
    });

    // Popula os circuitos ao carregar a página
    await populateCircuitSelect();
});
