import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly base = `${environment.baseUrl}/api/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(params?: any) {
    return this.http.get(this.base, { params });
  }

  getTaskById(id: string) {
    return this.http.get(`${this.base}/${id}`);
  }

  createTask(payload: any) {
    return this.http.post(this.base, payload);
  }

  updateTask(id: string, payload: any) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
