import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { DayType } from '../../../interfaces/interfaces';
import { DayTypes } from '../../../app/helpers';

@Component({
  selector: 'select-free',
  template: `
  <ion-list radio-group [(ngModel)]="selectionDayType">
    <ion-list-header>
      Seleciona tipo de dia ({{ date | date :'d MMMM y' }})
    </ion-list-header>
    <ion-item *ngFor="let day of dayTypes">
      <ion-label>{{ day.label }}</ion-label>
      <ion-radio [value]="day" (click)="closePopover()"></ion-radio>
    </ion-item>
  </ion-list>
`
})
export class SelectDayTypeComponent {

  dayTypes:DayType[] = DayTypes;
  
  selectionDayType:DayType; 

  date:Date;
  
  constructor(public navParams:NavParams,private viewCtrl:ViewController) {

    if(this.navParams.data){

      this.date = this.navParams.data.date;
      //console.log(this.navParams.data.dayType);
      this.selectionDayType = DayTypes.filter((dayType)=> dayType.value == this.navParams.data.dayType.value)[0];
     
    }
    
  }
  
  closePopover(){
            
      this.viewCtrl.dismiss(this.selectionDayType);
  }

  
}
