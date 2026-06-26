import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing-module';
import { Login } from './login/login';
import { Account } from './account';

@NgModule({
  declarations: [Login, Account],
  imports: [CommonModule, AccountsRoutingModule],
})
export class AccountsModule {}
