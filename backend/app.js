const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./Routes/appRoutes');
const userRoutes = require('./Routes/userRoutes');

const app = express();
require('dotenv').config();
const connectToMongoDB = require('./config.js');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/apps', appRoutes);
app.use('/users', userRoutes);

connectToMongoDB();
app.listen(port, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});;
