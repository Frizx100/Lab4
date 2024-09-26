const socket = new WebSocket('ws://localhost:4001');
var points = new Map();

function millisToSeconds(millis) {
    var seconds = (millis / 1000);
    return seconds;
}

function updatetPointLocation(id, data) {
    points.set(id, { lastUpdate: Date.now(), data: data });
    var result = { x: [], y: [],r: [], mode: [], color: [], size:[] };
    
    for (var pointData of points.entries()) {
        if (Date.now() - pointData[1].lastUpdate >= 5000) {
            points.delete(pointData[0]);
            continue;
        }
        result.x.push(pointData[1].data.x);
        result.y.push(pointData[1].data.y);
        var rad = millisToSeconds(pointData[1].data.receivedAt-pointData[1].data.sentAt)*300000
        result.r.push(rad);
        result.mode.push("markers")
        result.color.push('red')
        result.size.push(20)
    
    }
    if (result.x.length>=3){
        var a = 2*(result.x[1]-result.x[0])
        var b = 2*(result.y[1]-result.y[0])
        var c = result.r[0]**2-result.r[1]**2 - result.x[0]**2+result.x[1]**2 - result.y[0]**2+result.y[1]**2
        var d = 2*(result.x[2]-result.x[1])
        var e = 2*(result.y[2]-result.y[1])
        var f = result.r[1]**2-result.r[2]**2 - result.x[1]**2+result.x[2]**2 - result.y[1]**2+result.y[2]**2
        var x = (c*e-f*b)/(e*a-b*d)
        var y = (c*d-a*f)/(b*d-a*e)
        result.x.push(x);
        result.y.push(y);
        result.r.push(0);
        result.mode.push("markers")
        result.color.push('blue')
        result.size.push(20)
    }
    Plotly.update('graph', { x: [result.x], y: [result.y], mode:[result.mode], marker:{color:result.color, size:result.size} }, {});
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