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


//Keycloak
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const memoryStore = new session.MemoryStore();
const axios = require('axios');
const User = require('./Models/User');


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


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));
app.use(keycloak.middleware());


// GitHub authentication callback
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;
  try {
    const response = await axios.post(`${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        code,
        redirect_uri: 'http://localhost:5173'
      }
    });
    const { access_token } = response.data;

    // Decode the token to get user information
    const userInfoResponse = await axios.get(`${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const { sub, email, preferred_username } = userInfoResponse.data;
    console.log(sub, email, preferred_username);

    // Check if user already exists
    let user = await User.findOne({ githubId: sub });
    if (!user) {
      user = new User({
        username: preferred_username,
        email,
        githubId: sub,
        password: '' 
      });
      console.log(user);
      await User.save();
    }

    const token = user.generateAuthToken();
    res.json({ token, user: { _id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

connectToMongoDB();
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});;