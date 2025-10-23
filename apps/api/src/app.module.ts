import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database.module';
import { CuentasModule } from './modules/cuentas/cuentas.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { GastosFijosModule } from './modules/gastos-fijos/gastos-fijos.module';
import { GastosAdicionalesModule } from './modules/gastos-adicionales/gastos-adicionales.module';
import { TarjetasModule } from './modules/tarjetas/tarjetas.module';
import { ConsumosTarjetaModule } from './modules/consumos-tarjeta/consumos-tarjeta.module';
import { MovimientosModule } from './modules/movimientos/movimientos.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        DatabaseModule,
        CuentasModule,
        IngresosModule,
        GastosFijosModule,
        GastosAdicionalesModule,
        TarjetasModule,
        ConsumosTarjetaModule,
        MovimientosModule,
        ReportesModule,
    ],
})
export class AppModule { }