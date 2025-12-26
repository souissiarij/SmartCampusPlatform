# Utilisation d'une image Debian Slim stable
FROM node:18-slim

# Installation des outils nécessaires pour compiler SQLite
RUN apt-get update && \
    apt-get install -y python3 make g++ sqlite3 libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances, reconstruction des modules natifs pour Debian
RUN npm install --build-from-source

# Copie du reste du code
COPY . .

# Exposition du port du microservice
EXPOSE 3002 

# Commande de démarrage
CMD ["node", "index.js"]
