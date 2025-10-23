import { Module } from '@nestjs/common';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [IngresosController],
    providers: [IngresosService],
    exports: [IngresosService],
})
export class IngresosModule {}