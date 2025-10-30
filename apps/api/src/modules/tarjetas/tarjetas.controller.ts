import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TarjetasService } from './tarjetas.service';
import { 
    CrearTarjetaDto, 
    ActualizarTarjetaDto,
    GastoTarjetaDto,
    PagoTarjetaDto,
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
        @Query('usuario_id') usuarioId?: string,
        @Query('activas') activas?: string,
    ): Promise<TarjetaResponse[]> {
        const userId = usuarioId ? parseInt(usuarioId) : 1; // Defaultear a usuario 1
        const soloActivas = activas === 'true';
        return this.tarjetasService.obtenerTodos(userId, soloActivas);
    }

    @Get(':id')
    async obtenerPorId(@Param('id') id: string): Promise<TarjetaResponse> {
        return this.tarjetasService.obtenerPorId(parseInt(id));
    }

    @Put(':id')
    async actualizar(
        @Param('id') id: string,
        @Body() actualizarTarjetaDto: ActualizarTarjetaDto,
    ): Promise<TarjetaResponse> {
        return this.tarjetasService.actualizar(parseInt(id), actualizarTarjetaDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id') id: string): Promise<void> {
        return this.tarjetasService.eliminar(parseInt(id));
    }

    // NUEVOS ENDPOINTS PARA GASTOS Y PAGOS

    @Post('gasto')
    @HttpCode(HttpStatus.CREATED)
    async registrarGasto(@Body() gastoTarjetaDto: GastoTarjetaDto): Promise<{ movimiento: any; mensaje: string }> {
        return this.tarjetasService.registrarGasto(gastoTarjetaDto);
    }

    @Post('pago')
    @HttpCode(HttpStatus.CREATED)
    async registrarPago(@Body() pagoTarjetaDto: PagoTarjetaDto): Promise<{ movimiento: any; mensaje: string }> {
        return this.tarjetasService.registrarPago(pagoTarjetaDto);
    }

    @Get(':id/estadisticas')
    async obtenerEstadisticas(
        @Param('id') id: string,
        @Query('usuario_id') usuarioId?: string
    ): Promise<EstadisticasTarjetaResponse> {
        const userId = usuarioId ? parseInt(usuarioId) : 1;
        return this.tarjetasService.obtenerEstadisticas(userId, parseInt(id));
    }

    @Get('usuario/:usuarioId/resumen')
    async obtenerResumenUsuario(@Param('usuarioId') usuarioId: string): Promise<{
        total_tarjetas: number;
        tarjetas_activas: number;
        saldo_total_utilizado: number;
        limite_total: number;
        porcentaje_utilizado_global: number;
        proximos_vencimientos: Array<{
            tarjeta_id: number;
            tarjeta_nombre: string;
            proximo_vencimiento: string;
            saldo_utilizado: number;
        }>;
    }> {
        const tarjetas = await this.tarjetasService.obtenerTodos(parseInt(usuarioId));
        
        const resumen = {
            total_tarjetas: tarjetas.length,
            tarjetas_activas: tarjetas.filter(t => t.activa).length,
            saldo_total_utilizado: tarjetas.reduce((sum, t) => sum + t.saldo_utilizado, 0),
            limite_total: tarjetas.reduce((sum, t) => sum + (t.limite || 0), 0),
            porcentaje_utilizado_global: 0,
            proximos_vencimientos: tarjetas
                .filter(t => t.proximo_vencimiento && t.saldo_utilizado > 0)
                .map(t => ({
                    tarjeta_id: t.id,
                    tarjeta_nombre: t.nombre,
                    proximo_vencimiento: t.proximo_vencimiento!,
                    saldo_utilizado: t.saldo_utilizado
                }))
                .sort((a, b) => new Date(a.proximo_vencimiento).getTime() - new Date(b.proximo_vencimiento).getTime())
        };

        if (resumen.limite_total > 0) {
            resumen.porcentaje_utilizado_global = Math.round(
                (resumen.saldo_total_utilizado / resumen.limite_total) * 100
            );
        }

        return resumen;
    }
}