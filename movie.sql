-- Käyttäjät
CREATE TABLE account (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  hashedpassword VARCHAR(255) NOT NULL,
  share_token   VARCHAR(64) UNIQUE
);


CREATE TABLE groups (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  owner_id    INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  password    VARCHAR(255)
);

-- Ryhmän jäsenyydet
CREATE TABLE group_member (
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  role      VARCHAR(50) DEFAULT 'member',
  status    VARCHAR(20) NOT NULL DEFAULT 'approved',
  PRIMARY KEY (group_id, user_id)
);

-- Käyttäjän yksittäiset suosikit (nyt TMDB-ID suoraan)
CREATE TABLE user_favourite (
  user_id   INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  tmdb_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, tmdb_id)
);

-- Käyttäjän nimetty suosikkilista
CREATE TABLE favourite_list (
  id       SERIAL PRIMARY KEY,
  user_id  INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  name     VARCHAR(255) NOT NULL,
  UNIQUE (user_id, name)
);

-- Käyttäjän listan rivit
CREATE TABLE favourite_list_item (
  list_id   INT NOT NULL REFERENCES favourite_list(id) ON DELETE CASCADE,
  tmdb_id   INT NOT NULL,
  position  INT,
  added_at  TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, tmdb_id)
);

-- Ryhmän suosikit
CREATE TABLE group_favourite (
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  tmdb_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (group_id, tmdb_id)
);

CREATE TABLE group_list (
  id        SERIAL PRIMARY KEY,
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name      VARCHAR(255) NOT NULL,
  UNIQUE (group_id, name)
);

-- Ryhmän suosikkilistan rivit
CREATE TABLE group_list_item (
  list_id   INT NOT NULL REFERENCES group_list(id) ON DELETE CASCADE,
  tmdb_id   INT NOT NULL,
  position  INT,
  added_at  TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, tmdb_id)
);

-- Arvostelut
CREATE TABLE review (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  tmdb_id     INT NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text VARCHAR(2000),
  created_at  TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, tmdb_id)
);

CREATE TABLE group_message (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now()
);

-- Elokuvien varaukset
CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES account(id) ON DELETE CASCADE,
  tmdb_id INT NOT NULL,
  screening_date DATE NOT NULL,
  seats INT[] NOT NULL, 
  created_at TIMESTAMP DEFAULT now()
);


