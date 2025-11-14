# IEB+ Investment Tracker

Sistema de seguimiento de portafolio de inversiones para CEDEARs, bonos corporativos y bonos soberanos.

## 🚀 Tecnologías

- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **shadcn/ui** - Componentes UI basados en Radix UI
- **Recharts** - Gráficos y visualizaciones
- **Vercel Analytics** - Análisis de uso

## 📋 Prerequisitos

- Node.js >= 22.0.0
- Yarn >= 1.22.0 (gestor de paquetes recomendado)

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
yarn install
```

## 💻 Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn dev

# Abrir http://localhost:3000
```

## 🏗️ Build y Producción

```bash
# Generar build de producción
yarn build

# Iniciar servidor de producción
yarn start
```

## 🧹 Code Quality

```bash
# Lint (Biome)
yarn lint

# Lint y auto-fix
yarn lint:fix

# Format código
yarn format

# Check completo (lint + format)
yarn check

# Check y auto-fix
yarn check:fix
```

## 📁 Estructura del Proyecto

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── theme-provider.tsx # Provider de tema
├── lib/                   # Utilidades y helpers
├── public/                # Assets estáticos
└── styles/                # Estilos adicionales
```

## 🎨 Características

- ✅ Seguimiento de múltiples activos (CEDEARs, bonos, FCI)
- ✅ Cálculo automático de rentabilidad
- ✅ Historial de operaciones
- ✅ Persistencia en localStorage
- ✅ Responsive design
- ✅ Dark mode support (preparado)
- ✅ Analytics integrado

## 📊 Datos

Los datos se almacenan localmente en el navegador usando localStorage:
- `investmentAssets` - Activos y acumulados mensuales
- `investmentOperations` - Historial de operaciones
- `investmentCurrentValues` - Valores actuales de mercado

## 🔧 Configuración

### Biome
Herramienta todo-en-uno para linting y formateo. Configurado en `biome.json` con:
- Linter habilitado con reglas recomendadas
- Formatter con estilo consistente
- Organize imports automático
- Integración con Git

### TypeScript
Modo strict habilitado con validación en build time.

### Tailwind CSS
Configurado con variables CSS para theming y componentes shadcn/ui.

## 📝 Notas de Desarrollo

- Formato de fecha: DD/MM/YYYY
- Idioma de la aplicación: Español
- No hay backend - 100% client-side
- TypeScript strict mode habilitado

## 🤝 Contribuir

Este es un proyecto personal. Para contribuciones, por favor abre un issue primero.

## 📄 Licencia

Privado - Uso personal
