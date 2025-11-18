import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database.service';
import { CrearCuentaDto, ActualizarCuentaDto, CuentaResponse } from './cuentas.dto';

@Injectable()
export class CuentasService {
  constructor(private databaseService: DatabaseService) {}

  async crear(crearCuentaDto: CrearCuentaDto): Promise<CuentaResponse> {
    const result = await this.databaseService.query(
      `INSERT INTO cuentas (usuario_id, nombre, tipo, saldo_inicial, moneda, activa)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crearCuentaDto.usuario_id,
        crearCuentaDto.nombre,
        crearCuentaDto.tipo,
        crearCuentaDto.saldo_inicial,
        crearCuentaDto.moneda,
        crearCuentaDto.activa ?? true,
      ]
    ) as any;

    return this.obtenerPorId(result.insertId);
  }

  async obtenerTodas(usuarioId: number): Promise<CuentaResponse[]> {
    const result = await this.databaseService.query(
      `SELECT id, usuario_id, nombre, tipo, saldo_inicial, moneda, activa,
              creado_en, actualizado_en
       FROM cuentas 
       WHERE usuario_id = ? 
       ORDER BY nombre`,
      [usuarioId]
    );
    return Array.isArray(result) ? result as CuentaResponse[] : [result].filter(Boolean) as CuentaResponse[];
  }

  async obtenerActivas(usuarioId: number): Promise<CuentaResponse[]> {
    const result = await this.databaseService.query(
      `SELECT id, usuario_id, nombre, tipo, saldo_inicial, moneda, activa,
              creado_en, actualizado_en
       FROM cuentas 
       WHERE usuario_id = ? AND activa = 1
       ORDER BY nombre`,
      [usuarioId]
    );
    return Array.isArray(result) ? result as CuentaResponse[] : [result].filter(Boolean) as CuentaResponse[];
  }

  async obtenerPorId(id: number): Promise<CuentaResponse> {
    const result = await this.databaseService.query(
      `SELECT id, usuario_id, nombre, tipo, saldo_inicial, moneda, activa,
              creado_en, actualizado_en
       FROM cuentas 
       WHERE id = ?`,
      [id]
    );

    const cuentas = Array.isArray(result) ? result : [result].filter(Boolean);
    
    if (cuentas.length === 0) {
      throw new Error('Cuenta no encontrada');
    }

    return cuentas[0] as CuentaResponse;
  }

  async actualizar(id: number, actualizarCuentaDto: ActualizarCuentaDto): Promise<CuentaResponse> {
    const campos = [];
    const valores = [];

    if (actualizarCuentaDto.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(actualizarCuentaDto.nombre);
    }

    if (actualizarCuentaDto.tipo !== undefined) {
      campos.push('tipo = ?');
      valores.push(actualizarCuentaDto.tipo);
    }

    if (actualizarCuentaDto.saldo_inicial !== undefined) {
      campos.push('saldo_inicial = ?');
      valores.push(actualizarCuentaDto.saldo_inicial);
    }

    if (actualizarCuentaDto.moneda !== undefined) {
      campos.push('moneda = ?');
      valores.push(actualizarCuentaDto.moneda);
    }

    if (actualizarCuentaDto.activa !== undefined) {
      campos.push('activa = ?');
      valores.push(actualizarCuentaDto.activa);
    }

    if (campos.length === 0) {
      return this.obtenerPorId(id);
    }

    valores.push(id);

    await this.databaseService.query(
      `UPDATE cuentas SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<void> {
    await this.databaseService.query(
      'DELETE FROM cuentas WHERE id = ?',
      [id]
    );
  }

  async obtenerSaldoCalculado(cuentaId: number): Promise<number> {
    const resultado = await this.databaseService.query(
      `SELECT 
         c.saldo_inicial +
         COALESCE(SUM(CASE 
           WHEN m.cuenta_destino_id = ? THEN m.monto 
           WHEN m.cuenta_origen_id = ? THEN -m.monto 
           ELSE 0 
         END), 0) as saldo_actual
       FROM cuentas c
       LEFT JOIN movimientos m ON (m.cuenta_destino_id = ? OR m.cuenta_origen_id = ?)
       WHERE c.id = ?
       GROUP BY c.id, c.saldo_inicial`,
      [cuentaId, cuentaId, cuentaId, cuentaId, cuentaId]
    );

    return resultado.length > 0 ? parseFloat((resultado[0] as any).saldo_actual) : 0;
  }
}