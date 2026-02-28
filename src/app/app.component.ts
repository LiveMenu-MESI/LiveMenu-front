import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.component.html',
  animations: [
    trigger('routeFade', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private sub: ReturnType<Router['events']['subscribe']> | null = null;

  routeKey = '';

  ngOnInit(): void {
    this.routeKey = this.router.url;
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.routeKey = e.url;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
