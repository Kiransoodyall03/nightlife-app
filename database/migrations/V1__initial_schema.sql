CREATE TABLE "user" (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_authentication_key VARCHAR(64) NOT NULL,
  user_name VARCHAR(16) NOT NULL,
  group_id INTEGER DEFAULT NULL
);

CREATE TABLE "group" (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  group_name VARCHAR(16) NOT NULL,
  group_code VARCHAR(7) NOT NULL
);

CREATE TABLE filter (
  filter_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER DEFAULT NULL,
  group_id INTEGER DEFAULT NULL,
  preferred_location_types VARCHAR(255) DEFAULT NULL,
  max_distance INTEGER DEFAULT 10,
  price_range VARCHAR(10) DEFAULT 'medium',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE user_setting (
  user_setting_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER NOT NULL,
  dark_mode BOOLEAN DEFAULT FALSE,
  font_size VARCHAR(10) DEFAULT 'medium',
  theme_color VARCHAR(16) DEFAULT 'blue'
);

CREATE TABLE location (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  location_name VARCHAR(64) NOT NULL,
  location_type VARCHAR(16) NOT NULL,
  location_address VARCHAR(128) NOT NULL,
  price_range VARCHAR(10) DEFAULT 'medium',
  distance_from_user INTEGER DEFAULT 5
);

CREATE TABLE swipe (
  swipe_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  swipe_action VARCHAR(10) NOT NULL,
  group_id INTEGER DEFAULT NULL,
  swipe_timestamp TIMESTAMP
);

CREATE TABLE group_decision (
  group_decision_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  group_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  decision_timestamp TIMESTAMP
);

ALTER TABLE group_decision ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES "group"(group_id);
ALTER TABLE group_decision ADD CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES location(location_id);
ALTER TABLE swipe ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(user_id);
ALTER TABLE swipe ADD CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES location(location_id);
ALTER TABLE swipe ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES "group"(group_id);
ALTER TABLE "user" ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES "group"(group_id);
ALTER TABLE user_setting ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(user_id);
ALTER TABLE filter ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(user_id);
ALTER TABLE filter ADD CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES "group"(group_id);
