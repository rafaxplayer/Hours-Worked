import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { DayType } from '../../../interfaces/interfaces';
import { HelpersProvider } from '../../../providers/helpers/helpers';

@Component({
  selector: 'select-free',
  template: `
  <ion-list radio-group [(ngModel)]="selectionDayType">
    <ion-list-header>{{ 'DAYTYPE-SELECT' | translate }} ({{ date | date :'d MMMM y' }})
    </ion-list-header>
    <ion-item *ngFor="let day of dayTypes">
      <ion-label>{{ day | localizedDayType }}</ion-label>
      <ion-radio [value]="day" (click)="closePopover()"></ion-radio>
    </ion-item>
  </ion-list>
`
})
export class SelectDayTypeComponent {

  dayTypes:DayType[] = this.helpers.DayTypes;
  
  selectionDayType:DayType; 

  date:Date;
  
  constructor(public navParams:NavParams,
              private viewCtrl:ViewController,
              private helpers:HelpersProvider) {

    if(this.navParams.data){

      this.date = this.navParams.data.date;
      this.selectionDayType = this.helpers.DayTypes.filter((dayType)=> dayType.value == this.navParams.data.dayType.value)[0];
     
    }
    
  }
  
  closePopover(){
            
      this.viewCtrl.dismiss(this.selectionDayType);
  }

  
}
