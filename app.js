const cool = require('cool-ascii-faces');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const serveIndex = require('serve-index');
const BodyParser = require('body-parser');
const fs = require('fs-extra')


app.use(BodyParser.json({ limit: '50kb' }));
app.use(BodyParser.urlencoded({ limit: '50kb', extended: true }));


app.use(express.static(__dirname + "/"))
app.use('/mkt', serveIndex(__dirname + '/mkt', { 'icons': true }));

app.get('/delete-mkt/:path', (req, res) => {
    req.params.path = './mkt/' + req.params.path.replace('@', '/');
    fs.emptyDirSync(req.params.path);
    fs.rmdirSync(req.params.path);
    res.send(`${req.params.path} is deleted!`);
});


app.get('/', (req, res) => res.send(cool()));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
