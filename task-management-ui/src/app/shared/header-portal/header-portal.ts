import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { AppComponentBase } from '../common-shared/app-component-base';

@Component({
  selector: 'app-header-portal',
  standalone: false,
  templateUrl: './header-portal.html',
  styleUrl: './header-portal.scss',
})
export class HeaderPortal extends AppComponentBase implements OnInit {
  @ViewChild('profileMenu') profileMenu!: Menu;

  userInfo = {
    name: 'John Doe',
    designation: 'System Administrator',
    avatar: 'https://i.pravatar.cc/150?img=12',
  };

  profileMenuItems: MenuItem[] = [];

  constructor(private injector:Injector){
    super(injector)

  }

  ngOnInit(): void {
    this.profileMenuItems = [
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        styleClass: 'logout-item',
        command: () => this.onLogout(),
      },
    ];
  }

  toggleProfileMenu(event: Event): void {
    this.profileMenu.toggle(event);
  }
  onLogout(){
    this.routerNavigate('account/login')
    
  }
}
