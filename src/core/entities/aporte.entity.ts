export type AporteEstado = "ACTIVO" | "INACTIVO";
export type AportePlacaEstado = "PAGADO" | "PREFERENCIAL";

export interface AportePlaca {
  id: string;
  aporte_id: string;
  ingreso_id: string | null;
  placa: string;
  placa_normalizada: string;
  estado: AportePlacaEstado;
  monto_pagado: number;
  registrado_por: string;
  fecha_registro: string;
}

export interface Aporte {
  id: string;
  nombre: string;
  monto: number;
  estado: AporteEstado;
  creado_por: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AporteResumen extends Aporte {
  pagados: number;
  preferenciales: number;
  total_recaudado: number;
}

export interface GuardarAporteDTO {
  nombre: string;
  monto: number;
}

export interface ActualizarAporteDTO extends GuardarAporteDTO {
  aporteId: string;
}

export interface CambiarEstadoAporteDTO {
  aporteId: string;
  activo: boolean;
}

export interface RegistrarEstadoAportePlacaDTO {
  ingresoId: string;
  estado: AportePlacaEstado;
}
