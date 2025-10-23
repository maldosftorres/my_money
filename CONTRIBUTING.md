# 🤝 Contributing to MyMoney

¡Gracias por tu interés en contribuir a MyMoney! Este documento contiene las guías y mejores prácticas para contribuir al proyecto.

## 🚀 Inicio Rápido para Contribuidores

1. **Fork** el repositorio
2. **Clona** tu fork localmente
3. **Instala** las dependencias: `pnpm install`
4. **Configura** el entorno de desarrollo (ver README.md)
5. **Crea** una rama para tu feature: `git checkout -b feature/mi-nueva-feature`
6. **Desarrolla** y **testea** tus cambios
7. **Commit** siguiendo las convenciones
8. **Push** y abre un **Pull Request**

## 📋 Tipos de Contribuciones

### 🐛 Bug Reports
- Usa el template de issue para bugs
- Incluye pasos para reproducir
- Especifica entorno (OS, Node.js, navegador)
- Adjunta screenshots si es necesario

### ✨ Feature Requests
- Describe claramente la funcionalidad deseada
- Explica el caso de uso y beneficio
- Considera la complejidad de implementación

### 🔧 Code Contributions
- Nuevas funcionalidades
- Corrección de bugs
- Mejoras de rendimiento
- Refactoring y optimizaciones

### 📚 Documentation
- Mejoras en README
- Documentación de API
- Guías de usuario
- Comentarios en código

## 🛠️ Configuración de Desarrollo

### Prerequisitos
```bash
# Node.js >= 18
node --version

# pnpm >= 8
pnpm --version

# MySQL >= 8.0
mysql --version
```

### Setup Inicial
```bash
# 1. Fork y clonar
git clone https://github.com/tu-usuario/myMoney.git
cd myMoney

# 2. Instalar dependencias
pnpm install

# 3. Configurar base de datos
mysql -u root -p
CREATE DATABASE my_money_dev;

# 4. Variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 5. Ejecutar migraciones
cd db && node migrate.js up

# 6. Verificar que todo funciona
pnpm dev
```

## 📝 Convenciones de Código

### Commits Semánticos
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Estructura
tipo(scope): descripción

# Ejemplos
feat(api): agregar endpoint de reportes mensuales
fix(ui): corregir problema de responsive en tablas
docs(readme): actualizar instrucciones de instalación
refactor(database): optimizar consultas de movimientos
test(api): agregar tests para módulo de tarjetas
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `refactor`: Refactoring sin cambios funcionales
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de rendimiento

### Código TypeScript
```typescript
// ✅ Bueno
interface CuentaDto {
  nombre: string;
  tipo: TipoCuenta;
  saldoInicial: number;
}

// ❌ Malo
interface CuentaDto {
  nombre: any;
  tipo: string;
  saldoInicial: any;
}
```

### Componentes React
```tsx
// ✅ Bueno - Componente funcional con tipos
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### APIs NestJS
```typescript
// ✅ Bueno - Service con validaciones
@Injectable()
export class CuentasService {
  async crearCuenta(dto: CrearCuentaDto): Promise<Cuenta> {
    const cuentaExistente = await this.buscarPorNombre(dto.nombre);
    if (cuentaExistente) {
      throw new ConflictException('Cuenta ya existe');
    }
    
    return this.databaseService.query(
      'INSERT INTO cuentas (nombre, tipo, saldo) VALUES (?, ?, ?)',
      [dto.nombre, dto.tipo, dto.saldoInicial]
    );
  }
}
```

## 🧪 Testing

### Frontend (React Testing Library)
```bash
# Ejecutar tests
cd apps/web
pnpm test

# Tests con cobertura
pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

### Backend (Jest)
```bash
# Ejecutar tests
cd apps/api
pnpm test

# Tests E2E
pnpm test:e2e

# Tests con cobertura
pnpm test:cov
```

### Escribir Tests
```typescript
// Frontend
describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// Backend
describe('CuentasController', () => {
  it('should create cuenta successfully', async () => {
    const dto = { nombre: 'Test', tipo: 'corriente', saldoInicial: 1000 };
    const result = await controller.crear(dto);
    expect(result.nombre).toBe('Test');
  });
});
```

## 🔍 Linting y Formatting

### ESLint
```bash
# Verificar todo el proyecto
pnpm lint

# Fix automático
pnpm lint:fix

# Solo backend
cd apps/api && pnpm lint

# Solo frontend  
cd apps/web && pnpm lint
```

### Prettier
```bash
# Formatear código
pnpm format

# Verificar formato
pnpm format:check
```

## 🌐 Base de Datos

### Migraciones
```bash
# Crear nueva migración
cd db
touch migrations/XXXX_descripcion.sql

# Ejecutar migraciones pendientes
node migrate.js up

# Revertir última migración
node migrate.js down

# Ver estado
node migrate.js status
```

### Estructura de Migración
```sql
-- migrations/0002_agregar_tabla_categorias.sql
-- UP
CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
DROP TABLE IF EXISTS categorias;
```

## 📤 Pull Request Guidelines

### Antes de Crear PR
- [ ] ✅ Todos los tests pasan
- [ ] ✅ No hay errores de linting
- [ ] ✅ Código formateado con Prettier
- [ ] ✅ Commits siguen convención semántica
- [ ] ✅ Branch está actualizado con main
- [ ] ✅ Funcionalidad testeada manualmente

### Template de PR
```markdown
## 📋 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💥 Breaking change
- [ ] 📚 Documentación
- [ ] 🔧 Refactoring

## 🧪 Testing
- [ ] Tests existentes pasan
- [ ] Agregué nuevos tests
- [ ] Testing manual realizado

## 📋 Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Self-review realizado
- [ ] Comentarios agregados en código complejo
- [ ] Documentación actualizada
- [ ] No genera breaking changes
```

## 🏗️ Arquitectura del Proyecto

### Frontend (React + TypeScript)
```
apps/web/src/
├── components/
│   ├── ui/           # Componentes básicos reutilizables
│   └── forms/        # Formularios específicos
├── pages/            # Páginas de la aplicación
├── services/         # API clients y servicios
├── utils/            # Utilidades y helpers
├── types/            # Definiciones de tipos
└── hooks/            # Custom React hooks
```

### Backend (NestJS + TypeScript)
```
apps/api/src/
├── modules/          # Módulos de negocio
│   ├── cuentas/
│   │   ├── dto/      # Data Transfer Objects
│   │   ├── cuentas.controller.ts
│   │   ├── cuentas.service.ts
│   │   └── cuentas.module.ts
├── core/             # Servicios centrales
├── common/           # Utilidades compartidas
└── main.ts           # Bootstrap de la aplicación
```

## 🐛 Debugging

### Backend
```bash
# Logs detallados
DEBUG=* pnpm dev

# Solo logs SQL
ENABLE_SQL_LOGGING=true pnpm dev

# Debugger con breakpoints
pnpm dev:debug
```

### Frontend
```bash
# React DevTools
# Chrome Extension: React Developer Tools

# Redux DevTools (si se implementa)
# Chrome Extension: Redux DevTools
```

## 📞 Soporte

### ¿Dónde Obtener Ayuda?
1. **Documentación**: README.md y API_ENDPOINTS.md
2. **Issues**: Buscar issues existentes antes de crear nuevos
3. **Discussions**: Para preguntas generales y ideas
4. **Email**: Para temas sensibles o privados

### Reportar Issues
- Usa el template correspondiente
- Incluye información de entorno
- Pasos claros para reproducir
- Logs relevantes si aplica

## 🎯 Roadmap y Prioridades

Ver [ROADMAP.md](./ROADMAP.md) para:
- Sprint actual y objetivos
- Features planificadas
- Prioridades del proyecto
- Cronograma estimado

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto.

---

**¡Gracias por contribuir a MyMoney! 💰✨**

Tu tiempo y esfuerzo hacen que este proyecto sea mejor para todos. Si tienes preguntas, no dudes en crear un issue o iniciar una discusión.