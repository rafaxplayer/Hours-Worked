import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { DayType } from '../../../app/helpers';

@Component({
  selector: 'select-free',
  template: `
  <ion-list radio-group [(ngModel)]="selectionDayType">
    <ion-list-header>
      Seleciona tipo de dia ({{ date | date :'d MMMM y' }})
    </ion-list-header>
    <ion-item *ngFor="let day of dayTypes">
      <ion-label>{{ day.label }}</ion-label>
      <ion-radio [value]="day" (click)="dismiss()"></ion-radio>
    </ion-item>
  </ion-list>
`
})
export class SelectDayTypeComponent {

  dayTypes:DayType[] = [{label:'Trabajado',value:'worked',color:'primary'},{label:'Fiesta',value:'free',color:'green'},{label:'Vacaciones',value:'holidays',color:'blue'}]
  
  selectionDayType:DayType;

  date:Date;
  
  constructor(public navParams:NavParams,private viewCtrl:ViewController) {

    if(this.navParams.data){
      this.date = this.navParams.data.date;
      this.selectionDayType = this.dayTypes[0]
    }
    
  }
  dismiss(){
    console.log(this.selectionDayType);
      this.viewCtrl.dismiss(this.selectionDayType);
  }

  change(){

  }
}
