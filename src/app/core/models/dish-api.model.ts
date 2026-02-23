/** Plato - respuesta del API (listado y detalle) */
export interface DishResponseDto {
  id: string;
  categoryId: string;
  restaurantId?: string;
  name: string;
  price: number;
  offerPrice?: number;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  available?: boolean;
  featured?: boolean;
}

/** Crear plato */
export interface DishCreateDto {
  restaurantId: string;
  categoryId: string;
  name: string;
  price: number;
  offerPrice?: number;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  available?: boolean;
  featured?: boolean;
}

/** Actualizar plato */
export interface DishUpdateDto {
  categoryId?: string;
  name?: string;
  price?: number;
  offerPrice?: number;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  available?: boolean;
  featured?: boolean;
}
