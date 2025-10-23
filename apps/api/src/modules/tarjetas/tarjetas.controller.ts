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
import { TarjetasService } from './tarjetas.service';
import { 
    CrearTarjetaDto, 
    ActualizarTarjetaDto, 
    PagarResumenDto,
    TarjetaResponse, 
    EstadisticasTarjetaResponse 
} from './tarjetas.dto';

@Controller('tarjetas')
export class TarjetasController {
    constructor(private readonly tarjetasService: TarjetasService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearTarjetaDto: CrearTarjetaDto): Promise<TarjetaResponse> {
        return this.tarjetasService.crear(crearTarjetaDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('soloActivas') soloActivas?: string,
    ): Promise<TarjetaResponse[]> {
        const activas = soloActivas === 'true';
        return this.tarjetasService.obtenerTodos(usuarioId, activas);
    }

    @Get('vencimientos/:usuarioId')
    async obtenerTarjetasConVencimientosProximos(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('dias', ParseIntPipe) dias: number = 7,
    ): Promise<TarjetaResponse[]> {
        return this.tarjetasService.obtenerTarjetasConVencimientosProximos(usuarioId, dias);
    }

    @Get('estadisticas/:usuarioId')
    async obtenerEstadisticas(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('tarjetaId') tarjetaId?: string,
        @Query('meses', ParseIntPipe) meses: number = 6,
    ): Promise<EstadisticasTarjetaResponse[]> {
        const tarjId = tarjetaId ? parseInt(tarjetaId) : undefined;
        return this.tarjetasService.obtenerEstadisticas(usuarioId, tarjId, meses);
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<TarjetaResponse> {
        return this.tarjetasService.obtenerPorId(id);
    }

    @Post(':id/pagar')
    async pagarResumen(
        @Param('id', ParseIntPipe) id: number,
        @Body() pagarResumenDto: PagarResumenDto,
    ): Promise<{ mensaje: string; transaccion_id?: number }> {
        return this.tarjetasService.pagarResumen(id, pagarResumenDto);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarTarjetaDto: ActualizarTarjetaDto,
    ): Promise<TarjetaResponse> {
        return this.tarjetasService.actualizar(id, actualizarTarjetaDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.tarjetasService.eliminar(id);
    }
}