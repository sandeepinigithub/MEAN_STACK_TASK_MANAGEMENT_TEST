import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from './navigation';
import { SidebarModule } from '../sidebar/sidebar-module';
import { HeaderPortalModule } from '../header-portal/header-portal-module';

@NgModule({
  declarations: [Navigation],
  imports: [
    CommonModule,
    SidebarModule,
    HeaderPortalModule
  ],
  exports: [Navigation]
})
export class NavigationModule { }
