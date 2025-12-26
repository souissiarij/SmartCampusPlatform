import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Setup path helpers for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data.db');

const typeDefs = `#graphql
  type Citizen {
    id: ID!
    name: String
    email: String
    password: String
    isAsthmatic: Boolean
  }
  type Query {
    login(email: String!, password: String!): Citizen
    citizen(id: ID!): Citizen
  }
`;

// Connexion SQLite
const dbPromise = open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

const resolvers = {
  Query: {
    citizen: async (_, { id }) => {
      const db = await dbPromise;
      const row = await db.get("SELECT * FROM citizens WHERE id = ?", [id]);
      if (!row) return null;
      return { ...row, isAsthmatic: !!row.isAsthmatic };
    },
    login: async (_, { email, password }) => {
      console.log(`Tentative de login pour: ${email}`);
      const db = await dbPromise;
      const row = await db.get(
        "SELECT * FROM citizens WHERE email = ? AND password = ?",
        [email, password]
      );
      if (!row) {
        console.log("Utilisateur non trouvé ou mot de passe incorrect.");
        return null;
      }
      return { ...row, isAsthmatic: !!row.isAsthmatic };
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, { listen: { port: 3003 } });
console.log(`Student Service (GraphQL) ready at: ${url}`);
console.log(` Connected to database at: ${DB_PATH}`);