import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing-module';
import { Layout } from './layout';

@NgModule({
  declarations: [Layout],
  imports: [CommonModule, LayoutRoutingModule],
})
export class LayoutModule {}
