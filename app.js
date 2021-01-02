const Express = require('express');
const app = Express();
var serveIndex = require('serve-index');

app.use(Express.static(__dirname + "/"))
app.use('/mkt', serveIndex(__dirname + '/mkt', {'icons': true}));


app.listen(3000, function () {
    console.log(`==> ${new Date()} Server is running at http://localhost:${3000}/`);
});