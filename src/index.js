'use strict';
require("dotenv").config();

// Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Constants
const PORT = process.env.PORT || 8080;
const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Normal connection
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Initiate database and listen
app.listen(PORT);
console.log(`Running on port: ${PORT}`);

