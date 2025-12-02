# Guía de Verificación de Tracking

Esta guía te ayuda a verificar que todos los eventos de tracking estén funcionando correctamente antes de lanzar campañas en Facebook y Google.

## Herramientas Necesarias

### Para Facebook Pixel
1. **Facebook Pixel Helper** (Extensión Chrome)
   - Descargar: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
   - Muestra todos los eventos del Pixel en tiempo real

2. **Facebook Events Manager**
   - URL: https://business.facebook.com/events_manager
   - Test Events: Ver eventos en tiempo real con código de test

### Para Google Analytics/Ads
1. **Google Tag Assistant** (Extensión Chrome)
   - Descargar: https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk
   - Muestra todos los tags de Google activos

2. **GA4 DebugView**
   - URL: https://analytics.google.com/analytics/web/ → Configure → DebugView
   - Ver eventos en tiempo real

3. **Google Ads Conversion Tracking Status**
   - URL: https://ads.google.com → Tools & Settings → Conversions
   - Verificar estado de conversiones

## Eventos a Verificar

### 1. Page View
**Dispara cuando:** Usuario carga cualquier página
**Dónde verificar:**
- Facebook Pixel Helper: Debe mostrar evento `PageView`
- GA4: Evento `page_view` en DebugView

### 2. Quote Start (InitiateCheckout)
**Dispara cuando:** Usuario inicia el cotizador
**Dónde verificar:**
- Facebook Pixel Helper: Evento `InitiateCheckout`
- GTM DataLayer: Evento `quote_start`
- Facebook CAPI: Check en Events Manager (Test Events)

**Cómo probar:**
1. Ir a la página principal
2. Hacer clic en "Cotizar Ahora" o cualquier CTA que abra el cotizador
3. Verificar en las herramientas

### 3. Plan Selected (AddToCart)
**Dispara cuando:** Usuario selecciona un plan
**Dónde verificar:**
- Facebook Pixel Helper: Evento `AddToCart`
- GTM DataLayer: Evento `plan_selected`

**Cómo probar:**
1. Iniciar el cotizador
2. Seleccionar un plan (Starter, Business, Pro)
3. Verificar en las herramientas

### 4. Phone Provided
**Dispara cuando:** Usuario proporciona número de teléfono
**Dónde verificar:**
- Facebook Pixel Helper: Evento custom `PhoneProvided`
- GTM DataLayer: Evento `phone_provided`

### 5. Lead Conversion (CRÍTICO)
**Dispara cuando:** Usuario completa el formulario de cotización
**Dónde verificar:**
- Facebook Pixel Helper: 
  - Evento `Lead`
  - Evento `CompleteRegistration`
- Google Ads: Conversión en estado "Recording conversions"
- GA4: Evento `generate_lead`
- Facebook CAPI: Evento `Lead` en Events Manager

**Cómo probar:**
1. Completar todo el flujo del cotizador
2. Llenar datos de contacto
3. Enviar formulario
4. Verificar en todas las herramientas

### 6. Thank You Page View
**Dispara cuando:** Usuario llega a /gracias
**Dónde verificar:**
- Facebook Pixel Helper: Evento `ViewContent`
- GTM DataLayer: Evento `thank_you_page_view`

### 7. WhatsApp Click
**Dispara cuando:** Usuario hace clic en botón de WhatsApp
**Dónde verificar:**
- Facebook Pixel Helper: Evento custom `WhatsAppClick`
- GTM DataLayer: Evento `whatsapp_click`

### 8. Schedule Call Click
**Dispara cuando:** Usuario hace clic en "Agendar Llamada"
**Dónde verificar:**
- Facebook Pixel Helper: Evento `Schedule`
- GTM DataLayer: Evento `schedule_call_click`

## Verificación de Conversion API (Server-Side)

### Endpoint de Health Check
```
GET /api/facebook-conversion
```

Respuesta esperada:
```json
{
  "status": "ok",
  "configured": true,
  "pixelId": "626633394773155"
}
```

### Verificar en Facebook Events Manager
1. Ir a Events Manager
2. Seleccionar el Pixel
3. Click en "Test Events"
4. Copiar el código de test
5. Realizar una conversión
6. Verificar que aparezca en Test Events con:
   - Browser Event (del Pixel)
   - Server Event (de Conversion API)
   - Match Quality Score

## Verificación de Deduplicación

Para verificar que la deduplicación funciona correctamente:

1. En Events Manager, ir a "Test Events"
2. Realizar una conversión de prueba
3. Verificar que solo se contabilice 1 evento (no duplicado)
4. El event_id debe coincidir entre Browser y Server events

## Variables de Entorno Necesarias

### Configuradas en Vercel (ya activas)
- `NEXT_PUBLIC_FB_PIXEL_ID` - Facebook Pixel ID
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID
- `NEXT_PUBLIC_GA4_ID` - Google Analytics 4 ID

### Para activar Google Ads
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - Formato: AW-XXXXXXXXX
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` - Formato: XXXXXXXXXXX

### Para activar Facebook Conversion API
- `FB_CONVERSION_API_ACCESS_TOKEN` - Token de acceso (NO usar NEXT_PUBLIC_)

### Para verificación de dominio
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Código de Google Search Console
- `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION` - Código de Facebook Business

## Obtener Credenciales

### Facebook Conversion API Access Token
1. Ir a Business Manager → Events Manager
2. Seleccionar tu Pixel
3. Click en Settings
4. Scroll hasta "Conversions API"
5. Click en "Generate access token"
6. Copiar y agregar a Vercel como `FB_CONVERSION_API_ACCESS_TOKEN`

### Google Ads Conversion ID y Label
1. Ir a Google Ads → Tools & Settings → Conversions
2. Click en la conversión existente o crear nueva
3. Click en "Tag setup" → "Use Google Tag Manager"
4. Copiar Conversion ID (AW-XXXXXXXXX)
5. Copiar Conversion Label
6. Agregar a Vercel

### Facebook Domain Verification
1. Ir a Business Settings → Brand Safety → Domains
2. Agregar tu dominio
3. Copiar el código de verificación meta tag
4. Agregar a Vercel como `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION`

### Google Search Console Verification
1. Ir a Google Search Console
2. Agregar propiedad
3. Seleccionar método "HTML tag"
4. Copiar el content del meta tag
5. Agregar a Vercel como `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

## Checklist de Verificación Pre-Campaña

### Facebook
- [ ] Pixel Helper muestra PageView en todas las páginas
- [ ] InitiateCheckout se dispara al iniciar cotizador
- [ ] Lead se dispara al completar formulario
- [ ] Events Manager muestra eventos en Test Events
- [ ] Conversion API está enviando eventos server-side
- [ ] Match Quality Score > 5 (idealmente > 7)
- [ ] Deduplicación funcionando (no eventos duplicados)
- [ ] Dominio verificado en Business Manager

### Google
- [ ] GA4 recibe page_view en todas las páginas
- [ ] generate_lead se dispara en conversiones
- [ ] Google Ads Conversion está en estado "Recording"
- [ ] Enhanced Conversions configurado (si aplica)
- [ ] Dominio verificado en Search Console

### General
- [ ] Cookie consent funciona correctamente
- [ ] Tracking respeta preferencias de cookies
- [ ] UTM parameters se capturan correctamente
- [ ] gclid/fbclid se capturan para atribución

## Solución de Problemas Comunes

### Pixel Helper no muestra eventos
1. Verificar que el sitio no esté en modo desarrollo
2. Verificar consentimiento de cookies
3. Limpiar caché del navegador
4. Verificar que el Pixel ID es correcto

### Conversion API no envía eventos
1. Verificar que `FB_CONVERSION_API_ACCESS_TOKEN` esté configurado
2. Verificar logs del servidor en Vercel
3. Probar endpoint de health check
4. Verificar permisos del token

### Google Ads Conversion no registra
1. Verificar que `GOOGLE_ADS_ID` y `GOOGLE_ADS_CONVERSION_LABEL` estén configurados
2. Esperar 24-48 horas para que las conversiones se reflejen
3. Verificar que el gtag está cargado correctamente

### Eventos duplicados
1. Verificar que event_id se está enviando correctamente
2. Verificar que CAPI y Pixel usan el mismo event_id
3. Revisar configuración de deduplicación en Events Manager



