import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Write to stderr immediately to ensure Railway captures it
  console.error('🚀 Starting application bootstrap...');
  console.error(`📦 Environment: PORT=${process.env.PORT || 'not set'}, NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
  console.log('🚀 Starting application bootstrap...');
  console.log(`📦 Environment: PORT=${process.env.PORT || 'not set'}, NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
  
  let app: NestExpressApplication;
  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('✅ NestJS application factory created');
    console.error('✅ NestJS application factory created');
  } catch (error: any) {
    console.error('❌ Failed to create NestJS application:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  }

  // Enable CORS with permissive settings
  // Allow healthcheck from Railway's internal network
  app.enableCors({
    origin: true, // Allow all origins (Railway's healthcheck needs this)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  // Log frontend status
  if (hasFrontend) {
    console.log(`✅ Frontend build found at: ${frontendDistPath}`);
  } else {
    console.log(`⚠️  Frontend build not found at: ${frontendDistPath}`);
    console.log(`   Serving API only. Build frontend to enable full-stack mode.`);
  }

  // API prefix (set before catch-all routes)
  app.setGlobalPrefix('api');

  // Register a direct health check endpoint (after prefix is set)
  // This ensures Railway's healthcheck can reach it immediately
  // Bypasses any potential CORS or middleware issues
  app.getHttpAdapter().get('/api/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      message: 'HenryMo Socials API is running!',
      timestamp: new Date().toISOString(),
    });
  });

  if (hasFrontend) {
    // Serve static assets (JS, CSS, images, etc.) from frontend dist
    app.useStaticAssets(frontendDistPath, {
      index: false, // Don't serve index.html automatically
      prefix: '/', // Serve from root path
    });
    
    // Handle root route - serve frontend index.html
    app.getHttpAdapter().get('/', (req: any, res: any) => {
      res.sendFile(join(frontendDistPath, 'index.html'));
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
  } else {
    // Fallback: serve API info at root when frontend not built
    app.getHttpAdapter().get('/', (req: any, res: any) => {
      res.json({
        message: 'HenryMo Socials API',
        version: '1.0',
        documentation: '/api/docs',
        health: '/api',
        status: 'running',
        timestamp: new Date().toISOString(),
        note: 'Frontend not built. Build frontend to enable full-stack mode.',
      });
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

  // Use PORT from environment (Railway assigns this dynamically) or default to 3000
  const port = parseInt(process.env.PORT || '3000', 10);
  console.log(`🔧 Preparing to start server on port: ${port} (PORT env: ${process.env.PORT || 'not set, using default 3000'})`);
  
  try {
    // Listen on 0.0.0.0 to allow external connections (required for Railway)
    await app.listen(port, '0.0.0.0');
    
    // Log startup completion
    const serverUrl = `http://0.0.0.0:${port}`;
    console.log(`🚀 Application is running on: ${serverUrl} (bound to all interfaces)`);
    console.log(`📚 API Documentation: ${serverUrl}/api/docs`);
    console.log(`✅ Health check endpoint: ${serverUrl}/api/health`);
    console.log(`✅ Application is ready and accepting connections`);
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('Error stack:', error?.stack);
    throw error;
  }
}

// Ensure we catch all errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  process.exit(1);
});

