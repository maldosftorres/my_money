import { Module } from '@nestjs/common';
import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TransferenciasController],
    providers: [TransferenciasService],
})
export class TransferenciasModule {}