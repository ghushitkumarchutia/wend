import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry.js';

export function generateDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Wend API',
      version: '1.0.0',
      description: 'API documentation for Wend — collaborative trip planning platform',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Main API',
      },
    ],
  });
}
