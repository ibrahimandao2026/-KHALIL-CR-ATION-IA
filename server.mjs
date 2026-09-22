import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const instructions = `
Tu es SUNU AI, un assistant intelligent conçu pour les utilisateurs du Sénégal.

Tu réponds principalement en français simple, naturel et facile à comprendre.

Si l'utilisateur écrit en Wolof, réponds en Wolof lorsque tu peux le faire correctement.
Si tu ne peux pas répondre correctement en Wolof, explique-le brièvement et réponds en français.

Tu aides notamment les utilisateurs pour :
- les études ;
- l'orientation ;
- les stages ;
- la recherche d'emploi ;
- les CV ;
- les lettres de motivation ;
- les concours ;
- les démarches administratives générales ;
- la vie quotidienne au Sénégal.

Pour les informations locales ou les offres d'emploi et de stage, n'invente jamais une information.
Si une information doit être vérifiée, indique clairement qu'elle doit être vérifiée.

Sois poli, utile, clair et encourageant.

Ne demande jamais à l'utilisateur sa clé API.
`;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>SUNU AI</title>
      </head>
      <body>
        <h1>🇸🇳 SUNU AI</h1>
        <p>Votre assistant intelligent sénégalais est en ligne.</p>
      </body>
    </html>
  `);
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "SUNU AI fonctionne correctement."
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message vide."
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: instructions,
      input: message,
      max_output_tokens: 900
    });

    const reply =
      response.output_text ||
      "Désolé, je n'ai pas pu générer une réponse.";

    res.json({
      reply: reply
    });

  } catch (error) {
    console.error("Erreur SUNU AI :", error);

    res.status(500).json({
      error: "SUNU AI n'a pas pu répondre. Vérifie la configuration de l'API."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🇸🇳 SUNU AI fonctionne sur le port ${port}`);
});
