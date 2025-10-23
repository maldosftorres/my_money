import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { EnvService } from './env.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [DatabaseService, EnvService],
    exports: [DatabaseService, EnvService],
})
export class DatabaseModule { }