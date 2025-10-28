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
import { GastosFijosService } from './gastos-fijos.service';
import { CrearGastoFijoDto, ActualizarGastoFijoDto, GastoFijoResponse } from './gastos-fijos.dto';

@Controller('gastos-fijos')
export class GastosFijosController {
    constructor(private readonly gastosFijosService: GastosFijosService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearGastoFijoDto: CrearGastoFijoDto): Promise<GastoFijoResponse> {
        return this.gastosFijosService.crear(crearGastoFijoDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes?: string,
        @Query('soloActivos') soloActivos?: string,
    ): Promise<GastoFijoResponse[]> {
        const activos = soloActivos === 'true';
        return this.gastosFijosService.obtenerTodos(usuarioId, mes, activos);
    }

    @Get('vencimientos/:usuarioId')
    async obtenerVencimientosProximos(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('dias', ParseIntPipe) dias: number = 7,
    ): Promise<GastoFijoResponse[]> {
        return this.gastosFijosService.obtenerVencimientosProximos(usuarioId, dias);
    }

    @Get('total/:usuarioId')
    async obtenerTotalPorMes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<{ total: number }> {
        const total = await this.gastosFijosService.obtenerTotalPorMes(usuarioId, mes);
        return { total };
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<GastoFijoResponse> {
        return this.gastosFijosService.obtenerPorId(id);
    }

    @Put('actualizar-vencidos/:usuarioId')
    async actualizarEstadosVencidos(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
    ): Promise<{ actualizados: number }> {
        const actualizados = await this.gastosFijosService.actualizarEstadosVencidos(usuarioId);
        return { actualizados };
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarGastoFijoDto: ActualizarGastoFijoDto,
    ): Promise<GastoFijoResponse> {
        return this.gastosFijosService.actualizar(id, actualizarGastoFijoDto);
    }

    @Put(':id/pagar')
    async marcarComoPagado(
        @Param('id', ParseIntPipe) id: number,
        @Body() body?: { fechaPago?: string }
    ): Promise<GastoFijoResponse> {
        if (body?.fechaPago) {
            return this.gastosFijosService.marcarComoPagadoConFecha(id, body.fechaPago);
        }
        return this.gastosFijosService.marcarComoPagado(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.gastosFijosService.eliminar(id);
    }

    @Delete(':id/recurrentes')
    async eliminarGastosRecurrentes(
        @Param('id', ParseIntPipe) id: number
    ): Promise<{ eliminados: number; message: string }> {
        const result = await this.gastosFijosService.eliminarGastosRecurrentes(id);
        return {
            ...result,
            message: `Se eliminaron ${result.eliminados} gastos fijos recurrentes pendientes`
        };
    }
}