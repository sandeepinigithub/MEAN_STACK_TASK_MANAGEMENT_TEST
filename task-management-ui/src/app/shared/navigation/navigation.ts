import { Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  sidebarCloseFlag: boolean = false
  menu: any = []
  sidebarCloseEvent(event: any) {

  }
}
