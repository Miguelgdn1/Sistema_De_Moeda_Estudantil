import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);

  isLoggedIn = false;
  userRole: string | null = null; // Vai guardar se é 'ALUNO' ou 'EMPRESA'

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token'); 
    
    if (token) {
      this.isLoggedIn = true;
      try {
        // TRUQUE DE MESTRE: Decodifica o Token JWT do Spring Boot para ver a Role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenData = JSON.stringify(payload).toUpperCase(); 
        
        // Verifica as claims do token (geralmente ROLE_ALUNO ou ROLE_EMPRESA)
        if (tokenData.includes('ALUNO')) {
          this.userRole = 'ALUNO';
        } else if (tokenData.includes('EMPRESA') || tokenData.includes('PARCEIRO')) {
          this.userRole = 'EMPRESA';
        } else {
          // Se não achar no token, pega do localStorage que salvamos no Login
          this.userRole = localStorage.getItem('userRole')?.toUpperCase() || 'ALUNO';
        }
      } catch(e) {
        this.userRole = localStorage.getItem('userRole')?.toUpperCase() || 'ALUNO';
      }
    } else {
      this.isLoggedIn = false;
      this.userRole = null;
    }
  }

  logout(event: Event) {
    event.preventDefault();
    // Limpa a sessão
    localStorage.removeItem('token');
    localStorage.removeItem('userRole'); 
    this.isLoggedIn = false;
    this.userRole = null;
    
    // Atualiza a página ou manda pro login
    this.router.navigate(['/login']);
  }
}