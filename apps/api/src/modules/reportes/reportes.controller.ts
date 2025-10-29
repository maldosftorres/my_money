import {
    Controller,
    Get,
    Post,
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
    ComparativoMesesResponse,
    SaldoAcumuladoResponse,
    ResumenConSaldoAcumuladoResponse
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

    @Get('saldo-acumulado/:usuarioId')
    async obtenerSaldosAcumulados(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('meses') meses: string = '12',
    ): Promise<SaldoAcumuladoResponse[]> {
        return this.reportesService.obtenerSaldosAcumulados(usuarioId, parseInt(meses));
    }

    @Post('saldo-acumulado/:usuarioId/calcular')
    async calcularSaldoAcumulado(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<{ saldo_acumulado: number }> {
        const saldo = await this.reportesService.calcularSaldoAcumulado(usuarioId, mes);
        return { saldo_acumulado: saldo };
    }

    @Post('saldo-acumulado/:usuarioId/actualizar')
    async actualizarSaldoAcumulado(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<{ mensaje: string }> {
        await this.reportesService.actualizarSaldoAcumulado(usuarioId, mes);
        return { mensaje: 'Saldo acumulado actualizado correctamente' };
    }

    @Get('resumen-completo/:usuarioId')
    async obtenerResumenCompleto(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes: string,
    ): Promise<ResumenConSaldoAcumuladoResponse> {
        const resumen = await this.reportesService.obtenerResumenMes(usuarioId, mes);
        const saldoAcumulado = await this.reportesService.calcularSaldoAcumulado(usuarioId, mes);
        
        return {
            ...resumen,
            saldo_acumulado: saldoAcumulado
        };
    }
}