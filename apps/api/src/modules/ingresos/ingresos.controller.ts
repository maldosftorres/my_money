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
    ): Promise<IngresoResponse[]> {
        return this.ingresosService.obtenerTodos(usuarioId, mes);
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
    async marcarComoPagado(@Param('id', ParseIntPipe) id: number): Promise<IngresoResponse> {
        return this.ingresosService.marcarComoPagado(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.ingresosService.eliminar(id);
    }
}