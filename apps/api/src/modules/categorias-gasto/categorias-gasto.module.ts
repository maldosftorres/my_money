import { Module } from '@nestjs/common';
import { CategoriasGastoController } from './categorias-gasto.controller';
import { CategoriasGastoService } from './categorias-gasto.service';
import { DatabaseModule } from '../../core/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriasGastoController],
  providers: [CategoriasGastoService],
  exports: [CategoriasGastoService],
})
export class CategoriasGastoModule {}