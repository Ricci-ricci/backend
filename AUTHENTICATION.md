# 🔐 Authentification avec Cookies HTTP-Only

## Vue d'ensemble

Ce backend utilise une authentification basée sur des **cookies HTTP-Only** pour une sécurité maximale. Le token JWT est stocké dans un cookie sécurisé au lieu d'être stocké dans le localStorage du frontend.

## 🍪 Pourquoi des cookies HTTP-Only ?

### Avantages
- **Protection XSS** : Les cookies HTTP-Only ne peuvent pas être accédés via JavaScript
- **Gestion automatique** : Le navigateur envoie automatiquement le cookie avec chaque requête
- **Sécurité renforcée** : Protection CSRF avec SameSite
- **Pas de stockage côté client** : Aucun risque de vol de token via le code JavaScript

### Configuration des cookies
```javascript
{
  httpOnly: true,           // Inaccessible via JavaScript
  secure: true,             // HTTPS uniquement (production)
  sameSite: "strict",       // Protection CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 jours
  path: "/"                 // Disponible sur toutes les routes
}
```

## 📡 Endpoints d'authentification

### 1. **POST** `/api/auth/register`
Inscription d'un nouvel utilisateur

**Body :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 2. **POST** `/api/auth/login`
Connexion et création du cookie d'authentification

**Body :**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "message": "Login successful"
}
```

**Cookie créé :** `auth_token` (HTTP-Only, Secure, 7 jours)

---

### 3. **POST** `/api/auth/logout`
Déconnexion et suppression du cookie

**Réponse :**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. **GET** `/api/auth/verify`
Vérifier l'authentification actuelle

**Réponse (succès) :**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Réponse (non authentifié) :**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

---

## 🛡️ Middlewares de protection

### `authenticate`
Vérifie que l'utilisateur est authentifié via le cookie

**Utilisation :**
```typescript
import { authenticate } from "@/middleware/auth";

router.get("/protected", authenticate, (req, res) => {
  // req.user contient les infos de l'utilisateur
  res.json({ user: req.user });
});
```

### `requireAdmin`
Vérifie que l'utilisateur est un administrateur (doit être utilisé après `authenticate`)

**Utilisation :**
```typescript
import { authenticate, requireAdmin } from "@/middleware/auth";

router.delete("/admin/users/:id", authenticate, requireAdmin, deleteUser);
```

---

## 🌐 Configuration Frontend

### Axios (Recommandé)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true  // IMPORTANT : Envoie les cookies
});

// Connexion
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Requête protégée
const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Déconnexion
const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
```

### Fetch API

```javascript
// Connexion
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // IMPORTANT : Envoie les cookies
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Requête protégée
const getProfile = async () => {
  const response = await fetch('http://localhost:3000/api/users/profile', {
    credentials: 'include'  // IMPORTANT : Envoie les cookies
  });
  return response.json();
};
```

---

## 🔒 Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# JWT Secret (changez cette valeur en production !)
JWT_SECRET=votre_super_secret_key_ici_minimum_32_caracteres

# Environnement
NODE_ENV=development  # ou "production"

# Base de données
DATABASE_URL=mongodb://...

# Port
PORT=3000
```

⚠️ **IMPORTANT** : En production, utilisez une clé JWT forte et unique !

---

## 🚀 Exemple complet React

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
};
```

```typescript
// App.tsx
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <h1>Bienvenue {user.name}</h1>
          <button onClick={logout}>Se déconnecter</button>
        </>
      ) : (
        <LoginForm onLogin={login} />
      )}
    </div>
  );
}
```

---

## 🔧 Configuration CORS

Le serveur est configuré pour accepter les cookies cross-origin :

```typescript
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true  // IMPORTANT : Autorise les cookies
}));
```

En production, limitez les origines autorisées :

```typescript
app.use(cors({
  origin: ['https://votre-frontend.com'],
  credentials: true
}));
```

---

## 📝 Notes de sécurité

1. **HTTPS en production** : Les cookies sécurisés nécessitent HTTPS
2. **JWT_SECRET fort** : Utilisez une clé d'au moins 32 caractères aléatoires
3. **Validation des entrées** : Toutes les routes utilisent Zod pour la validation
4. **Hash des mots de passe** : bcryptjs avec salt de 10 rounds
5. **Durée du token** : 7 jours (ajustez selon vos besoins)

---

## 🐛 Dépannage

### Les cookies ne sont pas envoyés
- Vérifiez que `withCredentials: true` est configuré dans Axios
- Vérifiez que `credentials: 'include'` est dans fetch
- Vérifiez la configuration CORS

### Token expiré
- Le token expire après 7 jours
- L'utilisateur doit se reconnecter
- Implémentez un refresh token pour une meilleure UX

### Cookie non visible dans DevTools
- C'est normal ! Les cookies HTTP-Only ne sont pas accessibles via JavaScript
- Vous pouvez les voir dans l'onglet "Application/Cookies" des DevTools

---

## 📚 Ressources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)