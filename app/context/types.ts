export type Publication = {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  presentacion?: string;
  fechaVencimiento: string;
  fecha?: string;
  status?: string;
  usuarioId: number;
};

export type Solicitud = {
  id: number;
  cantidad: number;
  fecha?: string;
  usuarioId: number;
  publicacionId: number;
  estadoId: number;
};

export type Envio = {
  id: number;
  direccion: string;
  localidad?: string;
  barrio?: string;
  solicitudId: number;
};

export type Stock = {
  id: number;
  cantidadTotal: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  status: string;
  publicacionId: number;
};

export type Estado = {
  id: number;
  nombre: string;
};