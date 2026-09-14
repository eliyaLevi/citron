"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const customers_module_1 = require("./customers/customers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const databaseUrl = configService.get("DATABASE_URL");
                    return {
                        type: "postgres",
                        ...(databaseUrl
                            ? { url: databaseUrl }
                            : {
                                host: configService.get("DB_HOST", "localhost"),
                                port: configService.get("DB_PORT", 5432),
                                username: configService.get("DB_USERNAME", "citron"),
                                password: configService.get("DB_PASSWORD", "citron_password"),
                                database: configService.get("DB_NAME", "citron"),
                            }),
                        autoLoadEntities: true,
                        synchronize: configService.get("DB_SYNCHRONIZE", "false") === "true",
                    };
                },
            }),
            customers_module_1.CustomersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map