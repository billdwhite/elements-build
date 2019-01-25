import { Component, ViewEncapsulation } from '@angular/core';

declare let VERSION: string;

@Component({

  selector: 'custom-element',
  // templateUrl: './app.component.html',
  // styleUrls: ['./app.component.css']
  template: '<h1>Custom Element works!</h1>',
  encapsulation:   ViewEncapsulation.Emulated
  
})
export class AppComponent {
  constructor() {
    console.debug('started!');
    // console.debug('VERSION', VERSION);
  }
}