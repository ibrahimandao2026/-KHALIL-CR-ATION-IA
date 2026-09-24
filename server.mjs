import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
});

// Fichiers du site
app.use(
  express.static(publicPath, {
    index: false,
    dotfiles: "deny"
  })
);

// Page principale
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Vérification de la clé API
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY est absente.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
  maxRetries: 1
});

// Modèle
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// Instructions de KHALIL CRÉATION IA
const instructions = `
Tu es KHALIL CRÉATION IA, un assistant intelligent généraliste.

Tu aides l'utilisateur dans :

- études et apprentissage
- exposés et présentations
- PowerPoint
- résumés et révisions
- mathématiques
- sciences
- informatique
- programmation
- intelligence artificielle
- géomatique
- SIG et QGIS
- cartographie
- télédétection
- climatologie
- environnement
- agriculture
- commerce international
- entrepreneuriat
- marketing
- gestion
- économie
- finance
- recherche
- CV
- lettres de motivation
- recherche d'emploi et de stage
- rédaction professionnelle
- correction du français
- documents administratifs
- traduction
- vie quotidienne

Pour les exposés :

1. Propose une introduction.
2. Présente un plan clair.
3. Développe chaque partie.
4. Ajoute des exemples.
5. Propose une conclusion.
6. Prépare éventuellement des questions/réponses pour l'oral.
7. Adapte le niveau au niveau scolaire ou universitaire demandé.

Pour les sujets techniques :

Explique progressivement, simplement et avec des exemples.
Pour le code, donne du code propre et explique où le placer.

Pour les sujets concernant le Sénégal, utilise un contexte sénégalais lorsque cela est pertinent.

Si une information n'est pas certaine, indique-le clairement.
Ne fabrique pas de sources ou de statistiques.

Réponds principalement en français, sauf si l'utilisateur demande une autre langue.

Sois clair, utile, professionnel et pédagogique.
`;

// Anti-spam simple
const requests = new Map();

const MAX_REQUESTS = 15;
const WINDOW = 60 * 1000;

function antiSpam(req, res, next) {
  const ip = req.ip || "unknown";
  const now = Date.now();

  let history = requests.get(ip) || [];

  history = history.filter(
    (time) => now - time < WINDOW
  );

  if (history.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error:
        "Trop de demandes. Veuillez patienter quelques instants."
    });
  }

  history.push(now);
  requests.set(ip, history);

  next();
}

// CHAT
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
        error:
          "Votre message est trop long. Maximum : 6000 caractères."
      });
    }

    const response = await client.responses.create({
      model: MODEL,
      instructions: instructions,
      input: text,
      max_output_tokens: 1800
    });

    const reply = String(
      response.output_text || ""
    ).trim();

    if (!reply) {
      return res.status(502).json({
        error:
          "KHALIL CRÉATION IA n'a pas pu générer une réponse."
      });
    }

    res.json({
      reply: reply
    });

  } catch (error) {
    console.error("Erreur OpenAI :", error);

    res.status(500).json({
      error:
        "KHALIL CRÉATION IA n'a pas pu répondre pour le moment."
    });
  }
});

// STATUT
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    name: "KHALIL CRÉATION IA",
    version: "2.0",
    features: [
      "chat",
      "exposes",
      "education",
      "powerpoint",
      "presentation",
      "programmation",
      "geospatial",
      "environnement",
      "emploi",
      "documents",
      "resumes",
      "revisions"
    ]
  });
});

// Route API inexistante
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route API introuvable."
    });
  }

  next();
});

// Page inexistante
app.use((req, res) => {
  res.status(404).send("Page introuvable.");
});

// Démarrage
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `KHALIL CRÉATION IA est lancé sur le port ${PORT}`
  );
});
