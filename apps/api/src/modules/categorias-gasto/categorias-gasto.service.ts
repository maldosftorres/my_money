import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database.service';
import { 
    CrearCategoriaGastoDto, 
    ActualizarCategoriaGastoDto,
    CategoriaGastoResponse
} from './categorias-gasto.dto';

@Injectable()
export class CategoriasGastoService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearCategoriaGastoDto: CrearCategoriaGastoDto): Promise<CategoriaGastoResponse> {
        const { usuario_id, nombre, es_fijo, activo } = crearCategoriaGastoDto;
        
        const result = await this.db.query(
            `INSERT INTO categorias_gasto (usuario_id, nombre, es_fijo, activo) 
             VALUES (?, ?, ?, ?)`,
            [usuario_id, nombre, es_fijo || false, activo !== false]
        ) as any;

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number): Promise<CategoriaGastoResponse[]> {
        const result = await this.db.query(
            `SELECT * FROM categorias_gasto 
             WHERE usuario_id = ? AND activo = 1 
             ORDER BY nombre ASC`,
            [usuarioId]
        );

        return Array.isArray(result) ? result as CategoriaGastoResponse[] : [result].filter(Boolean) as CategoriaGastoResponse[];
    }

    async obtenerPorId(id: number): Promise<CategoriaGastoResponse> {
        const result = await this.db.query(
            'SELECT * FROM categorias_gasto WHERE id = ?',
            [id]
        );

        const rows = Array.isArray(result) ? result : [result].filter(Boolean);
        
        if (rows.length === 0) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }

        return rows[0] as CategoriaGastoResponse;
    }

    async actualizar(id: number, actualizarCategoriaGastoDto: ActualizarCategoriaGastoDto): Promise<CategoriaGastoResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarCategoriaGastoDto).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        valores.push(id);

        await this.db.query(
            `UPDATE categorias_gasto SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        await this.db.query(
            'UPDATE categorias_gasto SET activo = 0 WHERE id = ?',
            [id]
        );
    }
}