import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing-module';
import { Login } from './login/login';
import { Account } from './account';
import { CommonSharedModule } from '../shared/common-shared/common-shared-module';

@NgModule({
  declarations: [Login, Account],
  imports: [
    CommonModule, 
    AccountsRoutingModule,
    CommonSharedModule
  ],
})
export class AccountsModule { }
