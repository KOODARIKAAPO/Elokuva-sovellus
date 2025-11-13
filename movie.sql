-- Käyttäjät
CREATE TABLE account (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  hashedpassword      VARCHAR(255)        NOT NULL
);

-- Elokuvat
CREATE TABLE movie (
  id        SERIAL PRIMARY KEY,
  title     VARCHAR(255) NOT NULL,
  director  VARCHAR(255),
  year      INT,
  genre     VARCHAR(100)
);

CREATE TABLE groups (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  owner_id    INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  password    VARCHAR(255)
);

-- Ryhmän jäsenyydet (moni–moneen käyttäjien ja ryhmien välillä)
CREATE TABLE group_member (
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   INT NOT NULL REFERENCES account(id)   ON DELETE CASCADE,
  role      VARCHAR(50) DEFAULT 'member',
  PRIMARY KEY (group_id, user_id)
);

-- Käyttäjän yksittäiset suosikit (ilman listaa)
CREATE TABLE user_favourite (
  user_id   INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  movie_id  INT NOT NULL REFERENCES movie(id)   ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

-- Käyttäjän nimetty suosikkilista (otsikko)
CREATE TABLE favourite_list (
  id       SERIAL PRIMARY KEY,
  user_id  INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  name     VARCHAR(255) NOT NULL,
  UNIQUE (user_id, name)  -- ei kahta samannimistä listaa samalle käyttäjälle
);

-- Käyttäjän listan rivit
CREATE TABLE favourite_list_item (
  list_id   INT NOT NULL REFERENCES favourite_list(id) ON DELETE CASCADE,
  movie_id  INT NOT NULL REFERENCES movie(id)          ON DELETE CASCADE,
  position  INT,
  added_at  TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, movie_id)
);

-- Ryhmän suosikit (yksittäiset)
CREATE TABLE group_favourite (
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  movie_id  INT NOT NULL REFERENCES movie(id)     ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (group_id, movie_id)
);

CREATE TABLE group_list (
  id        SERIAL PRIMARY KEY,
  group_id  INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name      VARCHAR(255) NOT NULL,
  UNIQUE (group_id, name)
);

--Ryhmän suosikkilista
CREATE TABLE group_list_item (
  list_id   INT NOT NULL REFERENCES group_list(id) ON DELETE CASCADE,
  movie_id  INT NOT NULL REFERENCES movie(id)      ON DELETE CASCADE,
  position  INT,
  added_at  TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, movie_id)
);

-- Arvostelut (yksi per käyttäjä+elokuva)
CREATE TABLE review (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  movie_id   INT NOT NULL REFERENCES movie(id)   ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text VARCHAR(2000),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, movie_id)
);

CREATE TABLE group_message (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now()
);
