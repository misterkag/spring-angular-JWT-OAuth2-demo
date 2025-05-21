import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate username requirements', () => {
    const usernameControl = component.registerForm.get('username');

    usernameControl?.setValue('');
    expect(usernameControl?.hasError('required')).toBeTruthy();

    usernameControl?.setValue('ab');
    expect(usernameControl?.hasError('minlength')).toBeTruthy();

    usernameControl?.setValue('a'.repeat(21));
    expect(usernameControl?.hasError('maxlength')).toBeTruthy();

    usernameControl?.setValue('test@user');
    expect(usernameControl?.hasError('pattern')).toBeTruthy();

    usernameControl?.setValue('testuser123');
    expect(usernameControl?.valid).toBeTruthy();
  });

  it('should validate email requirements', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('a'.repeat(51) + '@test.com');
    expect(emailControl?.hasError('maxlength')).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password requirements', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTruthy();

    passwordControl?.setValue('Abc1!');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();

    passwordControl?.setValue('A'.repeat(41) + 'b1!');
    expect(passwordControl?.hasError('maxlength')).toBeTruthy();

    passwordControl?.setValue('abc123!');
    expect(passwordControl?.hasError('pattern')).toBeTruthy();

    passwordControl?.setValue('ABC123!');
    expect(passwordControl?.hasError('pattern')).toBeTruthy();

    passwordControl?.setValue('ABCabc!');
    expect(passwordControl?.hasError('pattern')).toBeTruthy();

    passwordControl?.setValue('ABCabc123');
    expect(passwordControl?.hasError('pattern')).toBeTruthy();

    passwordControl?.setValue('BolAl1234!88');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate password confirmation', () => {
    const passwordControl = component.registerForm.get('password');
    const confirmPasswordControl = component.registerForm.get('confirmPassword');

    passwordControl?.setValue('BolAl1234!88');
    confirmPasswordControl?.setValue('BolAl1234!88');
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();

    passwordControl?.setValue('BolAl1234!88');
    confirmPasswordControl?.setValue('DifferentPassword123!');
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalsy();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalsy();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalsy();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTruthy();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeFalsy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should handle successful registration', fakeAsync(() => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'BolAl1234!88'
    };

    component.registerForm.patchValue({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password
    });

    authService.register.and.returnValue(of({}));
    component.onSubmit();
    tick(2000);

    expect(authService.register).toHaveBeenCalledWith(
      testUser.username,
      testUser.email,
      testUser.password
    );
    expect(component.isSuccessful).toBeTruthy();
    expect(component.isSignUpFailed).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should handle registration error', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'BolAl1234!88'
    };

    component.registerForm.patchValue({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password
    });

    const errorMessage = 'Registration failed';
    authService.register.and.returnValue(throwError(() => new Error(errorMessage)));
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(
      testUser.username,
      testUser.email,
      testUser.password
    );
    expect(component.isSuccessful).toBeFalsy();
    expect(component.isSignUpFailed).toBeTruthy();
    expect(component.errorMessage).toBe(errorMessage);
  });
}); 