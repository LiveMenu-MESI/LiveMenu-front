import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

const DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

@Component({
  selector: 'app-opening-hours-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './opening-hours-form.component.html',
  styleUrl: './opening-hours-form.component.scss',
})
export class OpeningHoursFormComponent {
  /** FormGroup con claves monday..sunday; cada día tiene closed, open, close */
  scheduleGroup = input.required<FormGroup>();

  readonly days = DAYS;
}
