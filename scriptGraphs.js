function clearGraphData() {
    if (confirm("Tem certeza que deseja apagar os dados dos gráficos?")) {
        localStorage.removeItem("sensorData");
        alert("Dados apagados!");
        window.location.reload();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const chartsContainer = document.getElementById("chartsContainer");
    let sensorData = JSON.parse(localStorage.getItem("sensorData")) || [];

    let groupedData = {};
    sensorData.forEach(entry => {
        if (!groupedData[entry.id]) {
            groupedData[entry.id] = [];
        }
        groupedData[entry.id].push({ time: entry.time, value: entry.value });
    });

    Object.keys(groupedData).forEach(sensorId => {
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-lg shadow-md w-96";

        const title = document.createElement("h2");
        title.className = "text-xl font-semibold text-gray-700 text-center mb-2";
        title.textContent = `Sensor ${sensorId}`;

        const canvasContainer = document.createElement("div");
        canvasContainer.className = "relative w-full h-64";

        const canvas = document.createElement("canvas");
        canvas.id = `chart-${sensorId}`;
        canvas.className = "w-full h-full";

        canvasContainer.appendChild(canvas);
        card.appendChild(title);
        card.appendChild(canvasContainer);
        chartsContainer.appendChild(card);

        const ctx = canvas.getContext("2d");
        const chartData = {
            labels: groupedData[sensorId].map(entry => entry.time),
            datasets: [{
                data: groupedData[sensorId].map(entry => entry.value),
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
    });
});