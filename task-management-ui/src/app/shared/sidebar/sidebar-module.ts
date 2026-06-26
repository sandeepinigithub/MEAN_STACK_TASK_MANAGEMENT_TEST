import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar';
import { CommonSharedModule } from '../common-shared/common-shared-module';

@NgModule({
  declarations: [Sidebar],
  imports: [
    CommonModule,
    CommonSharedModule
  ],
  exports: [Sidebar],
})
export class SidebarModule { }
