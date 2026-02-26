import { Component, input, output, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import type { CategoryResponseDto } from '../../../core/models/category-api.model';

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './category-form-modal.component.html',
  styleUrl: './category-form-modal.component.scss',
})
export class CategoryFormModalComponent implements OnInit {
  /** Si se pasa, es edición; si no, es crear nueva */
  category = input<CategoryResponseDto | null>(null);

  saved = output<{ id?: string; name: string; description: string }>();
  cancelled = output<void>();

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
    });
  }

  get isEdit(): boolean {
    return !!this.category();
  }

  get nameControl() {
    return this.form.get('name');
  }

  ngOnInit(): void {
    const cat = this.category();
    if (cat) {
      this.form.patchValue({ name: cat.name, description: cat.description ?? '' });
    }
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (this.category()?.id) {
      this.saved.emit({ id: this.category()!.id, name: value.name, description: value.description });
    } else {
      this.saved.emit({ name: value.name, description: value.description });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
