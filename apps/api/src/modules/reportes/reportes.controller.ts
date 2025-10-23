import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { 
    ResumenMesResponse,
    DistribucionGastosResponse,
    ResumenCuentasResponse,
    AlertasResponse,
    ComparativoMesesResponse
} from './reportes.dto';

@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) {}

    @Get('resumen/:usuarioId')
    async obtenerResumenMes(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<ResumenMesResponse> {
        return this.reportesService.obtenerResumenMes(usuarioId, mes);
    }

    @Get('distribucion/:usuarioId')
    async obtenerDistribucionGastos(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<DistribucionGastosResponse[]> {
        return this.reportesService.obtenerDistribucionGastos(usuarioId, mes);
    }

    @Get('cuentas/:usuarioId')
    async obtenerResumenCuentas(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<ResumenCuentasResponse[]> {
        return this.reportesService.obtenerResumenCuentas(usuarioId, mes);
    }

    @Get('alertas/:usuarioId')
    async obtenerAlertas(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
    ): Promise<AlertasResponse> {
        return this.reportesService.obtenerAlertas(usuarioId);
    }

    @Get('comparativo/:usuarioId')
    async obtenerComparativoMeses(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<ComparativoMesesResponse> {
        return this.reportesService.obtenerComparativoMeses(usuarioId, mes);
    }
}