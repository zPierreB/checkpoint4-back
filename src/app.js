require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const corsOptions = {
    origin: process.env.CLIENT_URL
};

app.use(cors(corsOptions));

const router = require('./routes/index.routes');

app.use('/api' ,router);

module.exports = app;