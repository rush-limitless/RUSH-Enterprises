# 📘 Documentation Technique : RUSH Enterprises v1.0

## 1. Présentation du Projet
**RUSH Enterprises** est une application de gestion centralisée pour un business multi-activités situé en un lieu unique. Elle permet la vente de produits numériques et physiques, la gestion de caisses indépendantes par gestionnaire, et le suivi financier global par l'administrateur.

* **Devise unique :** FCFA
* **Localisation :** Français (par défaut) et Anglais.
* **Design :** Soft UI, épuré, modes Light/Dark.

---

## 2. Architecture Technique

| Couche | Technologie |
| :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI |
| **Backend** | NestJS (Node.js framework), TypeSafe avec TypeScript |
| **Base de Données** | PostgreSQL avec Prisma ORM |
| **Authentification** | Auth.js (Connecteurs Google & Yahoo OAuth2) |
| **Tâches de fond** | BullMQ + Redis (Rapports PDF & Rappels par mail) |
| **Envoi d'emails** | Resend / Nodemailer |

### Clean Architecture (Backend)

```
src/
├── domain/           # Entités & interfaces (ports)
│   ├── entities/
│   └── repositories/
├── application/      # Use cases (logique métier)
│   └── use-cases/
├── infrastructure/   # Implémentations (adapters)
│   ├── repositories/
│   └── services/
└── presentation/     # Controllers & DTOs
    ├── controllers/
    └── dto/
```

---

## 3. Modèle de Données

```prisma
enum Role { ADMIN, MANAGER }
enum ProductType { DIGITAL, PHYSICAL }

model User {
  id, email, name, role
  → sessions CaisseSession[]
}

model Product {
  id, name, category, type, price, stock?, alertLimit(2)
}

model CaisseSession {
  id, managerId → User, openedAt, closedAt?, openingBalance, theoreticalBal, realBalance?
  → transactions Transaction[]
}

model Transaction {
  id, caisseId → CaisseSession, amount, type(SALE|EXPENSE), description, isCancelled, createdAt
}

model Task {
  id, title, description, dueDate, isCompleted, remindAt?, managerId?
}
```

---

## 4. Rôles

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Tout voir, rapports globaux, gestion utilisateurs |
| **MANAGER** | Sa caisse uniquement, ses tâches, ses transactions |

---

## 5. Fonctionnalités Clés

1. **Gestion de Caisse** — Ouverture/fermeture avec solde théorique vs réel
2. **Vente de Produits** — Numériques (stock illimité) et physiques (alertes stock)
3. **Transactions** — Ventes et dépenses, annulation possible
4. **Tâches** — Assignation, rappels par email
5. **Rapports** — PDF générés en tâche de fond (BullMQ)

---

## 6. Setup

```bash
# Frontend
cd apps/frontend && npm run dev

# Backend
cd apps/backend && npm run start:dev

# Base de données
npx prisma migrate dev
```

Variables d'environnement : voir `apps/frontend/.env.example`
