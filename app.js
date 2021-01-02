const cool = require('cool-ascii-faces');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const serveIndex = require('serve-index');

app.use(express.static(__dirname + "/"))
app.use('/mkt', serveIndex(__dirname + '/mkt', {'icons': true}));

app.get('/', (req, res) => res.send(cool()));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));