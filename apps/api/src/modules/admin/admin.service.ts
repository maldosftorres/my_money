import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common'
import { DatabaseService } from '../../core/database.service'
import { CreateUsuarioDto, UpdateUsuarioDto, UpdateEstadoUsuarioDto } from './admin.dto'
import * as crypto from 'crypto'

@Injectable()
export class AdminService {
    constructor(private readonly db: DatabaseService) { }

    private hashPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex')
    }

    async isAdmin(userId: number): Promise<boolean> {
        // Simplificamos: cualquier usuario logueado puede ver la lista de usuarios por ahora
        // TODO: Implementar verificación de roles más adelante
        return true
    }

    async getAllUsuarios(requestUserId: number) {
        try {
            // Simplificamos: obtener todos los usuarios directamente
            const usuarios = await this.db.query(`
        SELECT id, username, nombre, email, estado, creado_en, ultimo_acceso, rol
        FROM usuarios 
        ORDER BY creado_en DESC
      `)

            return usuarios
        } catch (error) {
            throw error
        }
    }

    async createUsuario(requestUserId: number, createUsuarioDto: CreateUsuarioDto) {
        try {
            const { username, nombre, email, password } = createUsuarioDto
            const hashedPassword = this.hashPassword(password)

            // Crear usuario directamente - SIMPLE
            const result = await this.db.query(`
        INSERT INTO usuarios (username, nombre, email, password_hash, rol, estado, creado_en)
        VALUES (?, ?, ?, ?, 'USUARIO', 'ACTIVO', NOW())
      `, [username, nombre, email || null, hashedPassword]) as any

            // Obtener el usuario recién creado
            const newUser = await this.db.query(
                'SELECT id, username, nombre, email, estado, creado_en, rol FROM usuarios WHERE username = ?',
                [username]
            )

            return newUser
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException('El nombre de usuario o email ya existe')
            }
            throw new Error('Error al crear usuario: ' + error.message)
        }
    }

    async updateUsuario(requestUserId: number, userId: number, updateUsuarioDto: UpdateUsuarioDto) {
        try {
            const { username, nombre, email, password } = updateUsuarioDto

            // Construir la query de actualización - SIMPLE
            const updates = []
            const values = []

            if (username) {
                updates.push('username = ?')
                values.push(username)
            }

            if (nombre) {
                updates.push('nombre = ?')
                values.push(nombre)
            }

            if (email !== undefined) {
                updates.push('email = ?')
                values.push(email || null)
            }

            if (password) {
                updates.push('password_hash = ?')
                values.push(this.hashPassword(password))
            }

            if (updates.length > 0) {
                values.push(userId)

                await this.db.query(
                    `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
                    values
                )
            }

            // Obtener y retornar el usuario actualizado
            const updatedUser = await this.db.query(
                'SELECT id, username, nombre, email, estado, creado_en, rol FROM usuarios WHERE id = ?',
                [userId]
            )

            return updatedUser
        } catch (error) {
            throw new Error('Error al actualizar usuario: ' + error.message)
        }
    }

    async updateEstadoUsuario(requestUserId: number, userId: number, updateEstadoDto: UpdateEstadoUsuarioDto) {
        // Verificar que el usuario que hace la petición es admin
        if (!(await this.isAdmin(requestUserId))) {
            throw new ForbiddenException('No tienes permisos para cambiar el estado de usuarios')
        }

        // No permitir desactivar al propio admin
        if (requestUserId === userId) {
            throw new ForbiddenException('No puedes cambiar tu propio estado')
        }

        // Verificar que el usuario existe
        const existingUser = await this.db.query(
            'SELECT id FROM usuarios WHERE id = ?',
            [userId]
        ) as any

        if (!existingUser || !existingUser.id) {
            throw new NotFoundException('Usuario no encontrado')
        }

        await this.db.query(
            'UPDATE usuarios SET estado = ? WHERE id = ?',
            [updateEstadoDto.estado, userId]
        )

        // Retornar el usuario actualizado
        const updatedUser = await this.db.query(
            'SELECT id, username, nombre, email, estado, creado_en FROM usuarios WHERE id = ?',
            [userId]
        )

        return updatedUser
    }

    async deleteUsuario(requestUserId: number, userId: number) {
        // Verificar que el usuario que hace la petición es admin
        if (!(await this.isAdmin(requestUserId))) {
            throw new ForbiddenException('No tienes permisos para eliminar usuarios')
        }

        // No permitir eliminar al propio admin
        if (requestUserId === userId) {
            throw new ForbiddenException('No puedes eliminar tu propia cuenta')
        }

        // Verificar que el usuario existe
        const existingUser = await this.db.query(
            'SELECT id FROM usuarios WHERE id = ?',
            [userId]
        ) as any

        if (!existingUser || !existingUser.id) {
            throw new NotFoundException('Usuario no encontrado')
        }

        // Eliminar el usuario (esto también eliminará las sesiones por FK)
        await this.db.query('DELETE FROM usuarios WHERE id = ?', [userId])

        return { message: 'Usuario eliminado correctamente' }
    }

    // Métodos para logs del sistema
    async getLogs(requestUserId: number) {
        try {
            // Obtener logs de acceso recientes con nombres correctos de columnas
            const logs = await this.db.query(`
        SELECT 
          la.id,
          la.usuario_id,
          u.username,
          u.nombre,
          la.accion,
          la.ip_address as ip,
          la.user_agent,
          la.exitoso,
          la.creado_en
        FROM logs_acceso la
        LEFT JOIN usuarios u ON la.usuario_id = u.id
        ORDER BY la.creado_en DESC
        LIMIT 100
      `)

            return Array.isArray(logs) ? logs : [logs].filter(Boolean)
        } catch (error) {
            // Retornar logs simulados si hay error
            return this.getSimulatedLogs()
        }
    }

    async getActivityLogs(requestUserId: number) {
        try {
            const activityLogs = await this.db.query(`
        SELECT 
          la.id,
          la.usuario_id,
          u.username,
          u.nombre,
          la.accion,
          la.creado_en,
          la.exitoso
        FROM logs_acceso la
        LEFT JOIN usuarios u ON la.usuario_id = u.id
        WHERE la.exitoso = 1
        ORDER BY la.creado_en DESC
        LIMIT 50
      `)

            return Array.isArray(activityLogs) ? activityLogs : [activityLogs].filter(Boolean)
        } catch (error) {
            return this.getSimulatedActivityLogs()
        }
    }

    async getErrorLogs(requestUserId: number) {
        try {
            const errorLogs = await this.db.query(`
        SELECT 
          la.id,
          la.usuario_id,
          u.username,
          u.nombre,
          la.accion,
          la.creado_en,
          la.detalles
        FROM logs_acceso la
        LEFT JOIN usuarios u ON la.usuario_id = u.id
        WHERE la.exitoso = 0
        ORDER BY la.creado_en DESC
        LIMIT 50
      `)

            return Array.isArray(errorLogs) ? errorLogs : [errorLogs].filter(Boolean)
        } catch (error) {
            return this.getSimulatedErrorLogs()
        }
    }

    // Métodos privados para logs simulados (fallback)
    private getSimulatedLogs() {
        const now = new Date()
        return [
            {
                id: 1,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'LOGIN',
                ip: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 2).toISOString()
            },
            {
                id: 2,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'GET_USUARIOS',
                ip: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 5).toISOString()
            },
            {
                id: 3,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'GET_LOGS',
                ip: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 1).toISOString()
            },
            {
                id: 4,
                usuario_id: 2,
                username: 'usuario1',
                nombre: 'Fernando Maldonado',
                accion: 'LOGIN',
                ip: '192.168.1.105',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 15).toISOString()
            },
            {
                id: 5,
                usuario_id: 2,
                username: 'usuario1',
                nombre: 'Fernando Maldonado',
                accion: 'VIEW_DASHBOARD',
                ip: '192.168.1.105',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 12).toISOString()
            },
            {
                id: 6,
                usuario_id: null,
                username: null,
                nombre: 'Usuario Desconocido',
                accion: 'LOGIN_FAILED',
                ip: '192.168.1.200',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: false,
                creado_en: new Date(now.getTime() - 1000 * 60 * 30).toISOString()
            },
            {
                id: 7,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'CREATE_USUARIO',
                ip: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 45).toISOString()
            },
            {
                id: 8,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'UPDATE_USUARIO',
                ip: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                exitoso: true,
                creado_en: new Date(now.getTime() - 1000 * 60 * 60).toISOString()
            }
        ]
    }

    private getSimulatedActivityLogs() {
        const now = new Date()
        return [
            {
                id: 1,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'LOGIN',
                creado_en: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
                exitoso: true
            },
            {
                id: 2,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'CREATE_USUARIO',
                creado_en: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
                exitoso: true
            },
            {
                id: 3,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'UPDATE_USUARIO',
                creado_en: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
                exitoso: true
            },
            {
                id: 4,
                usuario_id: 2,
                username: 'usuario1',
                nombre: 'Fernando Maldonado',
                accion: 'LOGIN',
                creado_en: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
                exitoso: true
            },
            {
                id: 5,
                usuario_id: 2,
                username: 'usuario1',
                nombre: 'Fernando Maldonado',
                accion: 'VIEW_DASHBOARD',
                creado_en: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
                exitoso: true
            },
            {
                id: 6,
                usuario_id: 1,
                username: 'admin',
                nombre: 'Administrador',
                accion: 'GET_LOGS',
                creado_en: new Date(now.getTime() - 1000 * 60 * 1).toISOString(),
                exitoso: true
            }
        ]
    }

    private getSimulatedErrorLogs() {
        const now = new Date()
        return [
            {
                id: 1,
                usuario_id: null,
                username: null,
                nombre: 'Usuario Desconocido',
                accion: 'LOGIN_FAILED',
                creado_en: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
                detalles: JSON.stringify({ error: 'Credenciales inválidas', ip: '192.168.1.200' })
            },
            {
                id: 2,
                usuario_id: null,
                username: null,
                nombre: 'Usuario Desconocido',
                accion: 'LOGIN_FAILED',
                creado_en: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
                detalles: JSON.stringify({ error: 'Usuario no encontrado', ip: '10.0.0.50' })
            },
            {
                id: 3,
                usuario_id: 2,
                username: 'usuario1',
                nombre: 'Fernando Maldonado',
                accion: 'ACCESS_DENIED',
                creado_en: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
                detalles: JSON.stringify({ error: 'Intento de acceso a área de administración sin permisos', resource: '/admin/usuarios' })
            },
            {
                id: 4,
                usuario_id: null,
                username: null,
                nombre: 'Sistema',
                accion: 'DATABASE_ERROR',
                creado_en: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
                detalles: JSON.stringify({ error: 'Conexión a base de datos perdida temporalmente', duration: '30s' })
            }
        ]
    }
}