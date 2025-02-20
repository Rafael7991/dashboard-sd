# dashboard  
## Proposta 1: 
### Dashboard com ID's modularizados.  
Padrão:  
ABC001  
A : Circuito  
B : 0 = Atuador, 1 = Sensor;  
C : 0 = Atuador, 1 = Temperatura, 2 = Umidade etc.  
001 a 999: Individualização.  

O comportamento do middleware está sendo simulado por server.js presente na pasta mock-api  

para simular o middleware:    
**node server.js**

### para alterar dados do sensor:  
(exemplo para sensor 212001 tendo valor alterado para 55.5)  

Invoke-RestMethod -Uri "http://localhost:3000/sensor/212001" -Method Patch -Headers @{"Content-Type"="application/json"} -Body '{"valor": 55.5}'  

## Rotas

Todos os devices (atuadores E sensores) devem ser alocados em:  
http://localhost:3000/sensores  

Dados individuais de cada device:  
http://localhost:3000/sensor/{deviceId}  

Alterar valor do atuador:  
http://localhost:3000/sensor/toggle/{deviceId}  

Histórico de dados dos sensores:  
http://localhost:3000/sensores/dados?id={sensorId}&from={from}&to={to}  

## Proposta 2:  
### ID's separados por circuitos

para simular o middleware executar:  
**node server2.js**

### para alterar dados do sensor:  
(exemplo para sensor de id 3 do circuito 1 tendo valor alterado para 50)  

Invoke-WebRequest -Uri http://localhost:5001/circuits/1/sensor/3/update -Method PUT -Headers @{"Content-Type"="application/json"} -Body '{"valor": 50.0}'  

## Rotas  

Lista de circuitos:  
http://localhost:5001/circuits  

Listar dispositivos de cada circuito:  
http://localhost:5001/circuits/{circuit_id}/devices  

Último valor do sensor:  
http://localhost:5001/circuits/{circuit_id}/sensor/{sensor_id}/last  

Último valor do atuador:  
http://localhost:5001/circuits/{circuit_id}/actuator/{actuator_id}/last  

Alterar valor do atuador:  
http://localhost:5001/circuits/{circuitId}/actuator/{actuatorId}/toggle  

Histórico de dados do sensor:  
http://localhost:5001/circuits/{circuit_id}/sensor/{sensor_id}/all?start_date={start_date}&end_date={end_date}  




