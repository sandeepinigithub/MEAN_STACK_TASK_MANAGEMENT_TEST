import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { CommonDashboard } from './common-dashboard/common-dashboard';

@NgModule({
  declarations: [Dashboard, CommonDashboard],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule {}
