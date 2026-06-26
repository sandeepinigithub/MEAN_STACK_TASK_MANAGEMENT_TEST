import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';

@Injectable()
export class AppNavigationService {
    constructor(
    ) { }

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [
            new AppMenuItem('Dashboard', '', 'pi pi-home', '/portal/dashboard'),
            new AppMenuItem("Task Management", '', "pi pi-list me-1", '', [],
                [
                    new AppMenuItem('Tasks', '', '', '/portal/task-management/tasks'),
                ]
            ),
            new AppMenuItem("User Management", '', "pi pi-user me-1", '', [],
                [
                    new AppMenuItem('Users', '', '', '/portal/user-management/users'),
                ]
            ),

        ]);
    }


    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach((menuItem) => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach((subMenu) => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}

