const mysql = require('mysql2/promise');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'my_money'
        });

        console.log('✅ Conectado a MySQL');

        // Leer y ejecutar la migración
        const migrationSQL = `
            -- Agregar columnas para ingresos recurrentes
            ALTER TABLE ingresos 
            ADD COLUMN dia_mes INT DEFAULT NULL COMMENT 'Día del mes para ingresos recurrentes (1-31)',
            ADD COLUMN frecuencia_meses INT DEFAULT 1 COMMENT 'Cada cuántos meses se repite (1=mensual, 3=trimestral)',
            ADD COLUMN es_recurrente TINYINT(1) DEFAULT 0 COMMENT 'Si es un ingreso que se repite automáticamente',
            ADD COLUMN ingreso_padre_id INT DEFAULT NULL COMMENT 'ID del ingreso original para los generados automáticamente',
            ADD COLUMN fecha_cobro DATE DEFAULT NULL COMMENT 'Fecha real cuando se cobró el ingreso';
        `;

        await connection.execute(migrationSQL);
        console.log('✅ Migración ejecutada - Columnas agregadas');

        // Agregar foreign key por separado
        try {
            await connection.execute('ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_padre FOREIGN KEY (ingreso_padre_id) REFERENCES ingresos(id) ON DELETE CASCADE;');
            console.log('✅ Foreign key agregada');
        } catch (err) {
            console.log('ℹ️  Foreign key ya existe o hubo un error:', err.message);
        }

        // Crear índices
        try {
            await connection.execute('CREATE INDEX idx_ingresos_recurrentes ON ingresos(es_recurrente, dia_mes, frecuencia_meses);');
            console.log('✅ Índice idx_ingresos_recurrentes creado');
        } catch (err) {
            console.log('ℹ️  Índice ya existe:', err.message);
        }

        try {
            await connection.execute('CREATE INDEX idx_ingresos_padre ON ingresos(ingreso_padre_id);');
            console.log('✅ Índice idx_ingresos_padre creado');
        } catch (err) {
            console.log('ℹ️  Índice ya existe:', err.message);
        }

        await connection.end();
        console.log('✅ Migración completada exitosamente');

    } catch (error) {
        console.error('❌ Error en la migración:', error.message);
        process.exit(1);
    }
}

runMigration();