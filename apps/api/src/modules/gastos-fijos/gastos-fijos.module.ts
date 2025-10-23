import { Module } from '@nestjs/common';
import { GastosFijosController } from './gastos-fijos.controller';
import { GastosFijosService } from './gastos-fijos.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [GastosFijosController],
    providers: [GastosFijosService],
    exports: [GastosFijosService],
})
export class GastosFijosModule {}