[README.md](https://github.com/user-attachments/files/27550058/README.md)
# 🌿 GabonExplore – Site Web de Tourisme

Site web complet de tourisme pour le Gabon avec :
- ✅ Design premium (jungle luxury aesthetic)
- ✅ Assistant IA "Kaya" (powered by Claude API)
- ✅ Système de réservation en 4 étapes
- ✅ Intégration paiement Stripe (Visa/Mastercard)
- ✅ Prêt pour déploiement Netlify

## 📁 Structure du projet

```
gabonexplore/
├── index.html                    # Page d'accueil
├── pages/
│   └── reservations.html         # Page réservation + paiement
├── css/
│   ├── style.css                 # Styles principaux
│   └── reservations.css          # Styles page réservation
├── js/
│   ├── main.js                   # Scripts principaux
│   ├── chatbot.js                # Assistant IA Kaya (Claude)
│   └── reservations.js           # Logique réservation + Stripe
├── netlify/
│   └── functions/
│       └── create-payment-intent.js  # Fonction Stripe serverless
└── netlify.toml                  # Configuration Netlify
```

---

## 🚀 Déploiement sur Netlify

### Option 1 – Glisser-déposer (le plus simple)
1. Allez sur https://app.netlify.com
2. Connectez-vous / créez un compte
3. Faites glisser le dossier `gabonexplore/` dans la zone de dépôt
4. Votre site est en ligne en 30 secondes !

### Option 2 – Via GitHub (recommandé pour production)
```bash
# 1. Créer un repo GitHub
git init
git add .
git commit -m "feat: GabonExplore initial"
git remote add origin https://github.com/votre-compte/gabonexplore.git
git push -u origin main

# 2. Dans Netlify :
# New site → Import from GitHub → Sélectionner le repo
# Build command : (laisser vide)
# Publish directory : .
# → Deploy site
```

### Option 3 – Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir . --prod
```

---

## 💳 Configuration Stripe (Paiement Visa/Mastercard)

### 1. Créer un compte Stripe
- Allez sur https://stripe.com
- Créez votre compte et activez-le

### 2. Récupérer vos clés API
- Dashboard Stripe → Developers → API Keys
- `pk_live_...` → Clé publique (front-end)
- `sk_live_...` → Clé secrète (back-end, JAMAIS exposée)

### 3. Variables d'environnement Netlify
Dans Netlify → Site settings → Environment variables :
```
STRIPE_SECRET_KEY = sk_live_votre_cle_secrete
```

### 4. Activer la fonction Netlify
Dans `js/reservations.js`, remplacer `simulatePayment()` par le code
Stripe réel (instructions dans le commentaire en bas du fichier).

### 5. Mettre à jour la clé publique Stripe
Dans `pages/reservations.html` :
```html
<script src="https://js.stripe.com/v3/"></script>
```
Et dans `js/reservations.js` :
```javascript
const stripe = Stripe('pk_live_VOTRE_CLE_PUBLIQUE');
```

---

## 🤖 Configuration Assistant IA (Kaya)

L'assistant utilise l'API Claude (Anthropic).

### Option A – Claude API directe (développement)
L'appel API est dans `js/chatbot.js`. Pour les tests en local,
vous pouvez tester avec votre clé API Anthropic.

### Option B – Via fonction Netlify (recommandé production)
Pour ne pas exposer la clé API dans le front-end :

1. Créer `netlify/functions/chat.js` :
```javascript
const Anthropic = require('@anthropic-ai/sdk');
exports.handler = async (event) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { messages } = JSON.parse(event.body);
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: '...votre system prompt...',
    messages
  });
  return { statusCode: 200, body: JSON.stringify(response) };
};
```

2. Ajouter la variable dans Netlify :
```
ANTHROPIC_API_KEY = sk-ant-votre_cle
```

3. Modifier `chatbot.js` pour appeler `/.netlify/functions/chat`

---

## 🌍 Domaine personnalisé

Dans Netlify → Domain settings :
- Ajouter votre domaine : `www.gabonexplore.ga`
- Configurer les DNS chez votre registrar
- HTTPS activé automatiquement (Let's Encrypt)

---

## 📧 Emails de confirmation

Utiliser Netlify Forms ou un service comme SendGrid/Mailgun :
1. Créer `netlify/functions/send-confirmation.js`
2. Appeler l'API SendGrid avec le template de confirmation
3. Déclencher après paiement réussi

---

## 🔒 Sécurité

- Headers CSP configurés dans `netlify.toml`
- Clés Stripe/Anthropic en variables d'environnement
- HTTPS automatique avec Netlify
- Validation côté client ET serveur

---

## 📞 Support

Pour toute question : contact@gabonexplore.ga
