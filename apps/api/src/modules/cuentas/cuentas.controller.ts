import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { CrearCuentaDto, ActualizarCuentaDto } from './cuentas.dto';

@Controller('cuentas')
export class CuentasController {
  constructor(private cuentasService: CuentasService) {}

  @Post()
  async crear(@Body() crearCuentaDto: CrearCuentaDto) {
    return await this.cuentasService.crear(crearCuentaDto);
  }

  @Get()
  async obtenerTodas(@Query('usuario_id') usuarioId?: string, @Query('activas') activas?: string) {
    const userId = usuarioId ? parseInt(usuarioId) : 1; // Defaultear a usuario 1
    if (activas === 'true') {
      return await this.cuentasService.obtenerActivas(userId);
    }
    return await this.cuentasService.obtenerTodas(userId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.cuentasService.obtenerPorId(parseInt(id));
  }

  @Get(':id/saldo')
  async obtenerSaldo(@Param('id') id: string) {
    const cuentaId = parseInt(id);
    const saldo = await this.cuentasService.obtenerSaldoCalculado(cuentaId);
    return { cuenta_id: cuentaId, saldo_actual: saldo };
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() actualizarCuentaDto: ActualizarCuentaDto) {
    return await this.cuentasService.actualizar(parseInt(id), actualizarCuentaDto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.cuentasService.eliminar(parseInt(id));
    return { message: 'Cuenta eliminada correctamente' };
  }
}