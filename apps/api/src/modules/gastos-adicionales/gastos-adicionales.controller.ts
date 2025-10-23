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
import { GastosAdicionalesService } from './gastos-adicionales.service';
import { 
    CrearGastoAdicionalDto, 
    ActualizarGastoAdicionalDto, 
    GastoAdicionalResponse, 
    DistribucionGastosResponse 
} from './gastos-adicionales.dto';

@Controller('gastos-adicionales')
export class GastosAdicionalesController {
    constructor(private readonly gastosAdicionalesService: GastosAdicionalesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearGastoAdicionalDto: CrearGastoAdicionalDto): Promise<GastoAdicionalResponse> {
        return this.gastosAdicionalesService.crear(crearGastoAdicionalDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes?: string,
        @Query('categoriaId') categoriaId?: string,
    ): Promise<GastoAdicionalResponse[]> {
        const catId = categoriaId ? parseInt(categoriaId) : undefined;
        return this.gastosAdicionalesService.obtenerTodos(usuarioId, mes, catId);
    }

    @Get('distribucion/:usuarioId')
    async obtenerDistribucionPorCategoria(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<DistribucionGastosResponse[]> {
        return this.gastosAdicionalesService.obtenerDistribucionPorCategoria(usuarioId, mes);
    }

    @Get('top5/:usuarioId')
    async obtenerTop5Categorias(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<DistribucionGastosResponse[]> {
        return this.gastosAdicionalesService.obtenerTop5Categorias(usuarioId, mes);
    }

    @Get('estadisticas/:usuarioId/:categoriaId')
    async obtenerEstadisticasPorCategoria(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Param('categoriaId', ParseIntPipe) categoriaId: number,
        @Query('meses', ParseIntPipe) meses: number = 6,
    ): Promise<any> {
        return this.gastosAdicionalesService.obtenerEstadisticasPorCategoria(usuarioId, categoriaId, meses);
    }

    @Get('total/:usuarioId')
    async obtenerTotalPorMes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<{ total: number }> {
        const total = await this.gastosAdicionalesService.obtenerTotalPorMes(usuarioId, mes);
        return { total };
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<GastoAdicionalResponse> {
        return this.gastosAdicionalesService.obtenerPorId(id);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarGastoAdicionalDto: ActualizarGastoAdicionalDto,
    ): Promise<GastoAdicionalResponse> {
        return this.gastosAdicionalesService.actualizar(id, actualizarGastoAdicionalDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.gastosAdicionalesService.eliminar(id);
    }
}