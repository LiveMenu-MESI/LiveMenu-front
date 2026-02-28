import { Component, input, output, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import type { DishResponseDto } from '../../../core/models/dish-api.model';
import type { CategoryResponseDto } from '../../../core/models/category-api.model';

function priceGreaterThanZero(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === '' || value === null || value === undefined) return null; // required lo maneja
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return { priceMin: true };
  return null;
}

// Icono de cubiertos/platillo (cuando no hay imagen)
const CUTLERY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h2"/><path d="M21 2v7c0 1.1-.9 2-2 2h-2"/><path d="M8 2v20"/><path d="M16 2v20"/><path d="M3 9h18"/></svg>';
// Icono de subir imagen (en el botón "Subir Imagen")
const UPLOAD_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';

@Component({
  selector: 'app-dish-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ModalComponent],
  templateUrl: './dish-form-modal.component.html',
  styleUrl: './dish-form-modal.component.scss',
})
export class DishFormModalComponent implements OnInit {
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Categorías del restaurante para el select */
  categories = input.required<CategoryResponseDto[]>();
  /** Si se pasa, modo edición; si no, crear */
  dish = input<DishResponseDto | null>(null);
  /** ID del restaurante (obligatorio al crear) */
  restaurantId = input.required<string>();

  saved = output<Record<string, unknown>>();
  cancelled = output<void>();

  form: FormGroup;
  tagsList: string[] = [];
  tagInput = '';
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  deleting = signal(false);

  /** Icono de cubiertos (placeholder cuando no hay imagen). */
  readonly cutleryIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(CUTLERY_ICON);
  /** Icono de subir en el botón "Subir Imagen". */
  readonly uploadIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(UPLOAD_ICON);

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      categoryId: ['', Validators.required],
      price: [0, [Validators.required, priceGreaterThanZero]],
      offerPrice: [0 as number | null, Validators.min(0)],
      description: ['', Validators.maxLength(300)],
      imageUrl: [''],
      available: [true],
      featured: [false],
    });
  }

  ngOnInit(): void {
    const d = this.dish();
    if (d) {
      this.form.patchValue({
        name: d.name,
        categoryId: d.categoryId,
        price: d.price ?? 0,
        offerPrice: d.offerPrice ?? 0,
        description: d.description ?? '',
        imageUrl: d.imageUrl ?? '',
        available: d.available ?? true,
        featured: d.featured ?? false,
      });
      this.tagsList = [...(d.tags ?? [])];
    }
  }

  get isEdit(): boolean {
    return !!this.dish();
  }

  get nameControl() {
    return this.form.get('name');
  }
  get categoryIdControl() {
    return this.form.get('categoryId');
  }
  get priceControl() {
    return this.form.get('price');
  }
  get descriptionControl() {
    return this.form.get('description');
  }

  addTag(): void {
    const t = this.tagInput.trim();
    if (t && !this.tagsList.includes(t)) {
      this.tagsList.push(t);
      this.tagInput = '';
    }
  }

  removeTag(index: number): void {
    this.tagsList.splice(index, 1);
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      name: v.name,
      categoryId: v.categoryId,
      price: Number(v.price),
      offerPrice: v.offerPrice != null && Number(v.offerPrice) > 0 ? Number(v.offerPrice) : undefined,
      description: v.description || undefined,
      imageUrl: v.imageUrl || undefined,
      tags: this.tagsList.length ? this.tagsList : undefined,
      available: v.available,
      featured: v.featured,
    };
    if (this.dish()?.id) {
      payload['id'] = this.dish()!.id;
    } else {
      payload['restaurantId'] = this.restaurantId();
    }
    this.saved.emit(payload);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.uploadError.set('Formato no válido. Use JPEG, PNG o WebP.');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set(null);

    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        // Usar la URL large como imagen del plato
        this.form.patchValue({ imageUrl: response.largeUrl });
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Upload error:', err);
        const errorMessage = err.error?.message || err.message || 'Error al subir la imagen';
        this.uploadError.set(errorMessage);
        this.uploading.set(false);
      },
    });
  }

  /**
   * Extrae el filename de una URL de imagen.
   */
  private extractFilename(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || null;
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    }
  }

  onDeleteImage(): void {
    const imageUrl = this.form.get('imageUrl')?.value;
    if (!imageUrl) return;

    const filename = this.extractFilename(imageUrl);
    if (!filename) {
      this.uploadError.set('No se pudo extraer el nombre del archivo');
      return;
    }

    if (!confirm('¿Eliminar esta imagen?')) return;

    this.deleting.set(true);
    this.uploadError.set(null);

    this.imageUploadService.deleteImage(filename).subscribe({
      next: () => {
        this.form.patchValue({ imageUrl: null });
        this.deleting.set(false);
      },
      error: (err) => {
        this.uploadError.set(err.error?.message || 'Error al eliminar la imagen');
        this.deleting.set(false);
      },
    });
  }
}
