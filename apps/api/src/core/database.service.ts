import { createPool, Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { EnvService } from './env.service';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

export interface QueryResult extends RowDataPacket {
    [key: string]: any;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;

    constructor(private envService: EnvService) { }

    async onModuleInit() {
        await this.createPool();
    }

    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
            this.logger.log('Conexión a MySQL cerrada');
        }
    }

    private async createPool() {
        try {
            this.pool = createPool({
                host: this.envService.dbHost,
                port: this.envService.dbPort,
                user: this.envService.dbUser,
                password: this.envService.dbPassword,
                database: this.envService.dbName,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                charset: 'utf8mb4',
                timezone: '+00:00',
                supportBigNumbers: true,
                bigNumberStrings: false,
            });

            // Probar la conexión
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();

            this.logger.log('Pool de conexiones MySQL creado exitosamente');
        } catch (error) {
            this.logger.error('Error creando pool de MySQL:', error);
            throw error;
        }
    }

    /**
     * Ejecuta una query SQL con parámetros
     */
    async query<T extends RowDataPacket>(
        sql: string,
        params?: any[]
    ): Promise<T[]> {
        const startTime = Date.now();
        try {
            const [rows] = await this.pool.execute<T[]>(sql, params);
            const duration = Date.now() - startTime;
            
            // Log consultas lentas (más de 1 segundo)
            if (duration > 1000) {
                this.logger.warn(`Consulta lenta (${duration}ms): ${sql.substring(0, 100)}...`, {
                    sql: sql.substring(0, 200),
                    params: params?.slice(0, 5),
                    duration
                });
            }
            
            return rows;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Error ejecutando query:', { 
                sql: sql.substring(0, 200), 
                params: params?.slice(0, 5), 
                error: error.message,
                duration
            });
            throw error;
        }
    }

    /**
     * Ejecuta una query de inserción/actualización/eliminación
     */
    async execute(
        sql: string,
        params?: any[]
    ): Promise<ResultSetHeader> {
        const startTime = Date.now();
        try {
            const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
            const duration = Date.now() - startTime;
            
            // Log operaciones lentas (más de 500ms)
            if (duration > 500) {
                this.logger.warn(`Operación lenta (${duration}ms): ${sql.substring(0, 100)}...`, {
                    sql: sql.substring(0, 200),
                    params: params?.slice(0, 5),
                    duration,
                    affectedRows: result.affectedRows
                });
            }
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Error ejecutando comando:', { 
                sql: sql.substring(0, 200), 
                params: params?.slice(0, 5), 
                error: error.message,
                duration
            });
            throw error;
        }
    }

    /**
     * Ejecuta múltiples operaciones en una transacción
     */
    async transaction<T>(
        callback: (connection: PoolConnection) => Promise<T>
    ): Promise<T> {
        const connection = await this.pool.getConnection();

        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            this.logger.error('Error en transacción, rollback ejecutado:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene una conexión directa del pool
     */
    async getConnection(): Promise<PoolConnection> {
        return await this.pool.getConnection();
    }

    /**
     * Helper para ejecutar queries dentro de una transacción
     */
    async queryInTransaction<T extends RowDataPacket>(
        connection: PoolConnection,
        sql: string,
        params?: any[]
    ): Promise<T[]> {
        const startTime = Date.now();
        try {
            const [rows] = await connection.execute<T[]>(sql, params);
            const duration = Date.now() - startTime;
            
            if (duration > 1000) {
                this.logger.warn(`Consulta lenta en transacción (${duration}ms): ${sql.substring(0, 100)}...`);
            }
            
            return rows;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Error ejecutando query en transacción:', { 
                sql: sql.substring(0, 200), 
                params: params?.slice(0, 5), 
                error: error.message,
                duration
            });
            throw error;
        }
    }

    /**
     * Helper para ejecutar comandos dentro de una transacción
     */
    async executeInTransaction(
        connection: PoolConnection,
        sql: string,
        params?: any[]
    ): Promise<ResultSetHeader> {
        const startTime = Date.now();
        try {
            const [result] = await connection.execute<ResultSetHeader>(sql, params);
            const duration = Date.now() - startTime;
            
            if (duration > 500) {
                this.logger.warn(`Operación lenta en transacción (${duration}ms): ${sql.substring(0, 100)}...`);
            }
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Error ejecutando comando en transacción:', { 
                sql: sql.substring(0, 200), 
                params: params?.slice(0, 5), 
                error: error.message,
                duration
            });
            throw error;
        }
    }
}