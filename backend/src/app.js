const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/request.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/requests', requestRoutes);

module.exports = app;
