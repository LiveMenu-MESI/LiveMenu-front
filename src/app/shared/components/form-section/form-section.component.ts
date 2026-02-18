import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [],
  templateUrl: './form-section.component.html',
  styleUrl: './form-section.component.scss',
})
export class FormSectionComponent {
  title = input.required<string>();
}
