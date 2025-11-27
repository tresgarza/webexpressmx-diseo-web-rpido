# Sistema de Tracking del Cotizador Express

## Descripción

Se ha implementado un sistema completo de tracking para el Cotizador Express que permite:

1. **Rastrear eventos del cotizador**: Inicio, selección de plan, add-ons, timeline, abandono, completado
2. **Identificar usuarios**: Usando session_id y user_fingerprint almacenados en localStorage
3. **Capturar datos parciales**: Email, teléfono, nombre cuando están disponibles
4. **Analizar conversión**: Ver quién inició pero no completó el proceso

## Configuración en Supabase

### Paso 1: Crear la tabla `quote_events`

Ejecuta el SQL en `src/lib/supabase-migrations.sql` en el SQL Editor de Supabase:

```sql
-- Ver el archivo completo: src/lib/supabase-migrations.sql
```

Este script crea:
- Tabla `quote_events` para almacenar todos los eventos
- Índices para optimizar consultas
- Vistas útiles: `abandoned_quotes`, `completed_quotes`, `quote_funnel`
- Políticas de seguridad (RLS)

### Paso 2: Verificar permisos

Asegúrate de que la política de inserción permita inserts públicos (ya está configurada en el script).

## Eventos que se Trackean

1. **quote_started**: Usuario inició el cotizador
2. **plan_selected**: Usuario seleccionó un plan
3. **addon_selected**: Usuario agregó un add-on
4. **addon_removed**: Usuario removió un add-on
5. **timeline_selected**: Usuario seleccionó timeline/urgencia
6. **step_changed**: Usuario avanzó/retrocedió entre pasos
7. **quote_abandoned**: Usuario abandonó el cotizador (cerró página/navegó fuera)
8. **quote_completed**: Usuario completó y envió la cotización

## Consultas Útiles

### Ver cotizaciones abandonadas con datos de contacto

```sql
SELECT 
  email,
  phone,
  name,
  plan_id,
  addon_ids,
  timeline_id,
  step,
  abandoned_at,
  url
FROM abandoned_quotes
WHERE email IS NOT NULL OR phone IS NOT NULL
ORDER BY abandoned_at DESC;
```

### Ver funnel de conversión por día

```sql
SELECT * FROM quote_funnel
ORDER BY date DESC
LIMIT 30;
```

### Ver usuarios que iniciaron pero no completaron (con datos)

```sql
SELECT DISTINCT ON (session_id)
  session_id,
  email,
  phone,
  name,
  plan_id,
  addon_ids,
  timeline_id,
  step,
  timestamp
FROM quote_events
WHERE event_type = 'quote_abandoned'
  AND (email IS NOT NULL OR phone IS NOT NULL)
ORDER BY session_id, timestamp DESC;
```

### Ver tasa de conversión

```sql
SELECT 
  COUNT(DISTINCT CASE WHEN event_type = 'quote_started' THEN session_id END) as started,
  COUNT(DISTINCT CASE WHEN event_type = 'quote_completed' THEN session_id END) as completed,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'quote_completed' THEN session_id END)::numeric /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'quote_started' THEN session_id END), 0) * 100,
    2
  ) as conversion_rate_percent
FROM quote_events
WHERE timestamp >= NOW() - INTERVAL '7 days';
```

## Identificación de Usuarios

El sistema usa dos métodos para identificar usuarios:

1. **session_id**: Generado al iniciar el cotizador, almacenado en localStorage
2. **user_fingerprint**: Basado en características del navegador, almacenado en localStorage

Ambos persisten entre sesiones del mismo navegador, permitiendo identificar usuarios que regresan.

## Datos Parciales

El sistema guarda automáticamente datos parciales en localStorage cuando:
- Usuario selecciona un plan
- Usuario selecciona add-ons
- Usuario selecciona timeline
- Usuario avanza entre pasos

Estos datos se pueden recuperar si el usuario regresa más tarde.

## Mensajes de "Sin Compromiso"

Se agregaron mensajes claros en varios lugares:

1. **Hero del cotizador**: Badges visibles "Sin compromiso", "Ajustable a tu criterio", "Sin pago inicial"
2. **Paso 1**: Mensaje explicando que es solo una estimación inicial
3. **Paso 2**: Mensaje sobre tiempos estimados y posibilidad de ajuste
4. **Paso 3**: Caja destacada explicando que no hay compromiso ni pago inicial hasta confirmar

## Notas Importantes

- El tracking funciona de forma asíncrona y no bloquea la UI
- Si la tabla no existe, los eventos se loguean en consola (solo en desarrollo)
- Los datos se limpian automáticamente después de 7 días en localStorage
- El tracking de abandono se activa cuando el usuario cierra la página/navega fuera

## Próximos Pasos Sugeridos

1. Crear un dashboard en el admin para visualizar estos datos
2. Implementar notificaciones cuando alguien abandona con datos de contacto
3. Agregar análisis de qué planes/add-ons son más populares
4. Implementar remarketing para usuarios que abandonaron




