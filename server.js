import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("Discord OAuth Ulule backend running");
});

app.get("/login", (req, res) => {
  const redirect = encodeURIComponent(process.env.REDIRECT_URI);

  res.redirect(
    `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`
  );
});

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.send(`Connecté en tant que ${userResponse.data.username}`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("Erreur OAuth");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
