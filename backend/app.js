const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

require('dotenv').config();
const connectToMongoDB = require('./config.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://dhbw-appstore.com',  
  credentials: true  
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const appRoutes = require('./Routes/appRoutes');
const userRoutes = require('./Routes/userRoutes');
const authRoutes = require('./Routes/authRoutes');
app.use('/api/apps', appRoutes);
app.use('/api/users', userRoutes);

// Keycloak Configuration
const memoryStore = new session.MemoryStore();
const keycloakConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  bearerOnly: true,
  serverUrl: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET
  }
};
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

// Session and Keycloak Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: memoryStore}));
app.use(keycloak.middleware());

// GitHub Authentication Callback
app.use('/api/auth', authRoutes);

connectToMongoDB();
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
