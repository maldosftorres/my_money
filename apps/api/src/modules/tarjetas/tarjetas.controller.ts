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
    TarjetaResponse
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
}