var WebSocketClient = require('websocket').client;
const fs = require('fs');

let stocks = {
    3045: "SBIN",
    15034: "BAJAJELEC",
    9348: "IOB",
    11630: "NTPC",
    3456: "TATAMOTORS",
    1660: "ITC",
    1270: "AMBUJACEM",
    11483: "LT",
    2475: "ONGC",
    1624: "IOC"
};
let query = [];
let collections = {};
Object.keys(stocks).forEach((stock) => {
    query.push([1, parseInt(stock)]);
});
var socketUrl = `wss://a${'nt'}.${'ali'}cebl${'ueonl'}${'ine.c'}om/hyd${'rasoc'}ket/${'v2/'}web${'sock'}et`
function bufferToArrayBuffer(buf) {
    var arrayBuffer = new ArrayBuffer(buf.length);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return arrayBuffer;
}

function connectSocket() {
    var client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        connectSocket();
    });
    client.on('connect', function (connection) {
        connection.on('error', function (error) {
            client.abort();
            connectSocket();
        });
        connection.on('close', function () {
            client.abort();
            connectSocket();
        });
        connection.on('message', function (message) {
            let time = new Date();
            var currentOffset = time.getTimezoneOffset();
            var ISTOffset = 330;
            time = new Date(time.getTime() + (ISTOffset + currentOffset) * 60000);

            // if (time.getHours() > 8 && time.getHours() < 17) {
                var ed = new DataView(bufferToArrayBuffer(message.binaryData));
                let IT = ed.getUint32(2);
                let path = `mkt\/${time.toISOString().split('T')[0]}-${stocks[IT]}-${IT}`

                fs.appendFile(path, message.binaryData.toString('base64') + '#\n', function (err) {
                    if (err) throw err;
                })
                // console.log('getting data ... ');
            // }
        });

        function sendHeartBeat() {
            if (connection.connected) {
                connection.send(JSON.stringify({ "a": "h", "v": [], "m": "" }));
            } else {
                connection.close();
                connectSocket();
            }
        }
        connection.send(JSON.stringify({ "a": "subscribe", "v": query, "m": "marketdata" }));
        setInterval(sendHeartBeat, 9000)
    });

    client.connect(socketUrl);
}
connectSocket();
