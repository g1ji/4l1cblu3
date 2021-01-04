const WebSocketClient = require('websocket').client;
const fs = require('fs');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
let socketUrl = `wss://a${'nt'}.${'ali'}cebl${'ueonl'}${'ine.c'}om/hyd${'rasoc'}ket/${'v2/'}web${'sock'}et`;
let dbURL = `${'mong'}od${'b+sr'}v://g1${'ji:5ff37a'}efea99c55b4f4d8f5${'5@clu'}ster0.e0${'t4r.mo'}ngo${'db.n'}et/mkt`;
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
    mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => {
        let collections = {};
        Object.keys(stocks).forEach((stock) => {
            query.push([1, parseInt(stock)]);
            collections[stock] = mongoose.model(`${stock}_${stocks[stock]}`, new Schema({}, { strict: false, collection: `${stock}_${stocks[stock]}` }));
        });

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
                if (time.getHours() > 8 && time.getHours() < 16) {
                    client.abort();
                    connectSocket();
                }
            });
            connection.on('message', function (message) {
                let time = new Date();
                let currentOffset = time.getTimezoneOffset();
                let ISTOffset = 330;
                time = new Date(time.getTime() + (ISTOffset + currentOffset) * 60000);
                let today = `${time.toISOString().split('T')[0]}`;
                if (time.getHours() > 7 && time.getHours() < 16) {
                    let ed = new DataView(bufferToArrayBuffer(message.binaryData));
                    let IT = ed.getUint32(2);
                    collections[IT].findOneAndUpdate({
                        "IT": IT,
                        "SYMBOL": stocks[IT],
                        "DATE": today
                    }, {
                        $set: {
                            ['data.' + time.getTime()]: message.binaryData.toString('base64')
                        }
                    }, { upsert: true }, function (err, doc) {
                        console.log("err, doc", err, doc)
                    })
                } else {
                    connection.close();
                    client.abort();
                }
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
    })
}
// cron.schedule('0 30 3 * * 1,2,3,4,5', () => {
//     console.log("+++++++++++++connecting")
//     connectSocket();
// });
// connectSocket();