-- database.sql
-- SQLite schema + seed data for the Smart City microservices
PRAGMA foreign_keys = ON;

-- CITIZENS
DROP TABLE IF EXISTS citizens;
CREATE TABLE citizens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,    -- pour la démo : mot de passe en clair (REMPLACE en prod)
  isAsthmatic INTEGER NOT NULL DEFAULT 0  -- 0=false, 1=true
);

INSERT INTO citizens (id, name, email, password, isAsthmatic) VALUES
(1,'Mohamed Ali Ben Salem','med.ali@campus.tn','1234',1),
(2,'Fatma Zahra Trabelsi','fatma.z@campus.tn','1234',0),
(3,'Youssef Garbi','youssef@campus.tn','1234',0),
(4,'Mariem Bouazizi','mariem@campus.tn','1234',1),
(5,'Ahmed Snoussi','ahmed@campus.tn','1234',0),
(6,'Khadija Dridi','khadija@campus.tn','1234',0),
(7,'Amine Jlassi','amine@campus.tn','1234',1),
(8,'Sonia Ben Amar','sonia@campus.tn','1234',0),
(9,'Bilel Mejri','bilel@campus.tn','1234',0),
(10,'Imen Cherif','imen@campus.tn','1234',0),
(11,'Walid Tounsi','walid@campus.tn','1234',1),
(12,'Noura Ayari','noura@campus.tn','1234',0),
(13,'Karim Hammami','karim@campus.tn','1234',0),
(14,'Leila Saidi','leila@campus.tn','1234',1),
(15,'Sofiene Jaziri','sofiene@campus.tn','1234',0),
(16,'Rania Mansouri','rania@campus.tn','1234',0),
(17,'Hassen Bejaoui','hassen@campus.tn','1234',1),
(18,'Samia Louati','samia@campus.tn','1234',0),
(19,'Zied Khelifi','zied@campus.tn','1234',0),
(20,'Ines Ghorbel','ines@campus.tn','1234',0);


-- TRANSPORTS
DROP TABLE IF EXISTS transports;
CREATE TABLE transports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  line TEXT,
  status TEXT,
  destination TEXT,
  stops TEXT -- JSON text array
);

INSERT INTO transports (type, line, status, destination, stops) VALUES
('Navette Campus','Circuit Bleu (Résidences)','A l''heure','Bibliothèque Centrale','["Résidence A","Résidence B","Cafétéria Sud","Bibliothèque Centrale"]'),
('Navette Campus','Circuit Rouge (Amphis)','A l''heure','Amphithéâtre Principal','["Parking Est","Laboratoires Sciences","Amphithéâtre Principal"]'),
('Navette Campus','Circuit Vert (Sport)','Retard 5 min','Gymnase','["Résidence C","Piscine Universitaire","Gymnase"]'),
('Vélo Partagé','Station 1 (Entrée)','Disponible','Bâtiment Administration','["Parking Ouest","Bâtiment Administration"]'),
('Vélo Partagé','Station 2 (Labs)','Disponible','Laboratoires Informatique','["Incubateur Startups","Laboratoires Informatique"]'),
('Navette Campus','Express Soir','A l''heure','Résidence A','["Bibliothèque Centrale","Résidence A"]'),
('Navette Campus','Circuit Bleu (Retour)','A l''heure','Parking Est','["Bibliothèque Centrale","Parking Est"]'),
('Vélo Partagé','Station 3 (Cafet)','Disponible','Cafétéria Nord','["Auditorium","Cafétéria Nord"]'),
('Navette Campus','Navette Médicale','A l''heure','Centre Médical','["Bâtiment Administration","Centre Médical"]'),
('Vélo Partagé','Station 4 (Sud)','Disponible','Salle des Associations','["Cafétéria Sud","Salle des Associations"]');

-- EMERGENCY ALERTS
DROP TABLE IF EXISTS alerts;
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  location TEXT,
  severity TEXT,
  description TEXT,
  reporter TEXT,
  phone TEXT,
  injuries TEXT,
  time TEXT   -- stocker l'horodatage en texte pour la démo
);

INSERT INTO alerts (type, location, severity, description, reporter, phone, injuries, time) VALUES
('Incendie','La Marsa','HIGH','Feu dans un commerce local','Habib','+21650000000','2 blessés','2025-12-09 09:30'),
('Accident','Bab Saadoun','MEDIUM','Collision entre 2 voitures','Sarra','+21651111111','aucun','2025-12-09 10:10'),
('Inondation','El Menzah','LOW','Remontée d''eaux suite à pluie','Anonyme','','aucun','2025-12-08 18:00');
