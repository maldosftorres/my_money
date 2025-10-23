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
  async obtenerTodas(@Query('usuario_id') usuarioId: number, @Query('activas') activas?: boolean) {
    if (activas === true) {
      return await this.cuentasService.obtenerActivas(usuarioId);
    }
    return await this.cuentasService.obtenerTodas(usuarioId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: number) {
    return await this.cuentasService.obtenerPorId(id);
  }

  @Get(':id/saldo')
  async obtenerSaldo(@Param('id') id: number) {
    const saldo = await this.cuentasService.obtenerSaldoCalculado(id);
    return { cuenta_id: id, saldo_actual: saldo };
  }

  @Put(':id')
  async actualizar(@Param('id') id: number, @Body() actualizarCuentaDto: ActualizarCuentaDto) {
    return await this.cuentasService.actualizar(id, actualizarCuentaDto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: number) {
    await this.cuentasService.eliminar(id);
    return { message: 'Cuenta eliminada correctamente' };
  }
}