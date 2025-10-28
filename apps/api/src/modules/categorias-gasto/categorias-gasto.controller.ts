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
import { CategoriasGastoService } from './categorias-gasto.service';
import { 
    CrearCategoriaGastoDto, 
    ActualizarCategoriaGastoDto,
    CategoriaGastoResponse
} from './categorias-gasto.dto';

@Controller('categorias-gasto')
export class CategoriasGastoController {
    constructor(private readonly categoriasGastoService: CategoriasGastoService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() crearCategoriaGastoDto: CrearCategoriaGastoDto): Promise<CategoriaGastoResponse> {
        return this.categoriasGastoService.crear(crearCategoriaGastoDto);
    }

    @Get()
    async obtenerTodos(
        @Query('usuario_id') usuarioId?: string,
    ): Promise<CategoriaGastoResponse[]> {
        const userId = usuarioId ? parseInt(usuarioId) : 1; // Defaultear a usuario 1
        return this.categoriasGastoService.obtenerTodos(userId);
    }

    @Get(':id')
    async obtenerPorId(@Param('id') id: string): Promise<CategoriaGastoResponse> {
        return this.categoriasGastoService.obtenerPorId(parseInt(id));
    }

    @Put(':id')
    async actualizar(
        @Param('id') id: string,
        @Body() actualizarCategoriaGastoDto: ActualizarCategoriaGastoDto,
    ): Promise<CategoriaGastoResponse> {
        return this.categoriasGastoService.actualizar(parseInt(id), actualizarCategoriaGastoDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminar(@Param('id') id: string): Promise<void> {
        return this.categoriasGastoService.eliminar(parseInt(id));
    }
}