
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mellow Tools API',
            version: '2.0.0',
            description: 'API Documentation for Mellow Tools application',
        },
        servers: [
            {
                url: 'http://localhost:8080/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/models/*.js'], // files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
