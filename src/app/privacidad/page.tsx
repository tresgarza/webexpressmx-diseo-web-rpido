import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y tratamiento de datos personales de SitioExpress.mx",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground mb-4">
              En SitioExpress.mx recopilamos la siguiente información cuando utilizas nuestro cotizador o servicios:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Información de contacto:</strong> Nombre, correo electrónico y número de teléfono proporcionados voluntariamente.</li>
              <li><strong>Información del proyecto:</strong> Tipo de plan seleccionado, add-ons, urgencia de entrega y mensajes adicionales.</li>
              <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo y sistema operativo.</li>
              <li><strong>Datos de navegación:</strong> Páginas visitadas, tiempo de permanencia e interacciones con el sitio.</li>
              <li><strong>Ubicación general:</strong> Ciudad y región basada en dirección IP (no ubicación exacta).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Uso de la Información</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Procesar y responder a tus solicitudes de cotización.</li>
              <li>Contactarte respecto a los servicios solicitados.</li>
              <li>Mejorar nuestro sitio web y servicios.</li>
              <li>Enviar comunicaciones relacionadas con tu proyecto (nunca spam).</li>
              <li>Cumplir con obligaciones legales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Cookies y Tecnologías de Seguimiento</h2>
            <p className="text-muted-foreground mb-4">
              Nuestro sitio utiliza las siguientes tecnologías:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Google Analytics:</strong> Para entender cómo los usuarios interactúan con nuestro sitio.</li>
              <li><strong>Google Tag Manager:</strong> Para gestionar scripts de análisis.</li>
              <li><strong>Facebook Pixel:</strong> Para medir la efectividad de nuestros anuncios (si llegas desde Facebook/Instagram).</li>
              <li><strong>Cookies de sesión:</strong> Para mantener tu progreso en el cotizador.</li>
              <li><strong>LocalStorage:</strong> Para guardar preferencias temporales.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Puedes desactivar las cookies en la configuración de tu navegador, aunque esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Compartir Información</h2>
            <p className="text-muted-foreground mb-4">
              <strong>No vendemos ni rentamos tu información personal.</strong> Solo compartimos datos con:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Proveedores de servicios:</strong> Herramientas necesarias para operar (Supabase para base de datos, Vercel para hosting).</li>
              <li><strong>Autoridades:</strong> Cuando sea requerido por ley.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Seguridad de los Datos</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Conexiones cifradas (HTTPS/SSL).</li>
              <li>Acceso restringido a datos personales.</li>
              <li>Almacenamiento seguro en servidores protegidos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Tus Derechos</h2>
            <p className="text-muted-foreground mb-4">
              De acuerdo con la Ley Federal de Protección de Datos Personales (LFPDPPP), tienes derecho a:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> Corregir datos incorrectos.</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos.</li>
              <li><strong>Oposición:</strong> Oponerte al uso de tus datos para ciertos fines.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Para ejercer estos derechos, contáctanos por WhatsApp al <strong>+52 81 1636 4522</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Retención de Datos</h2>
            <p className="text-muted-foreground">
              Conservamos tu información de contacto por el tiempo necesario para dar seguimiento a tu solicitud 
              y por un período adicional razonable para cumplir con obligaciones legales (generalmente 3 años).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cambios a esta Política</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos 
              publicando la nueva política en esta página con la fecha de actualización.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Contacto</h2>
            <p className="text-muted-foreground">
              Si tienes preguntas sobre esta política de privacidad, puedes contactarnos:
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mt-4">
              <li><strong>WhatsApp:</strong> +52 81 1636 4522</li>
              <li><strong>Ubicación:</strong> Monterrey, Nuevo León, México</li>
            </ul>
          </section>
        </div>

        {/* Back to home */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}



