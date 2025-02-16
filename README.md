# dashboard
Proposta de Dashboard com ID's modularizados.
Padrão:
ABC001
A : Circuito
B : 0 = Atuador, 1 = Sensor; 
C : 0 = Atuador, 1 = Temperatura, 2 = Umidade etc.
001 a 999: Individualização.

para simular o middleware:
dentro da pasta mock-api executar
node server.js

para alterar dados do sensor:
(exemplo para sensor 212001 tendo valor alterado para 55.5)

Invoke-RestMethod -Uri "http://localhost:3000/sensor/212001" -Method Patch -Headers @{"Content-Type"="application/json"} -Body '{"valor": 55.5}'
