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
import { IngresosService } from './ingresos.service';
import { CrearIngresoDto, ActualizarIngresoDto, IngresoResponse } from './ingresos.dto';

@Controller('ingresos')
export class IngresosController {
    constructor(private readonly ingresosService: IngresosService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearIngresoDto: CrearIngresoDto): Promise<IngresoResponse> {
        return this.ingresosService.crear(crearIngresoDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes?: string,
        @Query('estado') estado?: string,
    ): Promise<IngresoResponse[]> {
        return this.ingresosService.obtenerTodos(usuarioId, mes, estado);
    }

    @Get('total/:usuarioId')
    async obtenerTotalPorMes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<{ total: number }> {
        const total = await this.ingresosService.obtenerTotalPorMes(usuarioId, mes);
        return { total };
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<IngresoResponse> {
        return this.ingresosService.obtenerPorId(id);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarIngresoDto: ActualizarIngresoDto,
    ): Promise<IngresoResponse> {
        return this.ingresosService.actualizar(id, actualizarIngresoDto);
    }

    @Put(':id/pagar')
    async marcarComoPagado(
        @Param('id', ParseIntPipe) id: number,
        @Body() body?: { fechaCobro?: string }
    ): Promise<IngresoResponse> {
        return this.ingresosService.marcarComoPagado(id, body?.fechaCobro);
    }

    @Get('recurrentes/:usuarioId')
    async obtenerIngresosRecurrentes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number
    ): Promise<IngresoResponse[]> {
        return this.ingresosService.obtenerIngresosRecurrentes(usuarioId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.ingresosService.eliminar(id);
    }

    @Delete(':id/recurrentes')
    async eliminarIngresosRecurrentes(
        @Param('id', ParseIntPipe) id: number
    ): Promise<{ eliminados: number; message: string }> {
        const result = await this.ingresosService.eliminarIngresosRecurrentes(id);
        return {
            ...result,
            message: `Se eliminaron ${result.eliminados} ingresos recurrentes pendientes`
        };
    }
}