import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { CuentasModule } from './modules/cuentas/cuentas.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { GastosFijosModule } from './modules/gastos-fijos/gastos-fijos.module';
import { GastosAdicionalesModule } from './modules/gastos-adicionales/gastos-adicionales.module';
import { CategoriasGastoModule } from './modules/categorias-gasto/categorias-gasto.module';
import { TarjetasModule } from './modules/tarjetas/tarjetas.module';

import { MovimientosModule } from './modules/movimientos/movimientos.module';
import { TransferenciasModule } from './modules/transferencias/transferencias.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        DatabaseModule,
        AuthModule,
        AdminModule,
        CuentasModule,
        IngresosModule,
        GastosFijosModule,
        GastosAdicionalesModule,
        CategoriasGastoModule,
        TarjetasModule,
        MovimientosModule,
        TransferenciasModule,
        ReportesModule,
    ],
})
export class AppModule { }