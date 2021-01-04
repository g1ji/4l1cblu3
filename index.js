var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    require('./app');
    require('./script');
}
// Ly8gaHR0cHM6Ly9nMWppLXdlYmhvb2suaGVyb2t1YXBwLmNvbS8gfCBodHRwczovL2dpdC5oZXJva3UuY29tL2cxamktd2ViaG9vay5naXQKLy8gZ2l0IHB1c2ggaGVyb2t1Ci8vIGhlcm9rdSBsb2dzIC0tdGFpbA==
// https://g1ji-webhook.herokuapp.com/ | https://git.heroku.com/g1ji-webhook.git
// git push heroku
// heroku logs --tail














