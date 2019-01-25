import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'custom-button',
  template: `<button (click)="handleClick()">{{label}}</button>`,
  styles: [`
    button {
      border: solid 3px;
      padding: 8px 10px;
      background: #bada55;
      font-size: 20px;
    }
  `],
  encapsulation: ViewEncapsulation.Emulated
})
export class ButtonComponent {

  @Input() label: string = 'default label';

  @Output() action = new EventEmitter<number>();

  private clicksCt: number = 0;

  handleClick() { 
    this.clicksCt++;
    this.action.emit(this.clicksCt);
  }

}
