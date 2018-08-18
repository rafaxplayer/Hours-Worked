import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DayType } from '../interfaces/interfaces';

@Pipe({
  name: 'localizedDayType',
  pure: false
})
export class LocalizedDayTypePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {
  }

  transform(daytype:DayType):string {
   
    return this.translateService.instant(daytype.value.toUpperCase())
  }

}