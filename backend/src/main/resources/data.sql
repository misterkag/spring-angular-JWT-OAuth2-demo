
INSERT INTO roles (name) VALUES ('ROLE_USER');
INSERT INTO roles (name) VALUES ('ROLE_MODERATOR');
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');

-- Users Test Insert (password : test)
INSERT INTO users (username, email, password, provider) VALUES 
('admin', 'admin@example.com', '$2a$10$d7PzvuVYYy5os3fl43NFLegoOnRnShf4KMuUKamGE0KBbKenUG4hG', NULL),
('moderator', 'moderator@example.com', '$2a$10$d7PzvuVYYy5os3fl43NFLegoOnRnShf4KMuUKamGE0KBbKenUG4hG', NULL),
('user', 'user@example.com', '$2a$10$d7PzvuVYYy5os3fl43NFLegoOnRnShf4KMuUKamGE0KBbKenUG4hG', NULL);

INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 3), -- admin -> ROLE_ADMIN
(2, 2), -- moderator -> ROLE_MODERATOR
(3, 1); -- user -> ROLE_USER 