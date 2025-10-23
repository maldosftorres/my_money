const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'my_money',
    multipleStatements: true
};

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

class MigrationRunner {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(dbConfig);
            console.log('✅ Conectado a MySQL');
        } catch (error) {
            console.error('❌ Error conectando a MySQL:', error.message);
            process.exit(1);
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ Desconectado de MySQL');
        }
    }

    async ensureMigrationsTable() {
        try {
            await this.connection.query(`
        CREATE TABLE IF NOT EXISTS migraciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(50) NOT NULL UNIQUE,
          nombre VARCHAR(200) NOT NULL,
          ejecutada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);
        } catch (error) {
            console.error('❌ Error creando tabla migraciones:', error.message);
            throw error;
        }
    }

    async getExecutedMigrations() {
        try {
            const [rows] = await this.connection.query(
                'SELECT version FROM migraciones ORDER BY version'
            );
            return rows.map(row => row.version);
        } catch (error) {
            console.error('❌ Error obteniendo migraciones ejecutadas:', error.message);
            throw error;
        }
    }

    async getAvailableMigrations() {
        try {
            const files = await fs.readdir(MIGRATIONS_DIR);
            return files
                .filter(file => file.endsWith('.sql'))
                .map(file => {
                    const version = file.split('_')[0];
                    return { version, filename: file };
                })
                .sort((a, b) => a.version.localeCompare(b.version));
        } catch (error) {
            console.error('❌ Error leyendo directorio de migraciones:', error.message);
            throw error;
        }
    }

    async executeMigration(migration) {
        const filePath = path.join(MIGRATIONS_DIR, migration.filename);

        try {
            const sql = await fs.readFile(filePath, 'utf8');

            // Ejecutar la migración en una transacción
            await this.connection.beginTransaction();

            try {
                // Ejecutar el SQL de la migración
                await this.connection.query(sql);

                // Registrar la migración como ejecutada (si no está ya registrada)
                await this.connection.query(`
          INSERT IGNORE INTO migraciones (version, nombre) 
          VALUES (?, ?)
        `, [migration.version, migration.filename]);

                await this.connection.commit();
                console.log(`✅ Migración ${migration.version} ejecutada: ${migration.filename}`);
            } catch (error) {
                await this.connection.rollback();
                throw error;
            }
        } catch (error) {
            console.error(`❌ Error ejecutando migración ${migration.version}:`, error.message);
            throw error;
        }
    }

    async rollbackMigration(version) {
        try {
            // Por simplicidad, solo removemos el registro de la tabla
            // En un sistema más complejo, tendríamos archivos de rollback
            await this.connection.query('DELETE FROM migraciones WHERE version = ?', [version]);
            console.log(`✅ Migración ${version} revertida (registro removido)`);
            console.log('⚠️  Nota: Los cambios de esquema deben revertirse manualmente');
        } catch (error) {
            console.error(`❌ Error revirtiendo migración ${version}:`, error.message);
            throw error;
        }
    }

    async migrate() {
        await this.ensureMigrationsTable();

        const executed = await this.getExecutedMigrations();
        const available = await this.getAvailableMigrations();

        const pending = available.filter(migration => !executed.includes(migration.version));

        if (pending.length === 0) {
            console.log('✅ No hay migraciones pendientes');
            return;
        }

        console.log(`📦 Ejecutando ${pending.length} migración(es) pendiente(s)...`);

        for (const migration of pending) {
            await this.executeMigration(migration);
        }

        console.log('✅ Todas las migraciones ejecutadas correctamente');
    }

    async rollback() {
        await this.ensureMigrationsTable();

        const executed = await this.getExecutedMigrations();

        if (executed.length === 0) {
            console.log('✅ No hay migraciones para revertir');
            return;
        }

        const lastMigration = executed[executed.length - 1];
        await this.rollbackMigration(lastMigration);
    }

    async status() {
        await this.ensureMigrationsTable();

        const executed = await this.getExecutedMigrations();
        const available = await this.getAvailableMigrations();

        console.log('📊 Estado de migraciones:');
        console.log('========================');

        if (available.length === 0) {
            console.log('No hay archivos de migración disponibles');
            return;
        }

        for (const migration of available) {
            const status = executed.includes(migration.version) ? '✅ EJECUTADA' : '⏳ PENDIENTE';
            console.log(`${migration.version}: ${status} - ${migration.filename}`);
        }
    }
}

async function main() {
    const command = process.argv[2] || 'up';
    const runner = new MigrationRunner();

    try {
        await runner.connect();

        switch (command) {
            case 'up':
                await runner.migrate();
                break;
            case 'down':
                await runner.rollback();
                break;
            case 'status':
                await runner.status();
                break;
            default:
                console.log('Uso: node migrate.js [up|down|status]');
                console.log('  up     - Ejecutar migraciones pendientes');
                console.log('  down   - Revertir última migración');
                console.log('  status - Mostrar estado de migraciones');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await runner.disconnect();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { MigrationRunner };