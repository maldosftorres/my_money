import { Module } from '@nestjs/common';
import { TarjetasController } from './tarjetas.controller';
import { TarjetasService } from './tarjetas.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TarjetasController],
    providers: [TarjetasService],
    exports: [TarjetasService],
})
export class TarjetasModule {}