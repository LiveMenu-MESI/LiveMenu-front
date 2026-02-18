import { Component, output, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LogoUploadComponent } from '../../../shared/components/logo-upload/logo-upload.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { OpeningHoursFormComponent } from '../../../shared/components/opening-hours-form/opening-hours-form.component';
import type { RestaurantResponseDto, RestaurantCreateDto, RestaurantSchedule } from '../../../core/models/restaurant-api.model';

const DEFAULT_SCHEDULE: RestaurantSchedule = {
  monday: { closed: true },
  tuesday: { closed: true },
  wednesday: { closed: true },
  thursday: { closed: true },
  friday: { closed: true },
  saturday: { closed: true },
  sunday: { closed: true },
};

@Component({
  selector: 'app-restaurant-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    LogoUploadComponent,
    FormSectionComponent,
    OpeningHoursFormComponent,
  ],
  templateUrl: './restaurant-form-modal.component.html',
  styleUrl: './restaurant-form-modal.component.scss',
})
export class RestaurantFormModalComponent implements OnInit {
  /** Si se pasa, se rellenan los campos (modo edición) */
  restaurant = input<RestaurantResponseDto | null>(null);

  saved = output<RestaurantCreateDto & { id?: string }>();
  cancelled = output<void>();

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      logo: [''],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    const rest = this.restaurant();
    if (rest) {
      this.form.patchValue({
        name: rest.name ?? '',
        description: rest.description ?? '',
        logo: rest.logo ?? '',
        phone: rest.phone ?? '',
        address: rest.address ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: RestaurantCreateDto = {
      name: value.name,
      description: value.description || undefined,
      logo: value.logo || undefined,
      phone: value.phone || undefined,
      address: value.address || undefined,
      schedule: DEFAULT_SCHEDULE,
    };
    if (this.restaurant()?.id) {
      this.saved.emit({ ...payload, id: this.restaurant()!.id });
    } else {
      this.saved.emit(payload);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  get nameControl() {
    return this.form.get('name');
  }
  get descriptionControl() {
    return this.form.get('description');
  }
}
