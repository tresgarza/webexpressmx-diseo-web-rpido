# Consultas SQL para Contactar Leads

## 🎯 Objetivo
Identificar y contactar leads lo antes posible usando el teléfono capturado tempranamente.

## 📱 Leads con Teléfono Disponible (Prioridad Alta)

```sql
-- Leads con teléfono que están en proceso de cotización
SELECT 
  id,
  name,
  phone,
  email,
  plan_selected,
  last_step_reached,
  session_id,
  created_at,
  CASE 
    WHEN last_step_reached >= 3 THEN 'Completó formulario'
    WHEN last_step_reached = 2 THEN 'Seleccionó timeline'
    WHEN last_step_reached = 1 THEN 'Seleccionó plan'
    ELSE 'Inició cotización'
  END as progreso
FROM web_dev_leads
WHERE phone IS NOT NULL 
  AND phone != ''
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY 
  last_step_reached DESC,
  created_at DESC;
```

## 🔥 Leads Calientes (Teléfono + Plan Seleccionado)

```sql
-- Leads más calientes: tienen teléfono Y seleccionaron plan
SELECT 
  l.id,
  l.name,
  l.phone,
  l.email,
  l.plan_selected,
  l.last_step_reached,
  l.created_at,
  COUNT(e.id) as total_eventos,
  MAX(e.timestamp) as ultima_interaccion
FROM web_dev_leads l
LEFT JOIN web_dev_quote_events e ON l.session_id = e.session_id
WHERE l.phone IS NOT NULL 
  AND l.phone != ''
  AND l.plan_selected IS NOT NULL
  AND l.created_at >= NOW() - INTERVAL '7 days'
GROUP BY l.id, l.name, l.phone, l.email, l.plan_selected, l.last_step_reached, l.created_at
ORDER BY ultima_interaccion DESC NULLS LAST;
```

## ⚡ Leads Recientes con Teléfono (Últimas 2 horas)

```sql
-- Leads que dejaron teléfono en las últimas 2 horas
SELECT 
  l.id,
  l.name,
  l.phone,
  l.email,
  l.plan_selected,
  l.last_step_reached,
  l.session_id,
  l.created_at,
  -- Ver eventos recientes
  (
    SELECT COUNT(*) 
    FROM web_dev_quote_events e 
    WHERE e.session_id = l.session_id
  ) as eventos_totales
FROM web_dev_leads l
WHERE l.phone IS NOT NULL 
  AND l.phone != ''
  AND l.created_at >= NOW() - INTERVAL '2 hours'
ORDER BY l.created_at DESC;
```

## 📊 Leads por Paso de Progreso

```sql
-- Ver distribución de leads con teléfono por paso
SELECT 
  CASE 
    WHEN last_step_reached >= 3 THEN 'Completó (3+)'
    WHEN last_step_reached = 2 THEN 'Timeline (2)'
    WHEN last_step_reached = 1 THEN 'Plan (1)'
    ELSE 'Inicio (0)'
  END as paso,
  COUNT(*) as total_leads,
  COUNT(DISTINCT phone) FILTER (WHERE phone IS NOT NULL) as con_telefono,
  COUNT(DISTINCT email) FILTER (WHERE email IS NOT NULL AND email NOT LIKE 'temp_%@pending.com') as con_email_real
FROM web_dev_leads
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY paso
ORDER BY paso DESC;
```

## 🎯 Leads Abandonados con Teléfono (Para Retargeting)

```sql
-- Leads que abandonaron pero dejaron teléfono
SELECT DISTINCT ON (l.session_id)
  l.id,
  l.name,
  l.phone,
  l.email,
  l.plan_selected,
  l.last_step_reached,
  e.timestamp as abandoned_at,
  e.addon_ids,
  e.timeline_id
FROM web_dev_leads l
INNER JOIN web_dev_quote_events e ON l.session_id = e.session_id
WHERE l.phone IS NOT NULL 
  AND l.phone != ''
  AND e.event_type = 'quote_abandoned'
  AND e.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY l.session_id, e.timestamp DESC;
```

## 📈 Dashboard de Leads Activos

```sql
-- Vista completa de leads activos con teléfono
SELECT 
  l.id,
  l.name,
  l.phone,
  l.email,
  l.plan_selected,
  l.last_step_reached,
  l.session_id,
  l.created_at,
  l.ip_address,
  -- Eventos recientes
  (
    SELECT event_type 
    FROM web_dev_quote_events e 
    WHERE e.session_id = l.session_id 
    ORDER BY e.timestamp DESC 
    LIMIT 1
  ) as ultimo_evento,
  (
    SELECT timestamp 
    FROM web_dev_quote_events e 
    WHERE e.session_id = l.session_id 
    ORDER BY e.timestamp DESC 
    LIMIT 1
  ) as ultima_interaccion
FROM web_dev_leads l
WHERE l.phone IS NOT NULL 
  AND l.phone != ''
  AND l.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY l.last_step_reached DESC, l.created_at DESC;
```

## 🚀 Query para Exportar a WhatsApp/CRM

```sql
-- Formato listo para contacto directo
SELECT 
  phone as telefono,
  COALESCE(name, 'Cliente') as nombre,
  plan_selected as plan,
  CASE 
    WHEN last_step_reached >= 3 THEN 'Completó cotización'
    WHEN last_step_reached = 2 THEN 'Seleccionó timeline'
    WHEN last_step_reached = 1 THEN 'Seleccionó plan'
    ELSE 'Inició proceso'
  END as estado,
  created_at::date as fecha,
  created_at::time as hora
FROM web_dev_leads
WHERE phone IS NOT NULL 
  AND phone != ''
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY last_step_reached DESC, created_at DESC;
```

## 💡 Tips de Uso

1. **Contacto Inmediato**: Usa la query "Leads Recientes con Teléfono" cada 2 horas
2. **Priorización**: Contacta primero a los que tienen `last_step_reached >= 2` (ya seleccionaron timeline)
3. **Retargeting**: Usa "Leads Abandonados con Teléfono" para seguimiento
4. **Exportación**: Usa la query de exportación para cargar en tu CRM o WhatsApp Business

## 📱 Formato de Mensaje Sugerido

```
Hola {nombre}, 

Vi que estás interesado en nuestro plan {plan_selected}. 
¿Te gustaría que te ayude a personalizar tu cotización?

[Link directo a cotización con plan preseleccionado]
```




