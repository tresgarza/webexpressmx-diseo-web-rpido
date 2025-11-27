# Checklist de Preparación para Campañas

Este documento contiene el checklist completo para asegurar que el sitio está listo para lanzar campañas en Facebook Ads y Google Ads.

## 1. Assets Visuales

### Completado
- [x] `favicon.ico` - Icono del navegador (32x32)
- [x] `icon.svg` - Icono vectorial escalable
- [x] `apple-touch-icon.png` - Icono para dispositivos Apple (180x180)
- [x] `og-image.jpg` - Imagen para compartir en redes sociales (1200x630)
- [x] `logo-sitioexpress.png` - Logo principal
- [x] `manifest.json` - PWA manifest configurado

### Verificación
```bash
# Verificar que los assets existen
ls -la public/*.{ico,svg,png,jpg}
```

## 2. Tracking y Analytics

### Google Tag Manager
- [x] GTM instalado y funcionando
- [x] ID configurado: `GTM-KLPJG4Z2`
- [ ] Contenedor publicado (verificar en GTM)

### Google Analytics 4
- [x] GA4 instalado y funcionando
- [x] ID configurado: `G-QKL95SX2EX`
- [ ] Propiedad vinculada con Google Ads (opcional)

### Google Ads
- [x] Código de soporte para conversiones implementado
- [ ] Agregar `NEXT_PUBLIC_GOOGLE_ADS_ID` en Vercel (formato: AW-XXXXXXXXX)
- [ ] Agregar `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` en Vercel
- [ ] Verificar que conversiones están en estado "Recording"

### Facebook Pixel
- [x] Pixel instalado y funcionando
- [x] ID configurado: `626633394773155`
- [x] Eventos básicos implementados (PageView, InitiateCheckout, Lead)
- [x] Deduplicación con event_id implementada

### Facebook Conversion API
- [x] API route creada (`/api/facebook-conversion`)
- [ ] Agregar `FB_CONVERSION_API_ACCESS_TOKEN` en Vercel (secreto)
- [ ] Verificar eventos en Events Manager → Test Events
- [ ] Verificar Match Quality Score > 5

## 3. Eventos de Conversión

### Verificar en Facebook Pixel Helper
- [ ] PageView en todas las páginas
- [ ] InitiateCheckout al iniciar cotizador
- [ ] AddToCart al seleccionar plan
- [ ] Lead al completar formulario
- [ ] CompleteRegistration al completar formulario

### Verificar en GA4 DebugView
- [ ] page_view en todas las páginas
- [ ] quote_start al iniciar cotizador
- [ ] plan_selected al seleccionar plan
- [ ] generate_lead al completar formulario

### Verificar UTM Tracking
- [ ] utm_source se captura
- [ ] utm_medium se captura
- [ ] utm_campaign se captura
- [ ] gclid se captura (para Google Ads)
- [ ] fbclid se captura (para Facebook Ads)

## 4. SEO y Verificación de Dominio

### Meta Tags
- [x] Title optimizado
- [x] Description optimizada
- [x] Keywords configuradas
- [x] Open Graph tags completos
- [x] Twitter Cards configurados

### Verificación de Dominio
- [ ] Agregar `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` en Vercel
- [ ] Verificar dominio en Google Search Console
- [ ] Agregar `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION` en Vercel
- [ ] Verificar dominio en Facebook Business Manager

### SEO Técnico
- [x] robots.txt configurado
- [x] sitemap.xml generado
- [x] Canonical URLs configuradas
- [x] JSON-LD structured data
- [ ] Sitemap enviado a Google Search Console

## 5. Funcionalidad del Sitio

### Cotizador
- [ ] Todos los planes cargan correctamente
- [ ] Add-ons funcionan
- [ ] Formulario de contacto envía correctamente
- [ ] WhatsApp link funciona
- [ ] Página de gracias muestra correctamente

### Performance
- [ ] Lighthouse score > 80 en Performance
- [ ] Lighthouse score > 80 en Accessibility
- [ ] Lighthouse score > 80 en Best Practices
- [ ] Lighthouse score > 80 en SEO

### Responsividad
- [ ] Verificado en móvil
- [ ] Verificado en tablet
- [ ] Verificado en desktop

## 6. Variables de Entorno

### Ya Configuradas en Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://wypyrofixlyxzoeqndno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_GTM_ID=GTM-KLPJG4Z2
NEXT_PUBLIC_GA4_ID=G-QKL95SX2EX
NEXT_PUBLIC_FB_PIXEL_ID=626633394773155
```

### Pendientes de Configurar
```
# Google Ads (si se usa)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXX

# Facebook Conversion API (secreto - NO usar NEXT_PUBLIC_)
FB_CONVERSION_API_ACCESS_TOKEN=EAAxxxxxxx...

# Verificación de dominio
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxx
NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=xxxxxxxxxxxxx
```

## 7. Páginas de Destino (Landing Pages)

### URLs Principales para Campañas
| Página | URL | Propósito |
|--------|-----|-----------|
| Home | https://sitioexpress.mx | Landing principal |
| Cotizador | https://sitioexpress.mx/cotizaciones | Conversiones directas |

### Parámetros de Tracking Recomendados
```
# Para Facebook Ads
?utm_source=facebook&utm_medium=cpc&utm_campaign=NOMBRE_CAMPANA

# Para Google Ads
?utm_source=google&utm_medium=cpc&utm_campaign=NOMBRE_CAMPANA
```

## 8. Configuración de Campañas

### Facebook Ads
- [ ] Pixel configurado en Business Manager
- [ ] Eventos de conversión seleccionados (Lead)
- [ ] Público objetivo definido
- [ ] Creativos preparados
- [ ] Presupuesto definido

### Google Ads
- [ ] Cuenta de Google Ads activa
- [ ] Conversiones configuradas
- [ ] Palabras clave investigadas
- [ ] Anuncios creados
- [ ] Presupuesto definido

## 9. Pre-Launch Final

### Antes de Lanzar
1. [ ] Hacer deploy a producción
2. [ ] Verificar que el sitio carga correctamente
3. [ ] Hacer una conversión de prueba
4. [ ] Verificar que eventos llegan a Facebook Events Manager
5. [ ] Verificar que eventos llegan a Google Analytics
6. [ ] Verificar Match Quality Score en Facebook
7. [ ] Limpiar eventos de prueba (si es necesario)

### Después de Lanzar
1. [ ] Monitorear primeras conversiones
2. [ ] Verificar atribución correcta
3. [ ] Ajustar pujas según performance
4. [ ] Revisar Search Query Report (Google Ads)
5. [ ] Revisar Quality Score de anuncios

## 10. Contactos y Recursos

### Herramientas de Verificación
- Facebook Pixel Helper: Chrome Extension
- Google Tag Assistant: Chrome Extension
- GA4 DebugView: analytics.google.com

### Documentación
- [TRACKING_TEST_GUIDE.md](./TRACKING_TEST_GUIDE.md) - Guía detallada de testing
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Configuración de Vercel

### URLs Importantes
- Facebook Events Manager: https://business.facebook.com/events_manager
- Google Ads: https://ads.google.com
- Google Analytics: https://analytics.google.com
- Google Search Console: https://search.google.com/search-console

## Estado Actual

### Implementado
- ✅ Google Tag Manager
- ✅ Google Analytics 4
- ✅ Facebook Pixel
- ✅ Facebook Conversion API
- ✅ Google Ads support
- ✅ Event deduplication
- ✅ Advanced Matching (Facebook)
- ✅ Enhanced Conversions (Google)
- ✅ UTM tracking
- ✅ SEO basics
- ✅ Visual assets

### Pendiente (Configuración Manual)
- ⏳ Google Ads conversion ID/label
- ⏳ Facebook Conversion API access token
- ⏳ Domain verification codes
- ⏳ Final testing con herramientas
- ⏳ Lighthouse audit

---

**Última actualización:** {{ fecha }}

**Nota:** Este checklist debe revisarse cada vez que se hagan cambios significativos al tracking o se preparen nuevas campañas.

