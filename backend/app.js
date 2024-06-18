const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');

const appRoutes = require('./Routes/appRoutes');
const userRoutes = require('./Routes/userRoutes');


const app = express();
require('dotenv').config();
const connectToMongoDB = require('./config.js');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true  
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/apps', appRoutes);
app.use('/users', userRoutes);

connectToMongoDB();
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});;
