import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

export function generateDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Wend API',
      version: '1.0.0',
      description: 'Group travel planning and expense management API',
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
  }) as unknown as Record<string, unknown>;
}
