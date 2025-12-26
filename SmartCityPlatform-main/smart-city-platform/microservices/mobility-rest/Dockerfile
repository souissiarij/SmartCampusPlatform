# On utilise une version Debian Slim (plus stable pour la compilation que Alpine)
FROM node:18-slim

# Installation des outils de compilation (Python, Make, G++)
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Installation standard (SQLite va se compiler ou télécharger le bon binaire Linux)
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "index.js"]