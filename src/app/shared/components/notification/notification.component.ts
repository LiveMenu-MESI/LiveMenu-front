import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent {
  private readonly notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;

  remove(id: string): void {
    this.notificationService.remove(id);
  }
}

