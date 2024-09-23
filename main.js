//const socket = new WebSocket('ws://localhost:4001');

// Обробка отриманих даних через WebSocket
//socket.onmessage = function (event) {
   // const data = JSON.parse(event.data);
    //updateGraph(data);
//};
const socket = new WebSocket('ws://localhost:4001');
var points = new Map();

function updatetPointLocation(id, data) {
    points.set(id, { lastUpdate: Date.now(), data: data });
    var result = { x: [], y: [] };
    for (var pointData of points.entries()) {
        if (Date.now() - pointData[1].lastUpdate >= 5000) {
            points.delete(pointData[0]);
            continue;
        }
        result.x.push(pointData[1].data.x);
        result.y.push(pointData[1].data.y);
    }
    Plotly.update('graph', { x: [result.x], y: [result.y] }, {});
    console.log(result)
}

socket.onopen = () => {
    Plotly.newPlot('graph', [{ type: 'scatter', mote: 'markers', line: { width: 0 }, marker: { color: 'red', size: 20 }, x: [], y: [] }], {
        xaxis: { title: 'X координата', range: [-100, 100] },
        yaxis: { title: 'Y координата', range: [-100, 100] }
    });
    console.log('Підключено до WebSocket сервера');
};
socket.onmessage = (event) => {
    console.log('Отримані дані:', event.data);
    const data = JSON.parse(event.data);
    updatetPointLocation(data.id, data);
};
socket.onclose = () => {
    console.log('З\'єднання закрито');
};
socket.onerror = (error) => {
    console.error('Помилка WebSocket:', error);
};