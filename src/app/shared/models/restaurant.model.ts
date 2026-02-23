export interface Restaurant {
  id: string;
  name: string;
  /** Ej: tipo de cocina o descripción: "Española" */
  subtitle: string;
  /** URL del logo del restaurante */
  logo?: string;
}
