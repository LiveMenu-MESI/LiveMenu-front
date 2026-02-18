import { Component } from '@angular/core';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

@Component({
  selector: 'app-opening-hours-form',
  standalone: true,
  imports: [],
  templateUrl: './opening-hours-form.component.html',
  styleUrl: './opening-hours-form.component.scss',
})
export class OpeningHoursFormComponent {
  readonly days = DAYS;
}
