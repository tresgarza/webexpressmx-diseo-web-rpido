"use client";

import { Award, Users, Clock } from "lucide-react";

interface TrustBadgesProps {
  projectsCount?: number;
  satisfactionRate?: number;
  avgDays?: number;
}

export function TrustBadges({
  projectsCount = 10,
  satisfactionRate = 98,
  avgDays = 7,
}: TrustBadgesProps) {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gradient">
          {projectsCount}+
        </div>
        <div className="text-xs md:text-sm text-muted-foreground mt-1">
          Proyectos Entregados al Mes
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gradient">
          {avgDays}
        </div>
        <div className="text-xs md:text-sm text-muted-foreground mt-1">
          Días Promedio
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gradient">
          {satisfactionRate}%
        </div>
        <div className="text-xs md:text-sm text-muted-foreground mt-1">
          Clientes Satisfechos
        </div>
      </div>
    </div>
  );
}





