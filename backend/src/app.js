const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');
const requestRoutes = require('./routes/request.route');
const statsRoutes = require('./routes/stats.route.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/stats', statsRoutes);

module.exports = app;
