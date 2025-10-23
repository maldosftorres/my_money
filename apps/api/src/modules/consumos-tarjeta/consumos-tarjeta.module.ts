import { Module } from '@nestjs/common';
import { ConsumosTarjetaController } from './consumos-tarjeta.controller';
import { ConsumosTarjetaService } from './consumos-tarjeta.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ConsumosTarjetaController],
    providers: [ConsumosTarjetaService],
    exports: [ConsumosTarjetaService],
})
export class ConsumosTarjetaModule {}