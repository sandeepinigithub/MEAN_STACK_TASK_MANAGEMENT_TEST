import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-header-portal',
  standalone: false,
  templateUrl: './header-portal.html',
  styleUrl: './header-portal.scss',
})
export class HeaderPortal implements OnInit {
  @ViewChild('profileMenu') profileMenu!: Menu;

  userInfo = {
    name: 'John Doe',
    designation: 'System Administrator',
    avatar: 'https://i.pravatar.cc/150?img=12',
  };

  profileMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.profileMenuItems = [
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        styleClass: 'logout-item',
        command: () => {},
      },
    ];
  }

  toggleProfileMenu(event: Event): void {
    this.profileMenu.toggle(event);
  }
}
