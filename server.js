import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/**
 * Route de test
 */
app.get("/", (req, res) => {
  res.send("Discord OAuth Ulule backend running");
});

/**
 * Route login -> redirige vers Discord OAuth
 */
app.get("/login", (req, res) => {
  const redirect = encodeURIComponent(process.env.REDIRECT_URI);

  const discordAuthUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${redirect}` +
    `&response_type=code` +
    `&scope=identify`;

  res.redirect(discordAuthUrl);
});

/**
 * Route callback -> Discord renvoie ici avec ?code=XXXX
 */
app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Code OAuth manquant");
    }

    // Préparation du body
    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.REDIRECT_URI);

    // Échange code -> access_token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Récupération utilisateur Discord
    const userResponse = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const user = userResponse.data;

    res.send(`
      <h2>Connexion réussie 🎉</h2>
      <p>Connecté en tant que : <strong>${user.username}</strong></p>
      <p>ID Discord : ${user.id}</p>
    `);

  } catch (error) {
    console.error("Erreur OAuth :", error.response?.data || error.message);

    res.status(500).send(`
      <h2>Erreur OAuth ❌</h2>
      <pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>
    `);
  }
});

/**
 * Lancement serveur
 */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
