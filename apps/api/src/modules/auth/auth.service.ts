import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../core/database.service';
import { LoginDto, RegisterDto } from './auth.dto';
// Implementación simplificada de bcrypt usando crypto nativo de Node.js
import * as crypto from 'crypto';

const bcrypt = {
    async hash(password: string, saltRounds: number): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    },

    async compare(password: string, hash: string): Promise<boolean> {
        const [salt, storedHash] = hash.split(':');
        const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return computedHash === storedHash;
    }
};

export interface User {
    id: number;
    username: string;
    nombre: string;
    email?: string;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_en: Date;
    ultimo_acceso?: Date;
}

export interface AuthResult {
    user: User;
    token: string;
}

@Injectable()
export class AuthService {
    constructor(private databaseService: DatabaseService) { }

    async validateUser(username: string, password: string): Promise<User | null> {
        try {
            const connection = await this.databaseService.getConnection();

            const [rows] = await connection.execute(
                'SELECT id, username, nombre, email, password_hash, estado, creado_en, ultimo_acceso, rol FROM usuarios WHERE username = ? AND estado = "ACTIVO"',
                [username]
            );

            connection.release();

            if (!Array.isArray(rows) || rows.length === 0) {
                return null;
            }

            const user = rows[0] as any;
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return null;
            }

            const { password_hash, ...result } = user;
            return result;
        } catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }

    async login(loginDto: LoginDto): Promise<AuthResult> {
        const user = await this.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            // Log failed attempt
            await this.logAccess(null, loginDto.username, 'LOGIN_FAILED', 'Invalid credentials');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last access
        await this.updateLastAccess(user.id);

        // Generate token (simple approach - you might want to use JWT)
        const token = await this.generateToken(user);

        // Log successful login
        await this.logAccess(user.id, user.username, 'LOGIN_SUCCESS', 'User logged in successfully');

        return { user, token };
    }

    async register(registerDto: RegisterDto): Promise<User> {
        try {
            const connection = await this.databaseService.getConnection();

            // Check if username already exists
            const [existingUsers] = await connection.execute(
                'SELECT id FROM usuarios WHERE username = ?',
                [registerDto.username]
            );

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                connection.release();
                throw new UnauthorizedException('Username already exists');
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

            // Insert new user
            const [result] = await connection.execute(
                'INSERT INTO usuarios (username, nombre, email, password_hash, estado) VALUES (?, ?, ?, ?, "ACTIVO")',
                [registerDto.username, registerDto.nombre, registerDto.email || null, passwordHash]
            );

            const insertId = (result as any).insertId;

            // Get the created user
            const [newUserRows] = await connection.execute(
                'SELECT id, username, nombre, email, estado, creado_en, rol FROM usuarios WHERE id = ?',
                [insertId]
            );

            connection.release();

            return (newUserRows as any[])[0];
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    async logout(token: string): Promise<void> {
        try {
            const connection = await this.databaseService.getConnection();

            // Deactivate session
            await connection.execute(
                'UPDATE sesiones SET activa = 0 WHERE token = ?',
                [token]
            );

            connection.release();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    private async generateToken(user: User): Promise<string> {
        const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const connection = await this.databaseService.getConnection();

            // Store session in database
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

            await connection.execute(
                'INSERT INTO sesiones (usuario_id, token, expires_at, activa) VALUES (?, ?, ?, 1)',
                [user.id, token, expiresAt]
            );

            connection.release();
        } catch (error) {
            console.error('Error storing session:', error);
        }

        return token;
    }

    async validateToken(token: string): Promise<User | null> {
        try {
            const connection = await this.databaseService.getConnection();

            const [rows] = await connection.execute(`
        SELECT u.id, u.username, u.nombre, u.email, u.estado, u.creado_en, u.ultimo_acceso, u.rol
        FROM usuarios u
        INNER JOIN sesiones s ON s.usuario_id = u.id
        WHERE s.token = ? AND s.activa = 1 AND s.expires_at > NOW() AND u.estado = 'ACTIVO'
      `, [token]);

            connection.release();

            if (!Array.isArray(rows) || rows.length === 0) {
                return null;
            }

            return rows[0] as User;
        } catch (error) {
            console.error('Error validating token:', error);
            return null;
        }
    }

    private async updateLastAccess(userId: number): Promise<void> {
        try {
            const connection = await this.databaseService.getConnection();

            await connection.execute(
                'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
                [userId]
            );

            connection.release();
        } catch (error) {
            console.error('Error updating last access:', error);
        }
    }

    private async logAccess(
        userId: number | null,
        username: string,
        action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED',
        details?: string
    ): Promise<void> {
        try {
            const connection = await this.databaseService.getConnection();

            await connection.execute(
                'INSERT INTO logs_acceso (usuario_id, username, accion, detalles) VALUES (?, ?, ?, ?)',
                [userId, username, action, details || null]
            );

            connection.release();
        } catch (error) {
            console.error('Error logging access:', error);
        }
    }
}