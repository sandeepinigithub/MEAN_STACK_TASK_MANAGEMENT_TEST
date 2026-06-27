import { ChangeDetectorRef, Component, Injector, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';
type TaskStatus = 'pending' | 'completed' | 'inprogress';

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks extends AppComponentBase implements OnInit {

  first = 0;
  searchText = '';
  selectedStatus = '';
  loading: boolean = false;

  private allTasks: any[] = [];

  readonly statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' },
  ];

  menuItems = signal<MenuItem[]>([
    { label: 'Refresh', icon: 'pi pi-refresh', command: () => this.loadTasks() },
  ]);

  constructor(injector: Injector, private taskService: TaskService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (res: any) => {
        this.allTasks = res?.data?.tasks ?? res?.data ?? [];
        this.primengTableHelper.totalRecordsCount = res?.meta?.total ?? this.allTasks.length;
        this.applyFilters();
      },
      error: () => {
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load tasks.' });
      },
      complete: () => {
        this.loading = false;
        this._cdr.detectChanges();
      },
    });
  }

  onSearch(): void { this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.allTasks];
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      result = result.filter(t =>
        t.title?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.assignedTo?.username?.toLowerCase().includes(term)
      );
    }
    if (this.selectedStatus) {
      result = result.filter(t => t.status === this.selectedStatus);
    }
    this.primengTableHelper.records = result;
    this.primengTableHelper.totalRecordsCount = result.length;
    this.first = 0;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openNewTask(): void {
    this._router.navigate(['/portal/task-management/tasks/new']);
  }

  viewTask(task: any): void {
    this._router.navigate(['/portal/task-management/tasks', task._id]);
  }

  openEditTask(task: any): void {
    this._router.navigate(['/portal/task-management/tasks', task._id, 'edit']);
  }

  deleteTask(task: any): void {
    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        this.allTasks = this.allTasks.filter(t => t._id !== task._id);
        this.applyFilters();
        this._messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${task.title}" deleted.` });
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to delete task.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
    });
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = { completed: 'success', inprogress: 'info', pending: 'warn' };
    return map[String(status)] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { completed: 'Completed', inprogress: 'In Progress', pending: 'Pending' };
    return map[String(status)] ?? String(status);
  }
}
