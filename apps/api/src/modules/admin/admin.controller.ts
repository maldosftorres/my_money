import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { AdminService } from './admin.service'
import { CreateUsuarioDto, UpdateUsuarioDto, UpdateEstadoUsuarioDto } from './admin.dto'
import { AuthGuard } from '../auth/auth.guard'

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('usuarios')
    async getAllUsuarios(@Request() req) {
        return this.adminService.getAllUsuarios(req.user.id)
    }

    @Post('usuarios')
    async createUsuario(@Request() req, @Body() createUsuarioDto: CreateUsuarioDto) {
        return this.adminService.createUsuario(req.user.id, createUsuarioDto)
    }

    @Put('usuarios/:id')
    async updateUsuario(
        @Request() req,
        @Param('id') id: string,
        @Body() updateUsuarioDto: UpdateUsuarioDto
    ) {
        return this.adminService.updateUsuario(req.user.id, parseInt(id), updateUsuarioDto)
    }

    @Patch('usuarios/:id/estado')
    async updateEstadoUsuario(
        @Request() req,
        @Param('id') id: string,
        @Body() updateEstadoDto: UpdateEstadoUsuarioDto
    ) {
        return this.adminService.updateEstadoUsuario(req.user.id, parseInt(id), updateEstadoDto)
    }

    @Delete('usuarios/:id')
    async deleteUsuario(@Request() req, @Param('id') id: string) {
        return this.adminService.deleteUsuario(req.user.id, parseInt(id))
    }

    // Endpoints para logs del sistema
    @Get('logs')
    async getLogs(@Request() req) {
        return this.adminService.getLogs(req.user.id)
    }

    @Get('logs/activity')
    async getActivityLogs(@Request() req) {
        return this.adminService.getActivityLogs(req.user.id)
    }

    @Get('logs/errors')
    async getErrorLogs(@Request() req) {
        return this.adminService.getErrorLogs(req.user.id)
    }
}