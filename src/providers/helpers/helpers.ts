import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DayType } from '../../interfaces/interfaces';

@Injectable()
export class HelpersProvider {

  constructor(private translateService:TranslateService) {}

  addZeros(time:any):any{
      
      if (time < 10) {
          time = "0" + time;
      }
      return time;
  }
  
  formatMinutes(m:number):string{
  
      var minutes = m%60
      var hours = (m - minutes) / 60
      return this.addZeros(hours) + ":" + this.addZeros(minutes);
  }
  
  convertMinutesToHours(m:number):number{
  
      var minutes = m % 60
      var hours =  hours = (m - minutes) / 60
      return parseFloat(hours + '.'+ minutes);
  
  }
     
    getPeriodMsg(startPeriod:boolean):string{
      if(startPeriod){
        return this.translateService.instant('START-OF-WORK');
      }else{
        return this.translateService.instant('END-OF-WORK');;
      }
    }
  
    getFormatDate(date):string{
      return `Dia ${date.getDate()} del ${date.getMonth()} ${date.getFullYear()}`;
  
    }
  
    getFormatHour(date:Date,startPeriod:boolean):string{
  
     let outputh:string;
  
      if(startPeriod){
        outputh= this.translateService.instant('STARTS');
      }else{
        outputh= this.translateService.instant('FINISH');
      }
      return `${outputh} ${this.addZeros(date.getHours())}:${this.addZeros(date.getMinutes())} ${this.translateService.instant('HOURS')}`;
    }
  
   DayTypes:DayType[] = [
    { label:'Trabajado',value:'worked',color:'whiteday' },
    { label:'Fiesta',value:'free',color:'greenday' },
    { label:'Vacaciones',value:'holidays',color:'blueday' }
  ]
      
}
  