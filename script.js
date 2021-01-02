const WebSocketClient = require('websocket').client;
const fs = require('fs');
const cron = require('node-cron');

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
let socketUrl = `wss://a${'nt'}.${'ali'}cebl${'ueonl'}${'ine.c'}om/hyd${'rasoc'}ket/${'v2/'}web${'sock'}et`
Object.keys(stocks).forEach((stock) => {
    query.push([1, parseInt(stock)]);
});
function bufferToArrayBuffer(buf) {
    let arrayBuffer = new ArrayBuffer(buf.length);
    let view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return arrayBuffer;
}

function connectSocket() {
    let client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('connectFailed', error)
        connectSocket();
    });
    client.on('connect', function (connection) {
        connection.on('error', function (error) {
            client.abort();
            console.log('connect error', error)
            connectSocket();
        });
        connection.on('close', function () {
            console.log('connect close', error)
            let time = new Date();
            let currentOffset = time.getTimezoneOffset();
            let ISTOffset = 330;
            time = new Date(time.getTime() + (ISTOffset + currentOffset) * 60000);
            // if (time.getHours() > 8 && time.getHours() < 16) {
            //     client.abort();
            //     connectSocket();
            // }
        });
        connection.on('message', function (message) {
            let time = new Date();
            let currentOffset = time.getTimezoneOffset();
            let ISTOffset = 330;
            time = new Date(time.getTime() + (ISTOffset + currentOffset) * 60000);
            let dir = `mkt/${time.toISOString().split('T')[0]}`;
            // if (time.getHours() > 8 && time.getHours() < 16) {
            let ed = new DataView(bufferToArrayBuffer(message.binaryData));
            let IT = ed.getUint32(2);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            let path = `${dir}\/${stocks[IT]}-${IT}.txt`
            fs.appendFile(path, `${time.getTime()}@-->` + message.binaryData.toString('base64') + '\n', function (err) {
                if (err) {
                    console.log('File append error', err)
                }
            })
            // } else {
            //     connection.close();
            //     client.abort();
            // }

        });

        function sendHeartBeat() {
            if (connection.connected) {
                connection.send(JSON.stringify({ "a": "h", "v": [], "m": "" }));
            } else {
                console.log('socket not connected restarting...')
                connection.close();
                connectSocket();
            }
        }
        connection.send(JSON.stringify({ "a": "subscribe", "v": query, "m": "marketdata" }));
        setInterval(sendHeartBeat, 9000)
    });
    client.connect(socketUrl);
}
cron.schedule('0 0 9 * * 1,2,3,4,5', () => {
    console.log("+++++++++++++connecting")
    connectSocket();
});
