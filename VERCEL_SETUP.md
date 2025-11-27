# Configuración para Vercel

Esta guía te explica cómo configurar tu proyecto en Vercel después de subirlo a GitHub.

## Paso 1: Crear archivo .env.local

Antes de hacer push a GitHub, crea un archivo `.env.local` en la raíz del proyecto con tus variables de entorno:

```bash
# Copia el archivo .env.example y renómbralo
cp .env.example .env.local
```

Luego edita `.env.local` con tus valores reales. **IMPORTANTE**: El archivo `.env.local` NO debe subirse a GitHub (ya está en .gitignore).

## Paso 2: Subir el proyecto a GitHub

1. Crea un nuevo repositorio en GitHub
2. Haz commit y push de tu código:

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## Paso 3: Conectar proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

## Paso 4: Configurar Variables de Entorno en Vercel

**CRÍTICO**: Debes configurar todas las variables de entorno en Vercel antes del primer deploy.

### En el dashboard de Vercel:

1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega cada una de estas variables:

#### Variables Requeridas:

```
NEXT_PUBLIC_SUPABASE_URL
```
Valor: `https://wypyrofixlyxzoeqndno.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cHlyb2ZpeGx5eHpvZXFuZG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDkwMjEsImV4cCI6MjA1ODU4NTAyMX0.ajn5K6HXNnNl8WQUfle0-iVa-1Rh9Y8Mfm5xrXKWan0`

#### Variables Opcionales (pero recomendadas):

```
NEXT_PUBLIC_GTM_ID
```
Valor: `GTM-KLPJG4Z2` (o tu propio ID de Google Tag Manager)

```
NEXT_PUBLIC_GA4_ID
```
Valor: `G-QKL95SX2EX` (o tu propio ID de Google Analytics 4)

```
NEXT_PUBLIC_FB_PIXEL_ID
```
Valor: `626633394773155` (o tu propio ID de Facebook Pixel)

### Configuración de Entornos:

Para cada variable, selecciona en qué entornos aplicará:
- ✅ **Production** (producción)
- ✅ **Preview** (previews de PRs)
- ✅ **Development** (si usas Vercel para desarrollo)

## Paso 5: Configuración del Build

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `next build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` o `bun install` (según tu package manager)

Si usas **Bun** como package manager, puedes configurarlo en:
- Settings → General → Install Command: `bun install`

## Paso 6: Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado (ej: `sitioexpress.mx`)
3. Sigue las instrucciones para configurar los DNS

## Paso 7: Deploy

1. Haz clic en **Deploy**
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, tendrás una URL como: `tu-proyecto.vercel.app`

## Verificación Post-Deploy

Después del deploy, verifica que:

1. ✅ La aplicación carga correctamente
2. ✅ El cotizador funciona (conecta con Supabase)
3. ✅ Los eventos de tracking se registran (revisa la consola del navegador)
4. ✅ Google Analytics/Tag Manager funcionan (usa la extensión de Chrome "Tag Assistant")
5. ✅ Facebook Pixel funciona (usa Facebook Pixel Helper)

## Troubleshooting

### Error: "Supabase credentials are missing"
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos (case-sensitive)
- Haz un nuevo deploy después de agregar las variables

### Error: "Failed to fetch" en producción
- Verifica que las políticas RLS en Supabase permitan acceso público
- Revisa los logs de Vercel en la pestaña "Functions"

### Tracking no funciona
- Verifica que las variables `NEXT_PUBLIC_*` estén configuradas
- Revisa la consola del navegador para errores
- Asegúrate de que el consentimiento de cookies esté funcionando

## Notas Importantes

⚠️ **Seguridad**:
- Las variables `NEXT_PUBLIC_*` son públicas y se exponen al cliente
- Nunca pongas secretos o API keys privadas en variables `NEXT_PUBLIC_*`
- La `ANON_KEY` de Supabase es segura de exponer (está diseñada para eso)

📝 **Actualizaciones**:
- Cada push a `main` desplegará automáticamente a producción
- Los PRs crearán previews automáticos
- Puedes hacer rollback desde el dashboard si algo sale mal

## Recursos Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/projects/environment-variables)


