# Social Recipe App - Culinario

Culinario is a modern, community-driven social cooking platform designed to bridge the gap between static recipe sites and dynamic social discovery. It empowers users to share their culinary masterpieces, follow favorite chefs, and discover new dishes through a personalized, interactive experience.

![App Screenshot](https://via.placeholder.com/1200x600?text=Culinario+Social+Recipe+Interface)

## 🎯 Problem Statement
Traditional recipe websites are often static and lack social engagement. Users struggle to find recipes from trusted sources or get real-time feedback. Culinario solves this by providing a social layer where discovery is driven by community interactions, personalized feeds, and a robust search architecture.

## 🚀 Key Features

- **Personalized Feed**: Content curated specifically for you based on the chefs you follow.
- **Explore Feed**: A trending section highlighting the most popular and newest community creations.
- **Recipe Management**: A robust, multi-step creation and edit flow with Cloudinary-powered media management.
- **Social Interaction**: Threaded discussions, atomic like toggles, and chef following.
- **Smart Meal Planner**: Integrated meal planning with auto-generated shopping lists.
- **Robust Validation**: End-to-end data integrity with strict frontend and backend validation rules.
- **Full-Text Search**: Instant recipe discovery using PostgreSQL GIN indexes.

## 🛠️ Architecture & Tech Stack

### Backend (Spring Boot 3.4)
- **Layered Design**: Controller-Service-Repository architecture for clear separation of concerns.
- **Data Integrity**: Jakarta Validation (Bean Validation) enforced across all DTOs.
- **Security**: Stateless JWT-based authentication with Spring Security.
- **Performance**: Cursor-based pagination for stable infinite scrolling.

### Frontend (React 19 + Vite)
- **Component-Driven**: Modular UI built with Material-UI 7.
- **State Management**: Redux Toolkit for auth and global state; React Query for efficient server-state sync.
- **UX/UI**: Modern culinary aesthetic with Framer Motion animations and responsive layouts.

## 🧪 Testing & Quality
- **Unit Testing**: Dedicated validation test suite (`AuthValidationTest`, `RecipeValidationTest`) ensuring data integrity.
- **Debugging**: Documented fixes for complex issues like cascading deletes and port conflicts.

## ⚙️ Setup & Installation

### Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) Java 17+ and Node.js 18+ for local development.

### Environment Variables
Create a `.env` file in the root:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secure_jwt_secret
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
```

### Running with Docker
```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8081/api](http://localhost:8081/api)

## 📄 Documentation

For full technical details, including API endpoints, database schema, and testing results, see the [Project Documentation](PROJECT_DOCUMENTATION.md).

Detailed implementation plans and architecture walkthroughs are available in the `.gemini/antigravity/brain/` directory.

## 📜 License
MIT License
file:///E:/ReceipeApp/ARCHITECTURE_VISUAL.html