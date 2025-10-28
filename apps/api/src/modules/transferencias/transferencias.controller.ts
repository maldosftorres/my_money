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
import { TransferenciasService } from './transferencias.service';
import { 
    CrearTransferenciaDto, 
    ActualizarTransferenciaDto, 
    TransferenciaResponse, 
    ResumenTransferenciasResponse 
} from './transferencias.dto';

@Controller('transferencias')
export class TransferenciasController {
    constructor(private readonly transferenciasService: TransferenciasService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearTransferenciaDto: CrearTransferenciaDto): Promise<TransferenciaResponse> {
        return this.transferenciasService.crear(crearTransferenciaDto);
    }

    @Get()
    async obtenerTodas(
        @Query('usuarioId') usuarioId?: string,
        @Query('mes') mes?: string,
        @Query('cuentaId') cuentaId?: string,
    ): Promise<TransferenciaResponse[]> {
        const userId = usuarioId ? parseInt(usuarioId) : 1; // Defaultear a usuario 1 por ahora
        const ctaId = cuentaId ? parseInt(cuentaId) : undefined;
        return this.transferenciasService.obtenerTodas(userId, mes, ctaId);
    }

    @Get('resumen/:usuarioId')
    async obtenerResumen(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('mes') mes?: string,
    ): Promise<ResumenTransferenciasResponse> {
        return this.transferenciasService.obtenerResumen(usuarioId, mes);
    }

    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<TransferenciaResponse> {
        return this.transferenciasService.obtenerPorId(id);
    }

    @Put(':id')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarTransferenciaDto: ActualizarTransferenciaDto,
    ): Promise<TransferenciaResponse> {
        return this.transferenciasService.actualizar(id, actualizarTransferenciaDto);
    }

    @Put(':id/completar')
    async completarTransferencia(@Param('id', ParseIntPipe) id: number): Promise<TransferenciaResponse> {
        return this.transferenciasService.completarTransferencia(id);
    }

    @Put(':id/marcar-pendiente')
    async marcarComoPendiente(@Param('id', ParseIntPipe) id: number): Promise<TransferenciaResponse> {
        return this.transferenciasService.marcarComoPendiente(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.transferenciasService.eliminar(id);
    }
}