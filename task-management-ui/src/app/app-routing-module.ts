import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'account/login', pathMatch: 'full',
  },
  {
    path: 'account',
    loadChildren: () => import('./accounts/accounts-module').then((m) => m.AccountsModule)
  },
  {
    path: 'portal',
    loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule)
  },
  { path: '**', redirectTo: '/account/login' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
