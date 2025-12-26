import fs from 'fs';
import { typeDefs } from './index.js'; 

fs.writeFileSync('schema.graphql', typeDefs);
console.log('SDL généré dans schema.graphql');
