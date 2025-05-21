import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: any = null;
  userRoles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      this.currentUser = this.tokenStorageService.getUser();

      if (this.currentUser && this.currentUser.roles) {
        this.userRoles = this.currentUser.roles;
      } else {
        const token = this.tokenStorageService.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!this.currentUser) { this.currentUser = {}; }

            if (payload.sub) {
              this.currentUser.username = payload.sub;
            }
            if (payload.roles && Array.isArray(payload.roles)) {
              this.userRoles = payload.roles;
            } else if (payload.scope) {
              this.userRoles = Array.isArray(payload.scope) ? payload.scope : payload.scope.split(' ');
            }
          } catch (e) {
            console.error('Erreur lors du décodage du JWT:', e);
          }
        }
      }
      if (this.currentUser && !this.currentUser.username) {
        this.currentUser.username = 'Utilisateur connecté';
      }

      this.showAdminBoard = this.userRoles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.userRoles.includes('ROLE_MODERATOR');
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.isLoggedIn = false;
    this.showAdminBoard = false;
    this.showModeratorBoard = false;
    this.userRoles = [];
    this.currentUser = null;
    this.router.navigate(['/home']);
  }
} 