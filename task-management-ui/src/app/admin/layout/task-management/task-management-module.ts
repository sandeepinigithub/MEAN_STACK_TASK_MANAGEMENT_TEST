import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing-module';
import { TaskManagement } from './task-management';
import { Tasks } from './tasks/tasks';
import { TaskForm } from './task-form/task-form';

@NgModule({
  declarations: [TaskManagement, Tasks, TaskForm],
  imports: [CommonModule, TaskManagementRoutingModule],
})
export class TaskManagementModule {}
