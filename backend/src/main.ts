import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const configuredFrontendOrigin = configService.get<string>('FRONTEND_ORIGIN')
  const frontendOrigin = configuredFrontendOrigin
    ? configuredFrontendOrigin.startsWith('http')
      ? configuredFrontendOrigin
      : `https://${configuredFrontendOrigin}`
    : 'http://localhost:5173'

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: frontendOrigin,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  await app.listen(configService.get<number>('PORT', 3000))
}

void bootstrap()
