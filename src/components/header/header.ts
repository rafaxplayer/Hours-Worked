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

  constructor(public event: Events,
    platform: Platform,
    private translateService: TranslateService,
    private simpleStorage: Storage) {

    platform.ready().then(() => {

      this.simpleStorage.get('lang').then(lang => {

        console.log('default lang', lang)
        const defaultlang = lang ? lang : 'en';
        this.translateService.setDefaultLang( defaultlang );
        this.translateService.use( defaultlang );

      });

      this.location = this.translateService.currentLang;

    });

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.location = event.lang;
      this.simpleStorage.set('lang', event.lang);
    });

  }

  goRoot() {

    this.event.publish('goroot');
  }

  ionViewDidLeave() {
    this.event.unsubscribe('user');
  }

  choose(lang) {

    this.translateService.use(lang);

  }
}
