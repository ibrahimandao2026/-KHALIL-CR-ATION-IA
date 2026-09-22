import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const instructions = `
Tu es SUNU AI, un assistant conçu pour être utile aux utilisateurs du Sénégal.
Réponds principalement en français simple et naturel. Si l'utilisateur écrit en Wolof,
réponds en Wolof lorsque tu peux le faire correctement; sinon explique clairement que
le support Wolof est encore en développement et réponds en français.
Pour les sujets locaux, évite d'inventer des informations. Distingue les informations
certaines des informations à vérifier. Tu aides notamment pour CV, emploi, stages,
études, orientation et démarches générales.
Ne demande jamais la clé API de l'utilisateur.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Message vide." });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions,
      input: message,
      max_output_tokens: 900
    });

    res.json({ reply: response.output_text || "Je n'ai pas pu générer une réponse." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "SUNU AI n'a pas pu répondre. Vérifie la clé API et la connexion."
    });
  }
});

app.listen(port, () => {
  console.log(`SUNU AI disponible sur http://localhost:${port}`);
});
