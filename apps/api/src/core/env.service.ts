import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
    constructor(private configService: ConfigService) { }

    get dbHost(): string {
        return this.configService.get<string>('DB_HOST', 'localhost');
    }

    get dbPort(): number {
        return this.configService.get<number>('DB_PORT', 3306);
    }

    get dbUser(): string {
        return this.configService.get<string>('DB_USER', 'root');
    }

    get dbPassword(): string {
        return this.configService.get<string>('DB_PASSWORD', '');
    }

    get dbName(): string {
        return this.configService.get<string>('DB_NAME', 'my_money');
    }

    get nodeEnv(): string {
        return this.configService.get<string>('NODE_ENV', 'development');
    }

    get port(): number {
        return this.configService.get<number>('PORT', 3001);
    }

    get apiPrefix(): string {
        return this.configService.get<string>('API_PREFIX', 'api/v1');
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }
}