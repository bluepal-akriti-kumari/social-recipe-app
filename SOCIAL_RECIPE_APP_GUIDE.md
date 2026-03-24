# 🍳 Culinario: Social Recipe Platform - Complete Guide

Welcome to the official documentation for **Culinario**, a state-of-the-art social platform for recipe discovery and culinary community building.

---

## 🌟 Project Vision
Culinario is designed to transform the static experience of recipe sites into a vibrant social ecosystem. It bridges the gap between searching for a dish and discovering a community of chefs.

### Key Value Propositions
- **Discovery**: Tailored feeds based on chef follows and trending community interests.
- **Organization**: Integrated meal planning and smart shopping list generation.
- **Engagement**: Threaded discussions and real-time social feedback loops.

---

## 🏗️ Technical Architecture

### 🛡️ Backend: Spring Boot 3.4
- **Security**: Stateless JWT-based authentication.
- **Data Persistence**: PostgreSQL with GIN indexes for high-speed full-text search.
- **Media Handling**: Cloudinary integration for resilient image delivery.
- **Evolution**: Database schema versioning via Flyway.

### 🎨 Frontend: React 19 + Vite
- **UI Framework**: Material-UI 7 for a premium, responsive design.
- **State Management**: Redux Toolkit (Auth/Global) and React Query (Server Sync).
- **Animations**: Framer Motion for smooth social interactions.

---

## 📂 System Components

### 1. User & Social Ecosystem
| Entity | Description |
| :--- | :--- |
| **User** | Central profile managing reputation, credentials, and settings. |
| **Follow** | Atomic relationship between chefs and enthusiasts. |
| **Notification** | Real-time event system for social actions (likes, follows, comments). |

### 2. Recipe & Discovery
- **Recipe Engine**: Multi-step creation with automated unit conversion and media linking.
- **Search System**: Proprietary search logic utilizing PostgreSQL GIN indexes for partial and exact matches.
- **Personalized Feed**: Algorithmically driven content from the chef-following network.

### 3. Utility Suite
- **Meal Planner**: Interactive calendar for scheduling culinary activities.
- **Shopping List**: Dynamic aggregation from scheduled recipes with auto-categorization.

---

## 📡 API Ecosystem Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Exchanges credentials for a stateless JWT. |
| `/api/recipes` | `GET` | Paginated retrieval of the global recipe corpus. |
| `/api/feed/personalized` | `GET` | Network-specific content stream. |
| `/api/recipes/{id}/like` | `POST` | Atomic social interaction toggle. |

> [!NOTE]
> All social endpoints require a valid Bearer token in the `Authorization` header.

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the root directory with the following tokens:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

### 2. Instant Launch (Docker)
The entire stack is containerized for seamless local deployment:
```bash
docker-compose up --build
```
- **Live Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8081/api`

---

## 🧪 Quality Assurance
Culinario maintains an **80%+ test coverage** across critical paths:
- **Backend**: JUnit 5 + Mockito for service-layer integrity.
- **Frontend**: Jest + RTL for component-level UI verification.

---

## 📜 Development Status
- [x] JWT Auth Layer & Registration
- [x] Recipe Management & Search
- [x] Social interactions (Follow/Like/Comment)
- [x] Meal Planner & Shopping List
- [ ] Advanced AI Ingredient Suggestions (Upcoming)
