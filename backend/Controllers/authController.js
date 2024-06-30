const User = require('../Models/User');
const axios = require('axios');

const githubAuthCallback = async (req, res) => {
    console.log('Callback route hit');
    const code = req.body.code;
    console.log('Received code:', code);
  
    try {
      // Exchange GitHub code for Keycloak token
      const tokenResponse = await axios.post(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.KEYCLOAK_CLIENT_ID,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
          code: code,
          redirect_uri: 'http://localhost:5173/'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
  
      console.log('Token response:', tokenResponse.data);
  
      const { access_token } = tokenResponse.data;
  
      // Fetch user info using the access token
      const userInfoResponse = await axios.get(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${access_token}` }
        }
      );
  
      console.log('User info response:', userInfoResponse.data);
  
      const { sub, email, preferred_username } = userInfoResponse.data;
  
      // Check if user exists in your database
      let user = await User.findOne({ githubId: sub });
  
      // If user does not exist, create a new user
      if (!user) {
        user = new User({
          username: preferred_username,
          email,
          githubId: sub,
          password: '' // No password needed
        });
        await user.save();
      }
  
      // Generate JWT token and send response
      const token = user.generateAuthToken();
      res.json({ token, user: { _id: user._id, username: user.username } });
    } catch (error) {
      console.error('Error during authentication:', error.message, error.response?.data);
      res.status(error.response?.status || 500).json({ error: 'Failed to authenticate' });
    }
  };
  
   
module.exports = { githubAuthCallback };
  

