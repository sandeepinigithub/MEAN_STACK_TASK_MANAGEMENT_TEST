import { Component, OnInit } from '@angular/core';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

interface SummaryCard {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
}

interface RecentTask {
  id: string;
  title: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  dueDate: string;
}

@Component({
  selector: 'app-common-dashboard',
  standalone: false,
  templateUrl: './common-dashboard.html',
  styleUrl: './common-dashboard.scss',
})
export class CommonDashboard implements OnInit {
  loading = false;

  summaryCards: SummaryCard[] = [
    {
      label: 'Total Tasks',
      value: 248,
      icon: 'pi-clipboard',
      colorClass: 'bg-primary',
    },
    {
      label: 'Completed',
      value: 182,
      icon: 'pi-check-circle',
      colorClass: 'bg-success',
    },
    {
      label: 'In Progress',
      value: 43,
      icon: 'pi-spinner',
      colorClass: 'bg-info',
    },
    {
      label: 'Overdue',
      value: 23,
      icon: 'pi-exclamation-triangle',
      colorClass: 'bg-danger',
    },
  ];

  recentTasks: RecentTask[] = [
    {
      id: 'TSK-001',
      title: 'Design new landing page',
      assignee: 'Alice Johnson',
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Jun 28, 2026',
    },
    {
      id: 'TSK-002',
      title: 'Fix authentication bug',
      assignee: 'Bob Smith',
      priority: 'high',
      status: 'completed',
      dueDate: 'Jun 25, 2026',
    },
    {
      id: 'TSK-003',
      title: 'Write API documentation',
      assignee: 'Carol White',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Jun 30, 2026',
    },
    {
      id: 'TSK-004',
      title: 'Database performance tuning',
      assignee: 'David Lee',
      priority: 'high',
      status: 'overdue',
      dueDate: 'Jun 20, 2026',
    },
    {
      id: 'TSK-005',
      title: 'Set up CI/CD pipeline',
      assignee: 'Eva Martinez',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'Jul 02, 2026',
    },
    {
      id: 'TSK-006',
      title: 'User acceptance testing',
      assignee: 'Frank Chen',
      priority: 'low',
      status: 'pending',
      dueDate: 'Jul 05, 2026',
    },
  ];

  ngOnInit(): void {}

  getPrioritySeverity(priority: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      high: 'danger',
      medium: 'warn',
      low: 'secondary',
    };
    return map[priority] ?? 'secondary';
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
}
