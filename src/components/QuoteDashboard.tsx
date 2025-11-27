"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Clock,
  User,
  Mail,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Phone,
  MapPin,
  StickyNote,
  Send,
  PhoneOff,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getQuotes,
  getQuoteStats,
  getPlansForFilter,
  getEventsForSession,
  buildWhatsAppURLFromQuote,
  calculateQuoteUrgency,
  formatQuoteDate,
  getTimelineLabel,
  parseQuoteMetadata,
  updateQuoteStatus,
  addQuoteNote,
  getFunnelStats,
  getStatusInfo,
  getDateRangeForPeriod,
  type QuoteLead,
  type QuoteFilters,
  type QuoteStats,
  type QuoteEvent,
  type QuoteStatus,
  type FunnelStats,
} from "@/lib/quote-dashboard";
import { getLocationFromIP, formatLocation, type LocationData } from "@/lib/geolocation";
import { toast } from "sonner";

// Period selector type
type PeriodType = 'today' | '7d' | '30d' | 'all';

// Funnel Step Component
function FunnelStep({
  label,
  value,
  percentage,
  icon: Icon,
  color,
  isLast,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  percentage: number;
  icon: React.ElementType;
  color: string;
  isLast?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-center flex-1">
      <div 
        onClick={onClick}
        className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer ${
          isActive 
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
            : `border-border bg-card hover:border-primary/50 hover:bg-card/80 ${color}`
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {percentage > 0 ? `${percentage.toFixed(1)}%` : '-'}
        </p>
      </div>
      {!isLast && (
        <ChevronRight className="w-5 h-5 text-muted-foreground mx-2 flex-shrink-0" />
      )}
    </div>
  );
}

// Quick Filter Button
function QuickFilterButton({
  label,
  icon: Icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
          active ? 'bg-primary-foreground/20' : 'bg-background'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Status Dropdown
function StatusDropdown({
  status,
  onStatusChange,
  disabled,
}: {
  status: QuoteStatus;
  onStatusChange: (status: QuoteStatus) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const statusInfo = getStatusInfo(status);

  const statuses: QuoteStatus[] = ['pending', 'contacted', 'processed', 'lost'];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor} hover:opacity-80 transition-opacity`}
      >
        {statusInfo.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[120px]"
            >
              {statuses.map((s) => {
                const info = getStatusInfo(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(s);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg ${info.color}`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Notes Modal - Follow-up Timeline Style
function NotesModal({
  quote,
  onClose,
  onAddNote,
}: {
  quote: QuoteLead;
  onClose: () => void;
  onAddNote: (note: string) => Promise<void>;
}) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const metadata = parseQuoteMetadata(quote.message);
  const statusInfo = getStatusInfo(metadata.status);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    await onAddNote(newNote.trim());
    setNewNote("");
    setIsSubmitting(false);
  };

  // Sort notes chronologically (oldest first for timeline, but we store newest first)
  const sortedNotes = [...metadata.notes].reverse();

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    try {
      // Try to parse the date string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Seguimiento
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{quote.name} • {quote.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                {statusInfo.label}
              </span>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add new note */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Agregar seguimiento... (ej: Llamada realizada, enviado presupuesto, etc.)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">⌘ + Enter para enviar</span>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!newNote.trim() || isSubmitting}
                  size="sm"
                  className="h-8"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 mr-1" />
                  )}
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {sortedNotes.length > 0 || metadata.originalMessage ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              {/* Timeline items */}
              <div className="space-y-4">
                {/* Original quote submission */}
                <div className="relative flex gap-3 pl-8">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-background z-10">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-emerald-600">Cotización recibida</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString('es-MX', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Plan: {quote.budget || 'No especificado'} • Timeline: {quote.timeline || 'Flexible'}
                    </p>
                    {metadata.originalMessage && (
                      <p className="text-sm mt-2 bg-background/50 rounded p-2 italic">
                        "{metadata.originalMessage}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes timeline */}
                {sortedNotes.map((note, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-3 pl-8"
                  >
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background z-10">
                      <StickyNote className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-primary">Seguimiento</span>
                        <span className="text-xs text-muted-foreground" title={note.date}>
                          {formatRelativeTime(note.date)}
                        </span>
                      </div>
                      <p className="text-sm">{note.text}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Current status indicator */}
                <div className="relative flex gap-3 pl-8">
                  <div className={`absolute left-0 w-8 h-8 rounded-full ${statusInfo.bgColor} flex items-center justify-center border-2 border-background z-10`}>
                    {metadata.status === 'pending' && <Clock className={`w-4 h-4 ${statusInfo.color}`} />}
                    {metadata.status === 'contacted' && <MessageSquare className={`w-4 h-4 ${statusInfo.color}`} />}
                    {metadata.status === 'processed' && <CheckCircle className={`w-4 h-4 ${statusInfo.color}`} />}
                    {metadata.status === 'lost' && <XCircle className={`w-4 h-4 ${statusInfo.color}`} />}
                  </div>
                  <div className={`flex-1 rounded-lg p-3 border-2 border-dashed ${statusInfo.bgColor} border-current`}>
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      Estado actual: {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <StickyNote className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No hay seguimientos registrados</p>
              <p className="text-xs text-muted-foreground mt-1">Agrega tu primer seguimiento arriba</p>
            </div>
          )}
        </div>

        {/* Footer with quick info */}
        <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>{sortedNotes.length} seguimiento(s)</span>
          <span>
            {quote.phone ? (
              <span className="text-emerald-600">📱 {quote.phone}</span>
            ) : (
              <span className="text-amber-600">⚠️ Sin teléfono</span>
            )}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quote Row Component
function QuoteRow({
  quote,
  plans,
  location,
  onViewDetails,
  onWhatsApp,
  onStatusChange,
  onOpenNotes,
}: {
  quote: QuoteLead;
  plans: { id: string; name: string; slug: string }[];
  location?: LocationData | null;
  onViewDetails: (quote: QuoteLead) => void;
  onWhatsApp: (quote: QuoteLead) => void;
  onStatusChange: (quote: QuoteLead, status: QuoteStatus) => void;
  onOpenNotes: (quote: QuoteLead) => void;
}) {
  const urgency = calculateQuoteUrgency(quote.timeline, quote.created_at);
  const plan = plans.find((p) => p.slug === quote.plan_selected || p.id === quote.plan_selected);
  const metadata = parseQuoteMetadata(quote.message);
  const hasPhone = !!quote.phone;

  // Row background based on status and urgency
  const getRowBg = () => {
    if (metadata.status === 'processed') return 'bg-emerald-500/5';
    if (metadata.status === 'lost') return 'bg-red-500/5';
    if (urgency.level === 1) return 'bg-red-500/5';
    if (urgency.level === 2 && quote.timeline === 'week') return 'bg-orange-500/5';
    return '';
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-border hover:bg-muted/30 transition-colors ${getRowBg()}`}
    >
      {/* Name & Email */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            hasPhone ? 'bg-emerald-500/10' : 'bg-muted'
          }`}>
            <User className={`w-4 h-4 ${hasPhone ? 'text-emerald-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium text-sm">{quote.name}</p>
            <p className="text-xs text-muted-foreground">{quote.email}</p>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="py-3 px-4">
        {hasPhone ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Phone className="w-3 h-3" />
            {quote.phone}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <PhoneOff className="w-3 h-3" />
            N/A
          </span>
        )}
      </td>

      {/* Location */}
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {formatLocation(location || null)}
        </span>
      </td>

      {/* Plan */}
      <td className="py-3 px-4">
        <span className="text-sm">{plan?.name || quote.budget || "-"}</span>
      </td>

      {/* Timeline */}
      <td className="py-3 px-4">
        <span className="text-sm">{getTimelineLabel(quote.timeline, null)}</span>
      </td>

      {/* Step Progress */}
      <td className="py-3 px-4">
        {quote.last_step_reached ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-2 h-2 rounded-full ${
                    stepNum <= (quote.last_step_reached || 0)
                      ? 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {quote.last_step_reached}/4
              {quote.last_step_reached < 4 && (
                <span className="ml-1 text-orange-600">En proceso</span>
              )}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusDropdown 
          status={metadata.status}
          onStatusChange={(newStatus) => onStatusChange(quote, newStatus)}
        />
      </td>

      {/* Date */}
      <td className="py-3 px-4">
        <span className="text-xs text-muted-foreground">
          {formatQuoteDate(quote.created_at)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewDetails(quote)}
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onOpenNotes(quote)}
            title="Notas"
          >
            <StickyNote className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className={`h-8 px-3 ${
              hasPhone 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => onWhatsApp(quote)}
            title={hasPhone ? 'Contactar por WhatsApp' : 'Sin teléfono'}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            WA
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

// Quote Detail Modal
function QuoteDetailModal({
  quote,
  plans,
  location,
  onClose,
  onWhatsApp,
  onStatusChange,
}: {
  quote: QuoteLead;
  plans: { id: string; name: string; slug: string }[];
  location?: LocationData | null;
  onClose: () => void;
  onWhatsApp: () => void;
  onStatusChange: (status: QuoteStatus) => void;
}) {
  const [events, setEvents] = useState<QuoteEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const plan = plans.find((p) => p.slug === quote.plan_selected || p.id === quote.plan_selected);
  const metadata = parseQuoteMetadata(quote.message);

  useEffect(() => {
    async function loadEvents() {
      if (quote.session_id) {
        setIsLoadingEvents(true);
        const eventsData = await getEventsForSession(quote.session_id);
        setEvents(eventsData);
        setIsLoadingEvents(false);
      } else {
        setIsLoadingEvents(false);
      }
    }
    loadEvents();
  }, [quote.session_id]);

  const urgency = calculateQuoteUrgency(quote.timeline, quote.created_at);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">Detalles de Cotización</h3>
            <p className="text-sm text-muted-foreground">{quote.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDropdown 
              status={metadata.status}
              onStatusChange={onStatusChange}
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Contact Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información de Contacto
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nombre:</span>
                <p className="font-medium">{quote.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{quote.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Teléfono:</span>
                <p className={`font-medium ${quote.phone ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {quote.phone || 'No proporcionado'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Ubicación:</span>
                <p className="font-medium">
                  {location ? `${location.city}, ${location.region}` : 'Desconocida'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha:</span>
                <p className="font-medium">
                  {new Date(quote.created_at).toLocaleString("es-MX")}
                </p>
              </div>
              {location?.postal && (
                <div>
                  <span className="text-muted-foreground">Código Postal:</span>
                  <p className="font-medium">{location.postal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quote Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Detalles de la Cotización
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Plan:</span>
                <p className="font-medium">{plan?.name || quote.budget || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Timeline:</span>
                <p className="font-medium">{getTimelineLabel(quote.timeline, null)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Urgencia:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${urgency.color}`}
                >
                  {urgency.label}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Step alcanzado:</span>
                <p className="font-medium">{quote.last_step_reached || "-"} / 4</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {metadata.notes.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notas ({metadata.notes.length})
              </h4>
              <div className="space-y-2">
                {metadata.notes.slice(0, 3).map((note, index) => (
                  <div key={index} className="bg-background rounded-lg p-2 text-sm">
                    <p>{note.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
                  </div>
                ))}
                {metadata.notes.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{metadata.notes.length - 3} notas más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timeline Events */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historial de Eventos
            </h4>
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay eventos registrados
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">
                        {event.event_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("es-MX")}
                        {event.step && ` • Paso ${event.step}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Info */}
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Información técnica
            </summary>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <p>Session ID: {quote.session_id || "-"}</p>
              <p>Fingerprint: {quote.user_fingerprint || "-"}</p>
              <p>IP: {quote.ip_address || "-"}</p>
              <p className="truncate">
                User Agent: {quote.user_agent || "-"}
              </p>
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            className={`${
              quote.phone 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={onWhatsApp}
            disabled={!quote.phone}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {quote.phone ? 'Contactar por WhatsApp' : 'Sin teléfono'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Dashboard Component
export function QuoteDashboard() {
  const [quotes, setQuotes] = useState<QuoteLead[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [locations, setLocations] = useState<Map<string, LocationData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteLead | null>(null);
  const [notesQuote, setNotesQuote] = useState<QuoteLead | null>(null);

  // Period and filters
  const [period, setPeriod] = useState<PeriodType>('7d');
  const [filters, setFilters] = useState<QuoteFilters>({
    status: "all",
    sortOrder: "desc",
  });
  const [searchText, setSearchText] = useState("");
  
  // Quick filters
  const [quickFilters, setQuickFilters] = useState({
    hasPhone: false,
    pending: false,
    urgent: false,
    contacted: false,
    // Funnel filters
    wizardStarted: false,
    planSelected: false,
    phoneProvided: false,
    completed: false,
  });

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    const dateRange = getDateRangeForPeriod(period);
    const filtersWithDate = {
      ...filters,
      searchText,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
    };

    const [quotesData, statsData, plansData, funnelData] = await Promise.all([
      getQuotes(filtersWithDate),
      getQuoteStats(dateRange?.from, dateRange?.to),
      getPlansForFilter(),
      getFunnelStats(dateRange?.from, dateRange?.to),
    ]);

    setQuotes(quotesData);
    setStats(statsData);
    setPlans(plansData);
    setFunnelStats(funnelData);

    // Load locations for quotes with IP addresses
    const ipsToLookup = quotesData
      .filter(q => q.ip_address)
      .map(q => q.ip_address!)
      .filter((ip, index, arr) => arr.indexOf(ip) === index); // unique

    // Fetch locations in background
    for (const ip of ipsToLookup.slice(0, 20)) { // Limit to first 20 to avoid rate limits
      try {
        const location = await getLocationFromIP(ip);
        if (location) {
          setLocations(prev => new Map(prev).set(ip, location));
        }
      } catch (e) {
        // Silently fail for geolocation
      }
    }

    setIsLoading(false);
  }, [filters, searchText, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered quotes with quick filters
  const filteredQuotes = useMemo(() => {
    let result = quotes;

    // Apply search filter locally for immediate feedback
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(search) ||
          q.email.toLowerCase().includes(search) ||
          (q.phone && q.phone.includes(search))
      );
    }

    // Apply quick filters
    if (quickFilters.hasPhone || quickFilters.phoneProvided) {
      result = result.filter(q => !!q.phone);
    }
    if (quickFilters.pending) {
      const pendingStatuses = result.filter(q => {
        const metadata = parseQuoteMetadata(q.message);
        return metadata.status === 'pending';
      });
      result = pendingStatuses;
    }
    if (quickFilters.contacted) {
      const contactedStatuses = result.filter(q => {
        const metadata = parseQuoteMetadata(q.message);
        return metadata.status === 'contacted';
      });
      result = contactedStatuses;
    }
    if (quickFilters.urgent) {
      result = result.filter(q => q.timeline === 'urgent' || q.timeline === 'week');
    }
    if (quickFilters.planSelected) {
      result = result.filter(q => !!q.plan_selected);
    }
    if (quickFilters.completed) {
      // A completed quote is one that reached step 4 (actually submitted)
      // This is different from just providing phone - they must click "Completar Solicitud y Enviar a WhatsApp"
      const dateRange = getDateRangeForPeriod(period);
      result = result.filter(q => {
        // Must have reached step 4 to be considered completed
        const isCompleted = q.last_step_reached === 4;
        
        if (!isCompleted) return false;
        
        // Apply date filter if period is not 'all'
        if (dateRange && period !== 'all') {
          const quoteDate = new Date(q.created_at);
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          return quoteDate >= fromDate && quoteDate <= toDate;
        }
        
        return true;
      });
    }
    // wizardStarted filter would need event data, for now we'll use all quotes that have started
    // This is a simplified version - ideally we'd check events table
    if (quickFilters.wizardStarted) {
      // All quotes have started if they exist, so we show all
      // In a real implementation, you'd filter by events
    }

    return result;
  }, [quotes, searchText, quickFilters, period, funnelStats]);

  // Counts for quick filters
  const filterCounts = useMemo(() => ({
    hasPhone: quotes.filter(q => !!q.phone).length,
    pending: quotes.filter(q => parseQuoteMetadata(q.message).status === 'pending').length,
    urgent: quotes.filter(q => q.timeline === 'urgent' || q.timeline === 'week').length,
    contacted: quotes.filter(q => parseQuoteMetadata(q.message).status === 'contacted').length,
  }), [quotes]);

  // Handle WhatsApp
  const handleWhatsApp = (quote: QuoteLead) => {
    const plan = plans.find((p) => p.slug === quote.plan_selected || p.id === quote.plan_selected);
    const url = buildWhatsAppURLFromQuote(quote, plan ? { ...plan, price: 0, currency: 'MXN', features: [], is_popular: false, display_order: 0, is_active: true, created_at: '', updated_at: '' } : null);
    window.open(url, "_blank");
  };

  // Handle status change
  const handleStatusChange = async (quote: QuoteLead, status: QuoteStatus) => {
    const success = await updateQuoteStatus(quote.id, status);
    if (success) {
      toast.success(`Estado actualizado a ${getStatusInfo(status).label}`);
      loadData();
    } else {
      toast.error('Error al actualizar el estado');
    }
  };

  // Handle add note
  const handleAddNote = async (noteText: string) => {
    if (!notesQuote) return;
    
    const success = await addQuoteNote(notesQuote.id, noteText);
    
    if (success) {
      toast.success('Nota agregada');
      
      // Fetch the updated quote directly to refresh the modal immediately
      const dateRange = getDateRangeForPeriod(period);
      const updatedQuotes = await getQuotes({
        ...filters,
        searchText,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
      });
      
      // Update the quotes list
      setQuotes(updatedQuotes);
      
      // Find and update the current quote in the modal
      const updatedQuote = updatedQuotes.find(q => q.id === notesQuote.id);
      if (updatedQuote) {
        setNotesQuote(updatedQuote);
      }
    } else {
      toast.error('Error al agregar la nota');
    }
  };

  // Calculate funnel percentages
  const funnelPercentages = useMemo(() => {
    if (!funnelStats) return { wizard: 0, plan: 0, phone: 0, completed: 0 };
    const base = funnelStats.pageViews || 1;
    return {
      wizard: (funnelStats.wizardStarted / base) * 100,
      plan: (funnelStats.planSelected / funnelStats.wizardStarted || 1) * 100,
      phone: (funnelStats.phoneProvided / funnelStats.planSelected || 1) * 100,
      completed: (funnelStats.completed / funnelStats.phoneProvided || 1) * 100,
    };
  }, [funnelStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cotizaciones</h2>
          <p className="text-muted-foreground">
            Gestiona y da seguimiento a las cotizaciones del wizard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {(['today', '7d', '30d', 'all'] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === p
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'today' ? 'Hoy' : p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Funnel */}
      {funnelStats && (
        <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-2xl p-4 border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Funnel de Conversión</h3>
          <div className="flex flex-wrap gap-2">
            <FunnelStep
              label="Visitas"
              value={funnelStats.pageViews}
              percentage={100}
              icon={Eye}
              color=""
              onClick={() => setQuickFilters({ hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false })}
              isActive={!quickFilters.hasPhone && !quickFilters.pending && !quickFilters.urgent && !quickFilters.contacted && !quickFilters.wizardStarted && !quickFilters.planSelected && !quickFilters.phoneProvided && !quickFilters.completed}
            />
            <FunnelStep
              label="Wizard Iniciado"
              value={funnelStats.wizardStarted}
              percentage={funnelPercentages.wizard}
              icon={Users}
              color=""
              onClick={() => setQuickFilters(f => ({ ...f, wizardStarted: !f.wizardStarted, hasPhone: false, pending: false, urgent: false, contacted: false, planSelected: false, phoneProvided: false, completed: false }))}
              isActive={quickFilters.wizardStarted}
            />
            <FunnelStep
              label="Plan Seleccionado"
              value={funnelStats.planSelected}
              percentage={funnelPercentages.plan}
              icon={Package}
              color=""
              onClick={() => setQuickFilters(f => ({ ...f, planSelected: !f.planSelected, hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, phoneProvided: false, completed: false }))}
              isActive={quickFilters.planSelected}
            />
            <FunnelStep
              label="Teléfono Proporcionado"
              value={funnelStats.phoneProvided}
              percentage={funnelPercentages.phone}
              icon={Phone}
              color="border-emerald-500/30"
              onClick={() => setQuickFilters(f => ({ ...f, phoneProvided: !f.phoneProvided, hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, completed: false }))}
              isActive={quickFilters.phoneProvided}
            />
            <FunnelStep
              label="Solicitud Enviada"
              value={funnelStats.completed}
              percentage={funnelPercentages.completed}
              icon={CheckCircle}
              color="border-emerald-500/30"
              isLast
              onClick={() => setQuickFilters(f => ({ ...f, completed: !f.completed, hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false }))}
              isActive={quickFilters.completed}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setQuickFilters({ hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false })}
            className={`rounded-xl border transition-all cursor-pointer p-4 ${
              !quickFilters.hasPhone && !quickFilters.pending && !quickFilters.urgent && !quickFilters.contacted &&
              !quickFilters.wizardStarted && !quickFilters.planSelected && 
              !quickFilters.phoneProvided && !quickFilters.completed
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">cotizaciones</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setQuickFilters(f => ({ ...f, hasPhone: !f.hasPhone, phoneProvided: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, completed: false }))}
            className={`rounded-xl border transition-all cursor-pointer p-4 ${
              quickFilters.hasPhone
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-border bg-card hover:border-emerald-500/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Con Teléfono</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{filterCounts.hasPhone}</p>
                <p className="text-xs text-muted-foreground mt-1">{((filterCounts.hasPhone / stats.total) * 100).toFixed(0)}% del total</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setQuickFilters(f => ({ ...f, pending: !f.pending, hasPhone: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false }))}
            className={`rounded-xl border transition-all cursor-pointer p-4 ${
              quickFilters.pending
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                : 'border-border bg-card hover:border-blue-500/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{filterCounts.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">sin contactar</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setQuickFilters(f => ({ ...f, contacted: !f.contacted, hasPhone: false, pending: false, urgent: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false }))}
            className={`rounded-xl border transition-all cursor-pointer p-4 ${
              quickFilters.contacted
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-border bg-card hover:border-amber-500/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contactados</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{filterCounts.contacted}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? ((filterCounts.contacted / stats.total) * 100).toFixed(0) : 0}% del total</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setQuickFilters(f => ({ ...f, urgent: !f.urgent, hasPhone: false, pending: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false }))}
            className={`rounded-xl border transition-all cursor-pointer p-4 ${
              quickFilters.urgent
                ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                : 'border-border bg-card hover:border-red-500/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{filterCounts.urgent}</p>
                <p className="text-xs text-muted-foreground mt-1">alta prioridad</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Filtros rápidos:</span>
        <QuickFilterButton
          label="Con teléfono"
          icon={Phone}
          active={quickFilters.hasPhone}
          onClick={() => setQuickFilters(f => ({ ...f, hasPhone: !f.hasPhone }))}
          count={filterCounts.hasPhone}
        />
        <QuickFilterButton
          label="Pendientes"
          icon={Clock}
          active={quickFilters.pending}
          onClick={() => setQuickFilters(f => ({ ...f, pending: !f.pending }))}
          count={filterCounts.pending}
        />
        <QuickFilterButton
          label="Contactados"
          icon={MessageSquare}
          active={quickFilters.contacted}
          onClick={() => setQuickFilters(f => ({ ...f, contacted: !f.contacted }))}
          count={filterCounts.contacted}
        />
        <QuickFilterButton
          label="Urgentes"
          icon={Flame}
          active={quickFilters.urgent}
          onClick={() => setQuickFilters(f => ({ ...f, urgent: !f.urgent }))}
          count={filterCounts.urgent}
        />
        {(quickFilters.hasPhone || quickFilters.pending || quickFilters.urgent || quickFilters.contacted || 
          quickFilters.wizardStarted || quickFilters.planSelected || 
          quickFilters.phoneProvided || quickFilters.completed) && (
          <button
            onClick={() => setQuickFilters({ hasPhone: false, pending: false, urgent: false, contacted: false, wizardStarted: false, planSelected: false, phoneProvided: false, completed: false })}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Quotes Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Contacto</th>
                <th className="py-3 px-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Teléfono
                  </span>
                </th>
                <th className="py-3 px-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Ubicación
                  </span>
                </th>
                <th className="py-3 px-4 font-medium">Plan</th>
                <th className="py-3 px-4 font-medium">Timeline</th>
                <th className="py-3 px-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Paso
                  </span>
                </th>
                <th className="py-3 px-4 font-medium">Estado</th>
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Cargando cotizaciones...
                    </p>
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Mail className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No se encontraron cotizaciones
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <QuoteRow
                    key={quote.id}
                    quote={quote}
                    plans={plans}
                    location={quote.ip_address ? locations.get(quote.ip_address) : undefined}
                    onViewDetails={setSelectedQuote}
                    onWhatsApp={handleWhatsApp}
                    onStatusChange={handleStatusChange}
                    onOpenNotes={setNotesQuote}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
          <span>{filteredQuotes.length} cotización(es) encontrada(s)</span>
          {filteredQuotes.length > 0 && (
            <span>
              {filteredQuotes.filter(q => q.phone).length} con teléfono
            </span>
          )}
        </div>
      </div>

      {/* Quote Detail Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <QuoteDetailModal
            quote={selectedQuote}
            plans={plans}
            location={selectedQuote.ip_address ? locations.get(selectedQuote.ip_address) : undefined}
            onClose={() => setSelectedQuote(null)}
            onWhatsApp={() => handleWhatsApp(selectedQuote)}
            onStatusChange={(status) => {
              handleStatusChange(selectedQuote, status);
              setSelectedQuote(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesQuote && (
          <NotesModal
            quote={notesQuote}
            onClose={() => setNotesQuote(null)}
            onAddNote={handleAddNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
