import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DayType } from '../../interfaces/interfaces';

@Injectable()
export class HelpersProvider {

  constructor(private translateService: TranslateService) { }

  DayTypes: DayType[] = [
    { label: 'Trabajados', value: 'worked', color: 'whiteday' },
    { label: 'Fiesta', value: 'free', color: 'greenday' },
    { label: 'Vacaciones', value: 'holidays', color: 'blueday' }
  ]

  addZeros(time: any): any {

    if (time < 10) {
      time = "0" + time;
    }
    return time;
  }

  formatMinutes(m: number): string {

    var minutes = m % 60
    var hours = (m - minutes) / 60
    return this.addZeros(hours) + ":" + this.addZeros(minutes);
  }

  convertMinutesToHours(m: number): number {

    var minutes = m % 60
    var hours = hours = (m - minutes) / 60
    return parseFloat(hours + '.' + minutes);

  }

  modalPeriodMsg(startPeriod: boolean): string {
    if (startPeriod) {
      return this.translateService.instant('START_OF_WORK');
    } else {
      return this.translateService.instant('END_OF_WORK');;
    }
  }

  modalFormatDate(date): string {
    return this.translateService.instant('MODAL_DATE',{day:date.getDate(), month:this.translateService.instant('MONTHS')[date.getMonth()], year:date.getFullYear()});
    
  }

  modalFormatHour(date: Date, startPeriod: boolean): string {

    let outputh: string;

    if (startPeriod) {
      outputh = this.translateService.instant('STARTS');
    } else {
      outputh = this.translateService.instant('FINISH');
    }
    return `${outputh} ${this.addZeros(date.getHours())}:${this.addZeros(date.getMinutes())} ${this.translateService.instant('HOURS')}`;
  }

  getHoursNumberArray():any{
    return [
      {value:"0"},
      {value:"1"},
      {value:"2"},
      {value:"3"},
      {value:"4"},
      {value:"5"},
      {value:"6"},
      {value:"7"},
      {value:"8"},
      {value:"9"},
      {value:"10"},
      {value:"11"},
      {value:"12"},
      {value:"13"},
      {value:"14"},
      {value:"15"},
      {value:"16"},
      {value:"17"},
      {value:"18"},
      {value:"19"},
      {value:"20"},
      {value:"21"},
      {value:"22"},
      {value:"23"},
    ];
  }
  
 
}
