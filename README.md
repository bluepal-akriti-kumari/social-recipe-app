# Social Recipe App

A modern social cooking platform where users can share recipes with photos, follow their favorite chefs, and discover new dishes by ingredients.

![App Screenshot](https://via.placeholder.com/1200x600?text=Social+Recipe+App+Interface)

## Features

- **Personalized Feed**: A curated list of recipes from people you follow.
- **Explore Feed**: Discover the newest and most popular recipes from the community.
- **Recipe Creation**: Multi-step form with Cloudinary-powered photo uploads and client-side previews.
- **Social Interactions**: Like recipes, follow/unfollow cooks, and participate in threaded discussions.
- **Full-Text Search**: Fast and accurate search by recipe title or ingredient names using PostgreSQL GIN indexes.
- **Infinite Scroll**: Seamless browsing experience with cursor-based pagination.
- **User Profiles**: Showcase your recipes and liked dishes.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Material UI, Redux Toolkit, React Query.
- **Backend**: Spring Boot 3, Spring Data JPA, Spring Security, Flyway.
- **Database**: PostgreSQL (with Full-Text Search).
- **External**: Cloudinary (Media Storage).

## Setup & Run

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Environment Variables

Create a `.env` file in the root directory and add your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secure_jwt_secret
```

### Running with Docker

The entire stack can be started with a single command:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8081/api](http://localhost:8081/api)
- **Database**: `localhost:5432` (Internal use)

## Implementation Details

- **Cursor-based Pagination**: Uses `createdAt` timestamp for stable and efficient infinite scrolling on Explore, Personalized, and Profile feeds.
- **Full-Text Search**: High-performance PostgreSQL `GIN` indexes on ingredient names for accurate discovery.
- **Threaded Comments**: Self-referencing entity structure with recursive frontend rendering for nested discussions.
- **Atomic Interactions**: Optimized like/comment toggles using atomic repository-level count updates to ensure data integrity under high concurrent load.

## License

MIT License
