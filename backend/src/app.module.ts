import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomersModule } from "./customers/customers.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>("DATABASE_URL")

        return {
          type: "postgres" as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>("DB_HOST", "localhost"),
                port: configService.get<number>("DB_PORT", 5432),
                username: configService.get<string>("DB_USERNAME", "citron"),
                password: configService.get<string>("DB_PASSWORD", "citron_password"),
                database: configService.get<string>("DB_NAME", "citron"),
              }),
          autoLoadEntities: true,
          synchronize:
            configService.get<string>("DB_SYNCHRONIZE", "false") === "true",
        }
      },
    }),
    CustomersModule,
  ],
})
export class AppModule {}
