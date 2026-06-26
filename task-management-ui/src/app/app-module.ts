import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// ========================== PrimeNg Setup Start ========================================
import { providePrimeNG } from 'primeng/config';
import MyPreset from './../assets/scss/mypreset';
// ========================== PrimeNg Setup End ========================================

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    // ========================== PrimeNg Setup Start ========================================
    providePrimeNG({
      theme: {
        preset: MyPreset, // Custom Theme
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    // ========================== PrimeNg Setup End ========================================
  ],
  bootstrap: [App],
})
export class AppModule { }
