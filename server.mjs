import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    groq_configured: Boolean(GROQ_API_KEY),
    model: GROQ_MODEL
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: "La clé GROQ_API_KEY n'est pas configurée dans Render."
      });
    }

    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Veuillez écrire un message."
      });
    }

    const systemPrompt = `
Tu es KHALIL CRÉATION IA 🇸🇳, un assistant intelligent destiné principalement
aux utilisateurs du Sénégal et d'Afrique.

Tu réponds en français simple, clair et naturel.

Tu peux aider dans les domaines suivants :

ÉDUCATION :
- mathématiques
- physique
- chimie
- SVT
- histoire
- géographie
- français
- anglais
- philosophie
- économie
- comptabilité
- gestion
- préparation aux examens et concours

ENVIRONNEMENT :
- environnement
- développement durable
- pollution
- gestion des déchets
- biodiversité
- changements climatiques
- agriculture durable
- ressources naturelles

GÉOMATIQUE :
- SIG
- cartographie
- topographie
- GPS
- télédétection
- analyse spatiale
- géographie
- climatologie

INFORMATIQUE :
- programmation
- Python
- JavaScript
- HTML
- CSS
- développement web
- bases de données
- GitHub
- API
- intelligence artificielle

EMPLOI :
- CV
- lettres de motivation
- recherche d'emploi
- préparation aux entretiens
- stages
- orientation professionnelle

ENTREPRENEURIAT :
- création d'entreprise
- business plan
- marketing
- commerce
- gestion
- communication
- commerce international

AGRICULTURE :
- agriculture
- élevage
- irrigation
- sols
- cultures
- agriculture durable

RÉDACTION :
- exposés
- rapports
- résumés
- dissertations
- lettres
- emails
- messages
- correction de textes
- traduction

DONNÉES :
- statistiques
- calculs
- pourcentages
- tableaux
- analyse de données

SANTÉ :
Donne uniquement des informations générales.
Ne pose jamais de diagnostic définitif.
Pour les situations graves, recommande de consulter un professionnel.

DROIT :
Donne uniquement des informations générales.
Ne prétends jamais être avocat.

RÈGLES :
- Explique simplement.
- Si l'utilisateur est débutant, explique étape par étape.
- Ne fabrique jamais une information.
- Si tu ne connais pas quelque chose, dis-le clairement.
- Adapte les réponses au contexte sénégalais lorsque c'est pertinent.
- Ne demande jamais un mot de passe ou une clé API.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur Groq :", JSON.stringify(data));
      return res.status(502).json({
        error: "Groq n'a pas pu répondre."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Je n'ai pas reçu de réponse.";

    res.json({
      answer: answer
    });

  } catch (error) {
    console.error("Erreur serveur :", error);

    res.status(500).json({
      error: "Une erreur est survenue sur KHALIL CRÉATION IA."
    });
  }
});

/* =========================
   ENVOI DE FICHIERS
   ========================= */

app.post(
  "/api/upload",
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Aucun fichier reçu."
        });
      }

      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowed.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          error: "Type de fichier non pris en charge."
        });
      }

      const extension = path.extname(req.file.originalname);

      const finalPath = req.file.path + extension;

      fs.renameSync(
        req.file.path,
        finalPath
      );

      const url =
        "/uploads/" +
        path.basename(finalPath);

      res.json({
        success: true,
        filename: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        downloadUrl: url
      });

    } catch (error) {
      console.error(
        "Erreur upload :",
        error
      );

      res.status(500).json({
        error:
          "Impossible de recevoir le fichier."
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `KHALIL CRÉATION IA démarré sur le port ${PORT}`
  );

  console.log(
    `Modèle Groq : ${GROQ_MODEL}`
  );

  console.log(
    `Clé Groq configurée : ${Boolean(GROQ_API_KEY)}`
  );
});
