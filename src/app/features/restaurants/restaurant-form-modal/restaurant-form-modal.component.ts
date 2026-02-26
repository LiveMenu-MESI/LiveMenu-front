import { Component, output, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LogoUploadComponent } from '../../../shared/components/logo-upload/logo-upload.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { OpeningHoursFormComponent } from '../../../shared/components/opening-hours-form/opening-hours-form.component';
import type { RestaurantResponseDto, RestaurantCreateDto, RestaurantSchedule } from '../../../core/models/restaurant-api.model';

const SCHEDULE_DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/** Si el día está abierto (no cerrado), hora de apertura y cierre son obligatorias. */
function dayScheduleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as { closed?: boolean; open?: string; close?: string };
    if (v?.closed) return null;
    const open = (v?.open ?? '').toString().trim();
    const close = (v?.close ?? '').toString().trim();
    if (!open || !close) {
      return { requiredSchedule: true };
    }
    return null;
  };
}

function scheduleFormToDto(formValue: Record<string, { closed: boolean; open: string; close: string }>): RestaurantSchedule {
  const schedule: RestaurantSchedule = {};
  SCHEDULE_DAY_KEYS.forEach((key) => {
    const day = formValue[key];
    if (!day) return;
    schedule[key] = {
      closed: day.closed,
      open: day.closed ? undefined : (day.open || undefined),
      close: day.closed ? undefined : (day.close || undefined),
    };
  });
  return schedule;
}

function scheduleDtoToForm(schedule?: RestaurantSchedule): Record<string, { closed: boolean; open: string; close: string }> {
  const out: Record<string, { closed: boolean; open: string; close: string }> = {};
  SCHEDULE_DAY_KEYS.forEach((key) => {
    const day = schedule?.[key];
    out[key] = {
      closed: day?.closed ?? true,
      open: day?.open ?? '',
      close: day?.close ?? '',
    };
  });
  return out;
}

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
    const scheduleGroup = fb.group(
      SCHEDULE_DAY_KEYS.reduce(
        (acc, key) => {
          acc[key] = fb.nonNullable.group(
            { closed: [true], open: [''], close: [''] },
            { validators: dayScheduleValidator() },
          );
          return acc;
        },
        {} as Record<(typeof SCHEDULE_DAY_KEYS)[number], ReturnType<FormBuilder['group']>>,
      ),
    );
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      logo: [''],
      phone: [''],
      address: [''],
      schedule: scheduleGroup,
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
        schedule: scheduleDtoToForm(rest.schedule),
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
      schedule: scheduleFormToDto(value.schedule as Record<string, { closed: boolean; open: string; close: string }>),
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

  get scheduleGroup(): FormGroup {
    return this.form.get('schedule') as FormGroup;
  }

  get nameControl() {
    return this.form.get('name');
  }
  get descriptionControl() {
    return this.form.get('description');
  }
}
