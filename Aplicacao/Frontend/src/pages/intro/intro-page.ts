import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-intro-page',
  imports: [CommonModule],
  templateUrl: './intro-page.html',
  styleUrl: './intro-page.css',
})
export class IntroPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (sessionStorage.getItem('introPlayed')) {
      this.router.navigate(['/home']);
      return;
    }
    sessionStorage.setItem('introPlayed', 'true');
    this.timerId = setTimeout(() => this.router.navigate(['/home']), 1800);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
  }
}
