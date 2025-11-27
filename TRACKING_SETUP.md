# Guía de Configuración de Tracking

## Problema Actual

Si solo ves 2 registros en Supabase (los que completaron el formulario), significa que:

1. **La tabla `quote_events` no existe** - Las migraciones SQL no se han ejecutado
2. **Solo se están guardando los leads completos** en `web_dev_leads`
3. **No se está trackeando el comportamiento de usuarios** que no completan el formulario

## Solución: Ejecutar Migraciones SQL

### Paso 1: Abrir Supabase SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### Paso 2: Ejecutar las Migraciones

**✅ MIGRACIONES YA EJECUTADAS** - Las migraciones se ejecutaron automáticamente usando Supabase MCP Lite.

Esto creó:
- ✅ Tabla `web_dev_quote_events` para tracking detallado
- ✅ Campos adicionales en `web_dev_leads` para mejor tracking
- ✅ Índices para optimizar consultas
- ✅ Políticas RLS para permitir inserts públicos
- ✅ Vistas para análisis: `web_dev_abandoned_quotes`, `web_dev_completed_quotes`, `web_dev_quote_funnel`

### Paso 3: Verificar que Funcionó

Ejecuta esta query para verificar:

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) FROM web_dev_quote_events;

-- Ver eventos recientes
SELECT event_type, COUNT(*) 
FROM web_dev_quote_events 
GROUP BY event_type 
ORDER BY COUNT(*) DESC;

-- Ver leads con tracking
SELECT 
  name, 
  email, 
  session_id, 
  user_fingerprint,
  last_step_reached,
  created_at
FROM web_dev_leads 
ORDER BY created_at DESC 
LIMIT 10;
```

## Qué se Trackea Ahora

### Eventos Automáticos:
1. **quote_started** - Cuando alguien carga el cotizador
2. **plan_selected** - Cuando selecciona un plan
3. **addon_selected/addon_removed** - Cuando agrega/quita add-ons
4. **timeline_selected** - Cuando selecciona urgencia
5. **step_changed** - Cuando cambia de paso o escribe en campos
6. **quote_abandoned** - Cuando abandona sin completar
7. **quote_completed** - Cuando completa el formulario

### Datos Capturados:
- ✅ Session ID (único por sesión)
- ✅ User Fingerprint (identifica al usuario)
- ✅ IP Address
- ✅ User Agent
- ✅ URL actual
- ✅ Email, teléfono, nombre (cuando están disponibles)
- ✅ Plan seleccionado
- ✅ Add-ons seleccionados
- ✅ Timeline seleccionado
- ✅ Paso actual

## Consultas Útiles

### Ver usuarios que iniciaron pero no completaron:
```sql
SELECT 
  session_id,
  user_fingerprint,
  email,
  phone,
  name,
  plan_id,
  step,
  timestamp
FROM web_dev_quote_events
WHERE event_type = 'quote_abandoned'
ORDER BY timestamp DESC;

-- O usar la vista:
SELECT * FROM web_dev_abandoned_quotes ORDER BY abandoned_at DESC;
```

### Ver funnel de conversión:
```sql
SELECT 
  DATE(timestamp) as fecha,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_started' THEN session_id END) as iniciaron,
  COUNT(DISTINCT CASE WHEN event_type = 'plan_selected' THEN session_id END) as seleccionaron_plan,
  COUNT(DISTINCT CASE WHEN event_type = 'timeline_selected' THEN session_id END) as seleccionaron_timeline,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_completed' THEN session_id END) as completaron
FROM web_dev_quote_events
GROUP BY DATE(timestamp)
ORDER BY fecha DESC
LIMIT 30;

-- O usar la vista:
SELECT * FROM web_dev_quote_funnel ORDER BY date DESC LIMIT 30;
```

### Ver usuarios con datos de contacto que abandonaron:
```sql
SELECT DISTINCT ON (session_id)
  session_id,
  email,
  phone,
  name,
  plan_id,
  step,
  timestamp as abandoned_at
FROM web_dev_quote_events
WHERE event_type = 'quote_abandoned'
  AND (email IS NOT NULL OR phone IS NOT NULL OR name IS NOT NULL)
ORDER BY session_id, timestamp DESC;

-- O usar la vista:
SELECT * FROM web_dev_abandoned_quotes 
WHERE email IS NOT NULL OR phone IS NOT NULL OR name IS NOT NULL
ORDER BY abandoned_at DESC;
```

## Fallback Automático

Si la tabla no existe o hay errores de conexión:
- ✅ Los eventos se guardan en `localStorage` como fallback
- ✅ Se reintentan automáticamente cuando hay conexión
- ✅ Se muestran warnings en consola en desarrollo

## Mejores Prácticas Implementadas

1. ✅ **Tracking no bloqueante** - No afecta la experiencia del usuario
2. ✅ **Debounce en campos** - Evita saturar con eventos
3. ✅ **Fallback a localStorage** - Nunca se pierden datos
4. ✅ **Fingerprinting mejorado** - Identifica usuarios únicos
5. ✅ **IP tracking** - Con múltiples servicios de respaldo
6. ✅ **Session tracking** - Identifica sesiones únicas
7. ✅ **Abandono tracking** - Captura cuando usuarios salen

## Próximos Pasos Recomendados

1. **Ejecutar las migraciones SQL** (crítico)
2. **Monitorear la tabla `quote_events`** durante unos días
3. **Crear dashboard** para visualizar el funnel
4. **Configurar alertas** para leads calientes que abandonan
5. **Implementar retargeting** basado en eventos de abandono

