import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ConsumosTarjetaService } from './consumos-tarjeta.service';
import { 
    CrearConsumoTarjetaDto, 
    ActualizarConsumoTarjetaDto, 
    ConsumoTarjetaResponse,
    ResumenConsumosTarjetaResponse
} from './consumos-tarjeta.dto';

@Controller('consumos-tarjeta')
export class ConsumosTarjetaController {
    constructor(private readonly consumosTarjetaService: ConsumosTarjetaService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearConsumoTarjetaDto: CrearConsumoTarjetaDto): Promise<ConsumoTarjetaResponse> {
        return this.consumosTarjetaService.crear(crearConsumoTarjetaDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('tarjetaId') tarjetaId?: string,
        @Query('mes') mes?: string,
        @Query('categoriaId') categoriaId?: string,
    ): Promise<ConsumoTarjetaResponse[]> {
        const tarjId = tarjetaId ? parseInt(tarjetaId) : undefined;
        const catId = categoriaId ? parseInt(categoriaId) : undefined;
        return this.consumosTarjetaService.obtenerTodos(usuarioId, tarjId, mes, catId);
    }

    @Get('resumen/:usuarioId')
    async obtenerResumenPorTarjeta(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<ResumenConsumosTarjetaResponse[]> {
        return this.consumosTarjetaService.obtenerResumenPorTarjeta(usuarioId, mes);
    }

    @Get('recurrentes/:usuarioId')
    async obtenerConsumosRecurrentes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
    ): Promise<ConsumoTarjetaResponse[]> {
        return this.consumosTarjetaService.obtenerConsumosRecurrentes(usuarioId);
    }

    @Post('duplicar-recurrentes/:usuarioId')
    async duplicarRecurrentes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Body('mesDestino') mesDestino: string,
    ): Promise<{ duplicados: number; errores: string[] }> {
        return this.consumosTarjetaService.duplicarRecurrentes(usuarioId, mesDestino);
    }

    @Get('total-mes/:tarjetaId')
    async obtenerTotalMesActual(
        @Param('tarjetaId', ParseIntPipe) tarjetaId: number,
    ): Promise<{ total: number }> {
        const total = await this.consumosTarjetaService.obtenerTotalMesActual(tarjetaId);
        return { total };
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<ConsumoTarjetaResponse> {
        return this.consumosTarjetaService.obtenerPorId(id);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarConsumoTarjetaDto: ActualizarConsumoTarjetaDto,
    ): Promise<ConsumoTarjetaResponse> {
        return this.consumosTarjetaService.actualizar(id, actualizarConsumoTarjetaDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.consumosTarjetaService.eliminar(id);
    }
}