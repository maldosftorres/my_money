import { Module } from '@nestjs/common';
import { MovimientosController } from './movimientos.controller';
import { MovimientosService } from './movimientos.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [MovimientosController],
    providers: [MovimientosService],
    exports: [MovimientosService],
})
export class MovimientosModule {}