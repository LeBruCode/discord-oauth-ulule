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

  const url =
    "https://discord.com/oauth2/authorize" +
    `?client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${redirect}` +
    `&response_type=code` +
    `&scope=identify`;

  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Aucun code reçu de Discord.");
    }

    console.log("Code reçu:", code);
    console.log("Redirect URI utilisée:", process.env.REDIRECT_URI);

    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.REDIRECT_URI);

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("Token response:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log("User:", userResponse.data);

    res.send(`
      <h2>Connexion réussie 🎉</h2>
      <p>${userResponse.data.username}</p>
    `);

  } catch (error) {
    console.error("ERREUR COMPLETE:");
    console.error(error.response?.data || error);
    res.status(500).send("Erreur OAuth - regarde les logs Render");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
