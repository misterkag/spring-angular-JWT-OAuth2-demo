import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]*$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(40),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$')
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      console.log('Password value:', value);
      console.log('Password valid:', this.registerForm.get('password')?.valid);
      console.log('Password errors:', this.registerForm.get('password')?.errors);
    });
  }

  ngOnInit(): void { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }

    switch (field) {
      case 'username':
        if (control.hasError('minlength')) {
          return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
        }
        if (control.hasError('maxlength')) {
          return 'Le nom d\'utilisateur ne doit pas dépasser 20 caractères';
        }
        if (control.hasError('pattern')) {
          return 'Le nom d\'utilisateur ne doit contenir que des lettres, chiffres et underscores';
        }
        break;

      case 'email':
        if (control.hasError('email')) {
          return 'Format d\'email invalide';
        }
        if (control.hasError('maxlength')) {
          return 'L\'email ne doit pas dépasser 50 caractères';
        }
        break;

      case 'password':
        if (control.hasError('minlength')) {
          return 'Le mot de passe doit contenir au moins 6 caractères';
        }
        if (control.hasError('maxlength')) {
          return 'Le mot de passe ne doit pas dépasser 40 caractères';
        }
        if (control.hasError('pattern')) {
          return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)';
        }
        break;

      case 'confirmPassword':
        if (control.hasError('passwordMismatch')) {
          return 'Les mots de passe ne correspondent pas';
        }
        break;
    }

    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.isSignUpFailed = false;
    this.errorMessage = '';

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: (data) => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Une erreur inconnue est survenue lors de l\'inscription.';
        }
        this.isSignUpFailed = true;
        this.isLoading = false;
      }
    });
  }
} 