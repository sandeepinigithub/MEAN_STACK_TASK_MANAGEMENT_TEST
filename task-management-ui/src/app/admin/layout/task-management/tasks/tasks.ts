import { Component, OnInit, signal, computed } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';
type TaskStatus = 'pending' | 'completed' | 'inprogress'

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
}

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
  providers: [MessageService],
})
export class Tasks implements OnInit {
  loading = false;

  // Pagination
  rows = 10;
  first = 0;

  // Selection
  selectedTasks: Task[] = [];

  // Filters
  searchText = '';
  selectedStatus = '';
  viewType = 'all';

  // Options
  viewTypeOptions = [
    { label: 'All Tasks', value: 'all' },
    { label: 'My Tasks', value: 'mine' },
  ];

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Inprogress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' },
  ];

  menuItems = signal<MenuItem[]>([
    { label: 'Refresh', icon: 'pi pi-refresh', command: () => this.loadTasks() },
  ]);

  private allTasks: Task[] = [
    {
      id: 'TSK-001',
      title: 'Design new landing page',
      description: 'Create modern UI mockup for the new product landing page',
      assignee: 'Alice Johnson',
      status: 'pending',
      dueDate: 'Jun 28, 2026',
    },
    {
      id: 'TSK-002',
      title: 'Fix authentication bug',
      description: 'JWT token refresh not working on session expiry',
      assignee: 'Bob Smith',
      status: 'completed',
      dueDate: 'Jun 25, 2026',
    },
    {
      id: 'TSK-003',
      title: 'Write API documentation',
      description: 'Document all REST endpoints using Swagger/OpenAPI',
      assignee: 'Carol White',
      status: 'pending',
      dueDate: 'Jun 30, 2026',
    },
    {
      id: 'TSK-004',
      title: 'Database performance tuning',
      description: 'Optimize slow queries and add missing indexes',
      assignee: 'David Lee',
      status: 'inprogress',
      dueDate: 'Jun 20, 2026',
    },
    {
      id: 'TSK-005',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated builds and deployments',
      assignee: 'Eva Martinez',
      status: 'pending',
      dueDate: 'Jul 02, 2026',
    },
  ];

  filteredTasks: Task[] = [];

  get totalRecords(): number {
    return this.filteredTasks.length;
  }

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    setTimeout(() => {
      this.filteredTasks = [...this.allTasks];
      this.loading = false;
    }, 300);
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allTasks];

    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.assignee.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      result = result.filter((t) => t.status === this.selectedStatus);
    }


    this.filteredTasks = result;
    this.first = 0;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.viewType = 'all';
    this.applyFilters();
  }

  openNewTask(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'New Task',
      detail: 'Open task form dialog',
    });
  }

  viewTask(task: Task): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Task',
      detail: `Editing: ${task.title}`,
    });
  }

  openEditTask(task: Task): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Task',
      detail: `Editing: ${task.title}`,
    });
  }

  deleteTask(task: Task): void {
    this.allTasks = this.allTasks.filter((t) => t.id !== task.id);
    this.applyFilters();
    this.selectedTasks = this.selectedTasks.filter((t) => t.id !== task.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `"${task.title}" has been deleted`,
    });
  }

  deleteSelectedTasks(): void {
    const ids = new Set(this.selectedTasks.map((t) => t.id));
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      completed: 'success',
      inprogress: 'info',
      pending: 'warn',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completed',
      inprogress: 'In Progress',
      pending: 'Pending',
    };
    return map[status] ?? status;
  }
}
