import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  showPassword = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (token) {
        this.tokenStorage.saveToken(token);
        this.router.navigate(['/home']);
      } else if (error) {
        this.errorMessage = `Erreur d'authentification OAuth2: ${error}`;
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.loginService.login(username, password).subscribe({
        next: (data) => {
          if (data && data.accessToken) {
            this.tokenStorage.saveToken(data.accessToken);
            this.tokenStorage.saveUser(data);
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'Token non reçu du serveur.';
          }
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Une erreur est survenue';
        }
      });
    }
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorize/google`;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
