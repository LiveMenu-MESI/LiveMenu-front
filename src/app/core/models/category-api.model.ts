/** Respuesta de categoría (CU-03) */
export interface CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  position?: number;
  active?: boolean;
  restaurantId?: string;
}

/** Crear / actualizar categoría */
export interface CategoryCreateDto {
  name: string;
  description?: string;
  position?: number;
}

export type CategoryUpdateDto = Partial<CategoryCreateDto> & { active?: boolean };
