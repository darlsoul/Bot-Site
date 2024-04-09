const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
const __path = process.cwd();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__path, 'public')));

let qrCode = require('./qr.js');
app.use('/qr-code', qrCode);

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, '/public/qr.html'));
});

let updateSession = require('./updateSession.js');
app.use('/sid', updateSession);

app.get('/update-session', (req, res) => {
    res.sendFile(path.join(__path, '/public/updateSession.html'));
});

let pair = require('./pair.js');
app.use('/code', pair);

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, '/public/pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, '/public/index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});

module.exports = app;
