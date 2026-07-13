import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: [process.env.UI_URL, 'http://localhost:5173'].filter(Boolean) as string[],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
