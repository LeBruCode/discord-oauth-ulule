import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("Discord OAuth Ulule backend running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
