import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagement } from './task-management';
import { Tasks } from './tasks/tasks';
import { TaskDetails } from './task-details/task-details';

const routes: Routes = [
  {
    path: '',
    component: TaskManagement,
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
      },
      {
        path: 'tasks',
        component: Tasks
      },
      {
        path: 'tasks/:id',
        component: TaskDetails
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskManagementRoutingModule { }
