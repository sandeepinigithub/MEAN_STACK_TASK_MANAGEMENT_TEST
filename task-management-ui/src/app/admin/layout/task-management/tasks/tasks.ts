import { Component, OnInit, signal, computed } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';
type Priority = 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
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
  selectedPriority = '';
  viewType = 'all';

  // Options
  viewTypeOptions = [
    { label: 'All Tasks', value: 'all' },
    { label: 'My Tasks', value: 'mine' },
    { label: 'Overdue Tasks', value: 'overdue' },
  ];

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Overdue', value: 'overdue' },
  ];

  priorityOptions = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
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
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Jun 28, 2026',
    },
    {
      id: 'TSK-002',
      title: 'Fix authentication bug',
      description: 'JWT token refresh not working on session expiry',
      assignee: 'Bob Smith',
      priority: 'high',
      status: 'completed',
      dueDate: 'Jun 25, 2026',
    },
    {
      id: 'TSK-003',
      title: 'Write API documentation',
      description: 'Document all REST endpoints using Swagger/OpenAPI',
      assignee: 'Carol White',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Jun 30, 2026',
    },
    {
      id: 'TSK-004',
      title: 'Database performance tuning',
      description: 'Optimize slow queries and add missing indexes',
      assignee: 'David Lee',
      priority: 'high',
      status: 'overdue',
      dueDate: 'Jun 20, 2026',
    },
    {
      id: 'TSK-005',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated builds and deployments',
      assignee: 'Eva Martinez',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'Jul 02, 2026',
    },
    {
      id: 'TSK-006',
      title: 'User acceptance testing',
      description: 'Conduct UAT sessions with key stakeholders for v2 release',
      assignee: 'Frank Chen',
      priority: 'low',
      status: 'pending',
      dueDate: 'Jul 05, 2026',
    },
    {
      id: 'TSK-007',
      title: 'Implement dark mode',
      description: 'Add theme toggle with dark/light mode support across all pages',
      assignee: 'Grace Kim',
      priority: 'low',
      status: 'pending',
      dueDate: 'Jul 10, 2026',
    },
    {
      id: 'TSK-008',
      title: 'Migrate to Angular 18',
      description: 'Upgrade Angular from v17 to v18 and resolve breaking changes',
      assignee: 'Henry Patel',
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Jul 01, 2026',
    },
    {
      id: 'TSK-009',
      title: 'Security audit',
      description: 'Conduct penetration testing and fix vulnerabilities found',
      assignee: 'Iris Wong',
      priority: 'high',
      status: 'overdue',
      dueDate: 'Jun 22, 2026',
    },
    {
      id: 'TSK-010',
      title: 'Dashboard analytics charts',
      description: 'Integrate Highcharts for sales and revenue analytics',
      assignee: 'James Okafor',
      priority: 'medium',
      status: 'completed',
      dueDate: 'Jun 24, 2026',
    },
    {
      id: 'TSK-011',
      title: 'Email notification service',
      description: 'Build transactional email service using NodeMailer',
      assignee: 'Karen Singh',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'Jul 03, 2026',
    },
    {
      id: 'TSK-012',
      title: 'Write unit tests for auth module',
      description: 'Achieve 80%+ code coverage on authentication service',
      assignee: 'Liam Brown',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Jul 07, 2026',
    },
    {
      id: 'TSK-013',
      title: 'Mobile responsive fixes',
      description: 'Fix layout breaking issues on screens below 768px',
      assignee: 'Maya Torres',
      priority: 'high',
      status: 'completed',
      dueDate: 'Jun 23, 2026',
    },
    {
      id: 'TSK-014',
      title: 'Docker containerization',
      description: 'Create Dockerfiles and docker-compose for all services',
      assignee: 'Noah Adams',
      priority: 'medium',
      status: 'completed',
      dueDate: 'Jun 21, 2026',
    },
    {
      id: 'TSK-015',
      title: 'Role-based access control',
      description: 'Implement admin, manager, and user role permissions',
      assignee: 'Olivia Clark',
      priority: 'high',
      status: 'overdue',
      dueDate: 'Jun 18, 2026',
    },
    {
      id: 'TSK-016',
      title: 'Onboarding tutorial flow',
      description: 'Design step-by-step guide for new users after sign-up',
      assignee: 'Peter Zhang',
      priority: 'low',
      status: 'pending',
      dueDate: 'Jul 12, 2026',
    },
    {
      id: 'TSK-017',
      title: 'Performance monitoring setup',
      description: 'Integrate Datadog APM for backend performance tracking',
      assignee: 'Quinn Rivera',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Jul 08, 2026',
    },
    {
      id: 'TSK-018',
      title: 'Search functionality',
      description: 'Add global search with Elasticsearch integration',
      assignee: 'Rachel Scott',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'Jul 04, 2026',
    },
    {
      id: 'TSK-019',
      title: 'Accessibility (a11y) audit',
      description: 'Ensure WCAG 2.1 AA compliance across all components',
      assignee: 'Samuel King',
      priority: 'low',
      status: 'pending',
      dueDate: 'Jul 15, 2026',
    },
    {
      id: 'TSK-020',
      title: 'Backup and restore strategy',
      description: 'Implement automated MongoDB backup with S3 storage',
      assignee: 'Tina Hall',
      priority: 'high',
      status: 'completed',
      dueDate: 'Jun 26, 2026',
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

  onViewTypeChange(): void {
    if (this.viewType === 'overdue') {
      this.selectedStatus = 'overdue';
    } else {
      this.selectedStatus = '';
    }
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

    if (this.selectedPriority) {
      result = result.filter((t) => t.priority === this.selectedPriority);
    }


    this.filteredTasks = result;
    this.first = 0;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
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
    this.allTasks = this.allTasks.filter((t) => !ids.has(t.id));
    this.applyFilters();
    const count = this.selectedTasks.length;
    this.selectedTasks = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `${count} task(s) deleted`,
    });
  }

  exportTasks(format: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: `Exporting tasks as ${format.toUpperCase()}`,
    });
  }

  importTasks(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Import',
      detail: 'Import tasks dialog',
    });
  }

  archiveCompleted(): void {
    const count = this.allTasks.filter((t) => t.status === 'completed').length;
    this.allTasks = this.allTasks.filter((t) => t.status !== 'completed');
    this.applyFilters();
    this.messageService.add({
      severity: 'success',
      summary: 'Archived',
      detail: `${count} completed task(s) archived`,
    });
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      completed: 'success',
      'in-progress': 'info',
      pending: 'warn',
      overdue: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completed',
      'in-progress': 'In Progress',
      pending: 'Pending',
      overdue: 'Overdue',
    };
    return map[status] ?? status;
  }

  getPrioritySeverity(priority: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      high: 'danger',
      medium: 'warn',
      low: 'secondary',
    };
    return map[priority] ?? 'secondary';
  }

  getAssigneeInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
