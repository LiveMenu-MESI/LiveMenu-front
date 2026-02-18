/** Plato (CU-04) - mínimo para listado y conteo */
export interface DishResponseDto {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  available?: boolean;
}
