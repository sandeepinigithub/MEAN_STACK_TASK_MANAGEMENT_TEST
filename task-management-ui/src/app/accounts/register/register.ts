import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AppComponentBase } from '../../shared/common-shared/app-component-base';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register extends AppComponentBase implements OnInit {

  @Output() onClose = new EventEmitter<void>();

  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  readonly roles = [
    { label: 'Manager', value: 'manager' },
    { label: 'Team Lead', value: 'teamlead' },
    { label: 'Employee', value: 'employee' },
  ];

  constructor(injector: Injector, private fb: FormBuilder) {
    super(injector);
    this.formInitialisation();
  }

  ngOnInit(): void {

  }
  
  formInitialisation() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  get passwordMismatch(): boolean {
    return !!(
      this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.get('confirmPassword')?.dirty
    );
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    // TODO: call auth service register API
    console.log('Register payload:', this.registerForm.value);
    this.onClose.emit();
  }

  cancel(): void {
    this.onClose.emit();
  }
}
