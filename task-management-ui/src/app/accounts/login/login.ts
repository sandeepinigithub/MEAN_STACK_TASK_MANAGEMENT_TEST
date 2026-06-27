import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponentBase } from '../../shared/common-shared/app-component-base';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login extends AppComponentBase implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  showRegisterModal = false;
  // isSubmitLoader = false;

  constructor(injector: Injector, private fb: FormBuilder) {
    super(injector)
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSignin(): void {
    // if (this.loginForm.invalid) {
    //   this.loginForm.markAllAsTouched();
    //   return;
    // }
    this.isSubmitLoader = true;
    // TODO: integrate auth service
    this.routerNavigate('portal')
    
  }
}
