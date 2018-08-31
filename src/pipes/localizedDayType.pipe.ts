import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'localizedDayType',
  pure: false
})
export class LocalizedDayTypePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {
  }

  transform(value:string): string {
   
    return this.translateService.instant(`${value.toUpperCase()}`)
    
  }

}