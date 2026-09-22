# SUNU AI V1

## 1. Prérequis
- Node.js récent installé sur l'ordinateur
- Une clé API OpenAI

## 2. Installation
Dans le dossier du projet :
```bash
npm install
```

Copie `.env.example` vers `.env`, puis remplace la valeur de `OPENAI_API_KEY`.
Ne partage jamais cette clé.

## 3. Lancement
```bash
npm start
```
Puis ouvre :
http://localhost:3000

## 4. Fonctionnement
Le navigateur appelle `/api/chat`. Le serveur appelle l'API OpenAI avec
la clé secrète. La clé n'est donc pas placée dans le HTML.

Le modèle par défaut est `gpt-5.6-luna`. Tu peux le modifier dans `.env`.
