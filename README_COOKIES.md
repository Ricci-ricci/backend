# 🍪 Authentification par Cookies - Guide Complet

## 📚 Vue d'ensemble

Ce backend implémente une **authentification sécurisée par cookies HTTP-Only** pour une application e-commerce complète avec gestion de panier.

### ✨ Fonctionnalités

- 🔐 **Authentification JWT via cookies HTTP-Only** (protection XSS)
- 🛒 **Système de panier complet** avec authentification requise
- 🔒 **Routes protégées** avec middlewares de sécurité
- ✅ **Validation des données** avec Zod
- 🚀 **API RESTful** moderne et sécurisée
- 📝 **Documentation complète** avec exemples

---

## 🚀 Démarrage rapide

### Installation

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Configuration

Créez un fichier `.env` :

```env
# Base de données
DATABASE_URL=mongodb://...

# JWT (CHANGEZ CETTE VALEUR EN PRODUCTION !)
JWT_SECRET=votre_secret_super_securise_minimum_32_caracteres

# Environnement
NODE_ENV=development

# Port
PORT=3000
```

---

## 📖 Documentation

### 📁 Fichiers de documentation

| Fichier | Description |
|---------|-------------|
| **[AUTHENTICATION.md](./AUTHENTICATION.md)** | Documentation complète de l'authentification par cookies |
| **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** | Guide de configuration pour le frontend (React, Vue, etc.) |
| **[EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md)** | Exemples complets d'utilisation de l'API |
| **[CHANGELOG_AUTH.md](./CHANGELOG_AUTH.md)** | Récapitulatif des modifications et changements |
| **[auth.http](./auth.http)** | Tests des endpoints d'authentification (REST Client) |
| **[cart.http](./cart.http)** | Tests des endpoints du panier (REST Client) |

---

## 🔐 Endpoints d'authentification

### Inscription
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Connexion (crée le cookie)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**→ Crée un cookie `auth_token` (HTTP-Only, Secure, 7 jours)**

### Vérifier l'authentification
```bash
GET /api/auth/verify
# Cookie envoyé automatiquement
```

### Déconnexion
```bash
POST /api/auth/logout
# Supprime le cookie
```

---

## 🛒 Endpoints du panier (authentification requise)

### Ajouter au panier
```bash
POST /api/cart
Content-Type: application/json

{
  "userId": "user_id",
  "productId": "product_id",
  "quantity": 2
}
```

### Obtenir le panier
```bash
GET /api/cart/:userId
```

### Modifier la quantité
```bash
PUT /api/cart/items/:itemId
Content-Type: application/json

{
  "quantity": 3
}
```

### Supprimer un item
```bash
DELETE /api/cart/items/:itemId
```

### Vider le panier
```bash
DELETE /api/cart/:userId
```

---

## 🔧 Configuration Frontend

### Avec Axios (Recommandé)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true  // ⚠️ CRUCIAL : Permet l'envoi des cookies
});

// Connexion
const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // Le cookie est automatiquement créé
};

// Requête authentifiée
const getCart = async (userId: string) => {
  const { data } = await api.get(`/cart/${userId}`);
  return data; // Le cookie est automatiquement envoyé
};
```

### Avec Fetch API

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // ⚠️ CRUCIAL : Permet l'envoi des cookies
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

---

## 🛡️ Middlewares de sécurité

### `authenticate`
Protège les routes nécessitant une authentification

```typescript
import { authenticate } from "@/middleware/auth";

router.get("/profile", authenticate, (req, res) => {
  // req.user contient { userId, email, role }
  res.json({ user: req.user });
});
```

### `requireAdmin`
Protège les routes d'administration

```typescript
import { authenticate, requireAdmin } from "@/middleware/auth";

router.delete("/admin/users/:id", authenticate, requireAdmin, deleteUser);
```

---

## 🔒 Sécurité des cookies

### Configuration appliquée

```javascript
{
  httpOnly: true,           // Inaccessible via JavaScript (protection XSS)
  secure: true,             // HTTPS uniquement en production
  sameSite: "strict",       // Protection CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 jours
  path: "/"                 // Disponible sur toutes les routes
}
```

### Avantages

✅ **Protection XSS** : Le cookie ne peut pas être volé via JavaScript  
✅ **Protection CSRF** : Attribut SameSite  
✅ **Gestion automatique** : Le navigateur envoie le cookie automatiquement  
✅ **Pas de stockage côté client** : Aucun code JavaScript ne manipule le token  

---

## 📝 Exemple complet (React)

### 1. Configuration de l'API

```typescript
// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true
});
```

### 2. Service d'authentification

```typescript
// src/services/auth.service.ts
import { api } from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  verify: () => api.get('/auth/verify')
};
```

### 3. Hook d'authentification

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.verify()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.data.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

### 4. Composant de connexion

```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirection automatique
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Mot de passe"
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};
```

---

## 🧪 Tests avec cURL

### 1. Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Pass123!"}'
```

### 2. Connexion (sauvegarde le cookie)

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Pass123!"}'
```

### 3. Ajouter au panier (utilise le cookie)

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_id","productId":"product_id","quantity":1}'
```

### 4. Voir le panier

```bash
curl -b cookies.txt http://localhost:3000/api/cart/user_id
```

### 5. Déconnexion

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

---

## ⚠️ Points importants

### ✅ À faire

1. **En production** : Utilisez un `JWT_SECRET` fort et unique
2. **HTTPS obligatoire** : Les cookies sécurisés nécessitent HTTPS
3. **withCredentials** : N'oubliez jamais cette option dans Axios/Fetch
4. **CORS** : Configurez correctement les origines autorisées

### ❌ À éviter

1. ❌ Ne stockez PAS le token dans localStorage avec les cookies
2. ❌ Ne désactivez PAS `httpOnly`
3. ❌ Ne partagez PAS votre `JWT_SECRET`
4. ❌ N'oubliez PAS `withCredentials: true` ou `credentials: 'include'`

---

## 🔍 Débogage

### Les cookies ne sont pas envoyés ?

✓ Vérifiez `withCredentials: true` (Axios) ou `credentials: 'include'` (Fetch)  
✓ Vérifiez la configuration CORS du backend  
✓ Vérifiez que le backend répond correctement au login  
✓ Inspectez les cookies dans DevTools → Application → Cookies  

### Erreur CORS ?

```
Access to XMLHttpRequest has been blocked by CORS policy
```

→ Vérifiez que le backend autorise votre origine frontend dans la config CORS  
→ Vérifiez que `credentials: true` est dans la config CORS du backend  

### Cookie non visible dans DevTools ?

→ C'est normal ! Les cookies HTTP-Only ne sont pas accessibles via JavaScript  
→ Vérifiez dans DevTools → Application → Cookies (vous devriez voir `auth_token`)  

---

## 📊 Architecture

```
Frontend (React/Vue/Angular)
    ↓
    ↓ withCredentials: true
    ↓
Backend Express
    ↓
    ↓ authenticate middleware
    ↓
Routes protégées (Cart, Profile, etc.)
    ↓
    ↓ req.user disponible
    ↓
Controllers
    ↓
Prisma ORM
    ↓
MongoDB
```

---

## 🎯 Prochaines étapes

- [ ] Implémenter le refresh token
- [ ] Ajouter le rate limiting
- [ ] Vérification d'email
- [ ] Réinitialisation de mot de passe
- [ ] Authentification à deux facteurs (2FA)
- [ ] Gestion des commandes
- [ ] Système de paiement

---

## 📚 Ressources supplémentaires

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Documentation détaillée de l'authentification
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Guide complet frontend avec hooks React
- **[EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md)** - Scénarios complets d'utilisation
- **[CHANGELOG_AUTH.md](./CHANGELOG_AUTH.md)** - Historique des modifications

---

## 🤝 Support

Pour toute question :
1. Consultez la documentation dans les fichiers `.md`
2. Testez avec les fichiers `.http` (REST Client)
3. Vérifiez les exemples dans `EXAMPLE_USAGE.md`

---

## 📄 Licence

MIT

---

**Développé avec ❤️ pour une sécurité maximale**

🍪 Les cookies, c'est bon pour la sécurité ! 🔒