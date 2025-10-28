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
import { MovimientosService } from './movimientos.service';
import { 
    CrearMovimientoDto, 
    TransferirDto,
    ActualizarMovimientoDto, 
    MovimientoResponse,
    HistorialCuentaResponse
} from './movimientos.dto';

@Controller('movimientos')
export class MovimientosController {
    constructor(private readonly movimientosService: MovimientosService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearMovimientoDto: CrearMovimientoDto): Promise<MovimientoResponse> {
        return this.movimientosService.crear(crearMovimientoDto);
    }

    @Post('transferir')
    @HttpCode(HttpStatus.CREATED)
    async transferir(@Body() transferirDto: TransferirDto): Promise<{ movimiento: MovimientoResponse; mensaje: string }> {
        return this.movimientosService.transferir(transferirDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('cuentaId') cuentaId?: string,
        @Query('tipo') tipo?: string,
        @Query('mes') mes?: string,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('busqueda') busqueda?: string,
        @Query('montoMin') montoMin?: string,
        @Query('montoMax') montoMax?: string,
    ): Promise<MovimientoResponse[]> {
        const ctaId = cuentaId ? parseInt(cuentaId) : undefined;
        return this.movimientosService.obtenerTodos(usuarioId, ctaId, tipo, mes, fechaInicio, fechaFin, busqueda, montoMin, montoMax);
    }

    @Get('ultimos/:usuarioId')
    async obtenerUltimosMovimientos(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('limite', ParseIntPipe) limite: number = 10,
    ): Promise<MovimientoResponse[]> {
        return this.movimientosService.obtenerUltimosMovimientos(usuarioId, limite);
    }

    @Get('historial/:cuentaId')
    async obtenerHistorialCuenta(
        @Param('cuentaId', ParseIntPipe) cuentaId: number,
        @Query('mes') mes?: string,
    ): Promise<HistorialCuentaResponse> {
        return this.movimientosService.obtenerHistorialCuenta(cuentaId, mes);
    }

    @Get('saldo/:cuentaId')
    async calcularSaldoCuenta(
        @Param('cuentaId', ParseIntPipe) cuentaId: number,
        @Query('mes') mes?: string,
    ): Promise<{ saldo: number }> {
        const saldo = await this.movimientosService.calcularSaldoCuenta(cuentaId, mes);
        return { saldo };
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<MovimientoResponse> {
        return this.movimientosService.obtenerPorId(id);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarMovimientoDto: ActualizarMovimientoDto,
    ): Promise<MovimientoResponse> {
        return this.movimientosService.actualizar(id, actualizarMovimientoDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.movimientosService.eliminar(id);
    }
}