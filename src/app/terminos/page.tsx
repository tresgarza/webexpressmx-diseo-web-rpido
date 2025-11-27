import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de servicio de SitioExpress.mx",
};

export default function TerminosPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground">
              Al utilizar el sitio web sitioexpress.mx y/o contratar nuestros servicios, aceptas estos términos 
              y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, te pedimos 
              que no utilices nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground mb-4">
              SitioExpress ofrece servicios de diseño y desarrollo de sitios web. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Diseño y desarrollo de páginas web (landing pages, sitios corporativos, etc.).</li>
              <li>Servicios adicionales (add-ons) como branding, copywriting, SEO, etc.</li>
              <li>Soporte técnico por un período determinado según el plan contratado.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Cotizaciones</h2>
            <p className="text-muted-foreground mb-4">
              Las cotizaciones generadas a través de nuestro cotizador en línea son estimaciones iniciales y están sujetas a:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Confirmación después de revisar los requerimientos específicos del proyecto.</li>
              <li>Cambios basados en la complejidad real del proyecto.</li>
              <li>Vigencia de 15 días desde su generación.</li>
              <li>Disponibilidad de los descuentos y promociones vigentes al momento de la cotización.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Las cotizaciones no representan un compromiso contractual</strong> hasta que ambas partes 
              confirmen los términos por escrito y se realice el pago inicial.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Proceso de Contratación</h2>
            <p className="text-muted-foreground mb-4">
              El proceso de contratación incluye los siguientes pasos:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Solicitud de cotización a través de nuestro sitio web.</li>
              <li>Contacto por parte de nuestro equipo para confirmar requerimientos.</li>
              <li>Propuesta formal con alcance, tiempos y costos definitivos.</li>
              <li>Aceptación de la propuesta y pago inicial (50% del total).</li>
              <li>Inicio del proyecto.</li>
              <li>Entrega y revisiones según el plan contratado.</li>
              <li>Pago final (50% restante) y entrega definitiva.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Pagos y Facturación</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Anticipo:</strong> 50% al confirmar el proyecto.</li>
              <li><strong>Pago final:</strong> 50% restante antes de la entrega final.</li>
              <li>Aceptamos transferencias bancarias y pagos electrónicos.</li>
              <li>Emitimos facturas fiscales (CFDI) para clientes que lo requieran.</li>
              <li>Los precios mostrados son en pesos mexicanos (MXN) e incluyen IVA.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Tiempos de Entrega</h2>
            <p className="text-muted-foreground mb-4">
              Los tiempos de entrega indicados son estimados y dependen de:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>La entrega oportuna de contenido (textos, imágenes, logos) por parte del cliente.</li>
              <li>La disponibilidad para sesiones de feedback y aprobación.</li>
              <li>La complejidad real del proyecto una vez iniciado.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Los días indicados son <strong>días hábiles</strong> (lunes a viernes, excluyendo días festivos).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Revisiones</h2>
            <p className="text-muted-foreground">
              Cada plan incluye un número determinado de rondas de revisiones. Las revisiones adicionales 
              fuera del alcance original pueden generar costos adicionales que serán comunicados previamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Propiedad Intelectual</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Una vez realizado el pago completo, el cliente obtiene los derechos de uso del sitio web entregado.</li>
              <li>El cliente es responsable de proporcionar contenido del cual tenga derechos de uso.</li>
              <li>SitioExpress se reserva el derecho de mostrar el proyecto en su portafolio, salvo acuerdo contrario.</li>
              <li>El código fuente se entrega al cliente según las condiciones del plan contratado.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Cancelaciones y Reembolsos</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Antes de iniciar:</strong> Reembolso completo del anticipo.</li>
              <li><strong>Durante el proyecto:</strong> El anticipo cubre el trabajo realizado hasta la fecha de cancelación. 
                  No hay reembolso proporcional una vez iniciado el desarrollo.</li>
              <li><strong>Después de entrega:</strong> No hay reembolsos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Garantía y Soporte</h2>
            <p className="text-muted-foreground">
              Ofrecemos soporte técnico según el plan contratado:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Plan Starter:</strong> 30 días de soporte para bugs.</li>
              <li><strong>Plan Business:</strong> 60 días de soporte técnico.</li>
              <li><strong>Plan Pro Plus:</strong> 90 días de soporte prioritario.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              El soporte cubre corrección de errores técnicos, no cambios de diseño ni nuevas funcionalidades.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground">
              SitioExpress no será responsable por:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Pérdidas de datos o ingresos derivadas del uso del sitio web.</li>
              <li>Problemas causados por terceros (hosting, dominios, plugins).</li>
              <li>Contenido proporcionado por el cliente que viole derechos de autor.</li>
              <li>Daños indirectos o consecuentes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Modificaciones</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán 
              en vigor al publicarse en este sitio. Los proyectos en curso se regirán por los términos vigentes 
              al momento de su contratación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Ley Aplicable</h2>
            <p className="text-muted-foreground">
              Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se 
              someterá a los tribunales competentes de Monterrey, Nuevo León, México.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">14. Contacto</h2>
            <p className="text-muted-foreground">
              Para cualquier pregunta sobre estos términos:
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

