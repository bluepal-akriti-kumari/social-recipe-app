-- V4__seed_default_user.sql
INSERT INTO users (username, email, password, bio, profile_picture_url, cover_picture_url)
VALUES ('Akriti jha', 'akriti@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM9M/B8fQY0C', 'Culinary enthusiast & Social Recipe App explorer!', 'https://res.cloudinary.com/dnd2b1vhj/image/upload/v1710586000/profiles/default_avatar.png', 'https://res.cloudinary.com/dnd2b1vhj/image/upload/v1710586000/covers/default_cover.jpg')
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE username = 'Akriti jha'
ON CONFLICT DO NOTHING;
