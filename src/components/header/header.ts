import { Component } from '@angular/core';
import { Platform ,Events} from 'ionic-angular';
import { CalendarPage } from '../pages/calendar/calendar';
import { TranslateService, LangChangeEvent} from '@ngx-translate/core';

@Component({
  selector: 'header',
  templateUrl: 'header.html'
})
export class HeaderComponent {
 
  calendarPage:any = CalendarPage;

  languages:any[]=[];

  location:string;
    
  constructor(public event:Events ,platform:Platform ,private translateService:TranslateService) {
       
    platform.ready().then(() => {

      this.translateService.setDefaultLang('en');
      this.translateService.use('en');

      console.log(this.translateService.currentLang);
      this.location = this.translateService.currentLang;
      
    });

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.location = event.lang;
    });

  }

  goRoot(){
    this.event.publish('goroot');
  }
  
  ionViewDidLeave(){
    this.event.unsubscribe('user');
  }


  choose(lang){

    this.translateService.use(lang);
    
  }
}
