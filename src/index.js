'use strict';
require("dotenv").config();

// Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const homeRouter = require('./routers/homeRouter');
const webhookRouter = require('./routers/webhookRouter');
const messageRouter = require('./routers/messageRouter');

const viewer = require('./utils/viewer');

// Constants
const PORT = process.env.PORT || 8080;
const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('', homeRouter);
app.use('/webhook', webhookRouter);
app.use('/messages', messageRouter);

// Views
viewer(app);

// Initiate database and listen
app.listen(PORT);
console.log(`Running on port: ${PORT}`);

