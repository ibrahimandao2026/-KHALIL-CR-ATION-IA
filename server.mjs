import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

app.disable("x-powered-by");

app.use(express.json({ limit: "32kb" }));

// Sécurité
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  next();
});

// Fichiers du site
app.use(express.static(publicPath, {
  index: false,
  dotfiles: "deny"
}));

// Accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Vérification API
app.get("/api/status", (req, res) => {
  res.status(200).json({
    status: "online",
    name: "KHALIL CRÉATION IA"
  });
});

// Clé OpenAI
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY est absente.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// Instructions de l'assistant
const instructions = `
Tu es KHALIL CRÉATION IA, un assistant intelligent généraliste.

Tu aides les utilisateurs dans :

- études
- exposés
- présentations
- PowerPoint
- révisions
- mathématiques
- sciences
- informatique
- programmation
- intelligence artificielle
- géomatique
- SIG
- QGIS
- cartographie
- télédétection
- climatologie
- environnement
- agriculture
- commerce international
- entrepreneuriat
- marketing
- économie
- finance
- recherche
- CV
- lettres de motivation
- emploi
- stages
- rédaction
- correction du français
- traduction
- documents
- vie quotidienne

Pour un exposé, aide l'utilisateur avec :
- introduction
- problématique
- objectifs
- plan
- développement
- exemples
- conclusion
- questions possibles à l'oral
- réponses aux questions

Pour les cours, explique simplement, étape par étape.

Pour la programmation, donne du code clair et explique où le placer.

Pour la géomatique, le SIG, QGIS, la cartographie et la télédétection,
donne des explications pratiques et adaptées aux étudiants.

Pour le Sénégal, utilise le contexte sénégalais lorsque cela est pertinent.

Ne fabrique jamais une information présentée comme certaine.
Si tu n'es pas sûr, précise-le.

Réponds principalement en français.

Sois clair, professionnel, pédagogique et utile.
`;

// Anti-spam
const requests = new Map();

function antiSpam(req, res, next) {
  const ip = req.ip || "unknown";
  const now = Date.now();

  let history = requests.get(ip) || [];

  history = history.filter(
    time => now - time < 60000
  );

  if (history.length >= 15) {
    return res.status(429).json({
      error: "Trop de demandes. Veuillez patienter."
    });
  }

  history.push(now);
  requests.set(ip, history);

  next();
}

// Chat
app.post("/api/chat", antiSpam, async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string") {
      return res.status(400).json({
        error: "Message invalide."
      });
    }

    const text = message.trim();

    if (!text) {
      return res.status(400).json({
        error: "Veuillez écrire un message."
      });
    }

    if (text.length > 6000) {
      return res.status(413).json({
        error: "Message trop long."
      });
    }

    const response = await client.responses.create({
      model: MODEL,
      instructions,
      input: text,
      max_output_tokens: 1800
    });

    const reply = String(
      response.output_text || ""
    ).trim();

    if (!reply) {
      return res.status(502).json({
        error: "Aucune réponse générée."
      });
    }

    res.json({
      reply
    });

  } catch (error) {
    console.error("Erreur API :", error);

    res.status(500).json({
      error: "KHALIL CRÉATION IA ne peut pas répondre actuellement."
    });
  }
});

// Route inconnue
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route API introuvable."
    });
  }

  res.status(404).send("Page introuvable.");
});

// Démarrage
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🌍KHALIL🇸🇳CRÉATION🇸🇳IA démarré sur le port ${PORT}`
  );
});
