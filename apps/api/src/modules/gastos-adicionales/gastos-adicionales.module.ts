import { Module } from '@nestjs/common';
import { GastosAdicionalesController } from './gastos-adicionales.controller';
import { GastosAdicionalesService } from './gastos-adicionales.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [GastosAdicionalesController],
    providers: [GastosAdicionalesService],
    exports: [GastosAdicionalesService],
})
export class GastosAdicionalesModule {}