import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connexion à Groq
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

app.use(express.json({ limit: "1mb" }));

// Les fichiers du site sont à la racine
app.use(express.static("."));

const instructions = `
Tu es 🌍KHALIL🇸🇳CRÉATION🇸🇳IA, un assistant conçu pour être utile aux utilisateurs du Sénégal.

Réponds principalement en français simple et naturel.

Si l'utilisateur écrit en Wolof, réponds en Wolof lorsque tu peux le faire correctement.
Sinon, explique clairement que le support Wolof est encore en développement et réponds en français.

Pour les sujets locaux, évite d'inventer des informations.
Distingue les informations certaines des informations à vérifier.

Tu aides notamment pour :
- CV
- emploi
- stages
- études
- orientation
- démarches générales

Ne demande jamais la clé API de l'utilisateur.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message vide."
      });
    }

    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      instructions,
      input: message,
      max_output_tokens: 900
    });

    res.json({
      reply: response.output_text || "Je n'ai pas pu générer une réponse."
    });

  } catch (error) {
    console.error("Erreur Groq :", error);

    res.status(500).json({
      error: "SUNU AI n'a pas pu répondre. Vérifie la configuration de l'API."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🌍KHALIL🇸🇳CRÉATION🇸🇳IA démarré sur le port ${port}`);
});
       


    
