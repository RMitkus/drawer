-- init.sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item VARCHAR(255) NOT NULL,
    count INT NOT NULL,
    userid INT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id)
);

-- Insert initial data
INSERT INTO users (email, name, secret) VALUES ('user1@example.com', 'User One', 'secret1');
INSERT INTO users (email, name, secret) VALUES ('user2@example.com', 'User Two', 'secret2');

INSERT INTO items (item, count, userid) VALUES ('item1', 10, 1);
INSERT INTO items (item, count, userid) VALUES ('item2', 5, 2);
