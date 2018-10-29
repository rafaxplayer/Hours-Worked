import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { CalendarPage } from '../../pages/calendar/calendar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'header',
  templateUrl: 'header.html'
})
export class HeaderComponent {

  calendarPage: any = CalendarPage;

  languages: any[] = [];

  location: string;

  isActiveSettingsPage:boolean=false;
  
  constructor(public event: Events,
    platform: Platform,
    private translateService: TranslateService,
    private simpleStorage: Storage) {

    platform.ready().then(() => {

      translateService.addLangs(['en', 'es']);

      this.translateService.setDefaultLang( 'en' );

      this.simpleStorage.get('lang').then( lang => {
        
        this.translateService.use( lang ? lang : 'en' );
        
      });

      this.location = this.translateService.currentLang;

    });

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.location = event.lang;
      this.simpleStorage.set('lang', event.lang);
      
    });

    this.event.subscribe('settingsIsActive',( isactive )=>{
      this.isActiveSettingsPage = isactive;
    })

  }

  goSettingsPage(){
    this.event.publish('goSettings');
  }

  goRoot() {
    this.event.publish('goroot');
  }
  

  choose(lang) {
    this.translateService.use(lang);
  }
  
  ionViewWillUnload(){
    this.event.unsubscribe('settingsIsActive');
  }

  
}
