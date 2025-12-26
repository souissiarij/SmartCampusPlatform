const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mobility API',
      version: '1.0.0',
      description: 'API for mobility microservice'
    }
  },

  apis: [path.join(__dirname, 'index.js')] 
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };