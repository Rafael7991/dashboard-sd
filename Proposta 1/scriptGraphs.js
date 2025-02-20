document.addEventListener("DOMContentLoaded", async () => {
    const sensorSelect = document.getElementById("sensorSelect");
    const startDatePicker = document.getElementById("startDatePicker");
    const endDatePicker = document.getElementById("endDatePicker");
    const loadGraphButton = document.getElementById("loadGraph");
    const chartsContainer = document.getElementById("chartsContainer");
    const homeButton = document.getElementById("homeButton");
    const resetButton = document.getElementById("resetButton");

    // Função para buscar os sensores do middleware
    async function fetchSensors() {
        try {
            const response = await fetch("http://localhost:3000/sensores");
            if (!response.ok) throw new Error("Erro ao buscar sensores");

            const { devices } = await response.json();
            return devices.filter(device => device.id[1] === '1'); // Apenas sensores (id[1] == 1)
        } catch (error) {
            console.error("Erro ao buscar sensores:", error);
            return [];
        }
    }

    // Função para popular o seletor de sensores
    async function populateSensorSelect() {
        const sensors = await fetchSensors();

        if (sensors.length === 0) {
            alert("Nenhum sensor disponível!");
            return;
        }

        sensors.forEach(sensor => {
            const option = document.createElement("option");
            option.value = sensor.id;
            option.textContent = `Sensor ${sensor.id}`;
            sensorSelect.appendChild(option);
        });
    }

    // Função para buscar os dados do sensor (histórico)
    async function fetchSensorData(sensorId, from, to) {
        try {
            const response = await fetch(`http://localhost:3000/sensores/dados?id=${sensorId}&from=${from}&to=${to}`);
            if (!response.ok) throw new Error("Erro ao buscar dados do sensor");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar histórico do sensor:", error);
            return [];
        }
    }

    // Função para criar o gráfico do sensor
    async function loadGraph(sensorId, from, to) {
        chartsContainer.innerHTML = ""; // Limpa gráficos antigos

        const sensorData = await fetchSensorData(sensorId, from, to);

        if (sensorData.length === 0) {
            alert("Nenhum dado encontrado para esse período!");
            return;
        }

        // Criando o contêiner do gráfico
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-lg shadow-md";

        const title = document.createElement("h2");
        title.className = "text-xl font-semibold text-gray-700 text-center mb-2";
        title.textContent = `Sensor ${sensorId}`;

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
        const chartData = {
            labels: sensorData.map(entry => entry.time), // Eixo X: timestamp
            datasets: [{
                label: "Leitura do Sensor",
                data: sensorData.map(entry => entry.value), // Eixo Y: valor do sensor
                borderColor: "blue",
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                fill: true
            }]
        };

        new Chart(ctx, {
            type: "line",
            data: chartData,
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
    }

     // Função para voltar para home.html
        homeButton.addEventListener("click", () => {
        window.location.href = "home.html"; // Redireciona para a página home.html
    });

    // Função para resetar tudo
    resetButton.addEventListener("click", () => {
        sensorSelect.value = ""; // Limpa o seletor de sensores
        startDatePicker.value = ""; // Limpa a data de início
        endDatePicker.value = ""; // Limpa a data de fim
        chartsContainer.innerHTML = ""; // Limpa os gráficos
    });

    // Carregar o gráfico quando o botão for clicado
    loadGraphButton.addEventListener("click", async () => {
        const sensorId = sensorSelect.value;
        const from = startDatePicker.value.replace("T", " ");
        const to = endDatePicker.value.replace("T", " ");

        if (!sensorId || !from || !to) {
            alert("Selecione um sensor e um intervalo de datas!");
            return;
        }

        await loadGraph(sensorId, from, to);
    });

    // Popula os sensores no carregamento da página
    await populateSensorSelect();
});