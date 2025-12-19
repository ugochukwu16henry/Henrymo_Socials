import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Serve static files from frontend build (if exists)
  const frontendDistPath = join(__dirname, '..', '..', 'frontend', 'dist');
  const fs = require('fs');
  const hasFrontend = fs.existsSync(frontendDistPath);

  // API prefix (set before catch-all routes)
  app.setGlobalPrefix('api');

  if (hasFrontend) {
    // Serve static assets (JS, CSS, images, etc.) from frontend dist
    app.useStaticAssets(frontendDistPath, {
      index: false, // Don't serve index.html automatically
      prefix: '/', // Serve from root path
    });
    
    // Serve index.html for all non-API routes (SPA routing)
    // This catch-all comes after API prefix, so /api/* routes are handled by controllers
    app.getHttpAdapter().get('*', (req: any, res: any) => {
      // Don't interfere with API routes (already handled by controllers)
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'Not found' });
      }
      // Don't interfere with static assets (files with extensions)
      if (/\.[a-zA-Z0-9]+$/.test(req.url.split('?')[0])) {
        return res.status(404).json({ message: 'Not found' });
      }
      // Serve index.html for all other routes (SPA routing)
      res.sendFile(join(frontendDistPath, 'index.html'));
    });
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HenryMo Socials API')
    .setDescription('Digital Marketing + Social Media + Research & Data Analysis Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

