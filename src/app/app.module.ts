import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

//Components & Pages
import { AppComponent } from './app.component';
import { CalendarPage, ChartsPage } from '../components/pages/pages.index';
import { HeaderComponent } from '../components/header/header';
import { ModalEditComponent } from '../components/modal/modal-edit/modal-edit';
import { ModalDateComponent } from '../components/modal/modal-date/modal-date';

//Popover
import { SelectDayTypeComponent } from '../components/modal/select-daytype/select-daytype';

//Pipes
import { LocalizedDatePipe } from '../pipes/localizedDate.pipe';
import { LocalizedDayTypePipe} from '../pipes/localizedDayType.pipe';

//Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';

//Providers
import { DialogsProvider } from '../providers/dialogs/dialogs.service';
import { DatabaseProvider } from '../providers/database/database';
import { HelpersProvider } from '../providers/helpers/helpers';

//Animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Calendar
import { CalendarModule } from 'angular-calendar';

//charts
import { ChartsModule } from 'ng2-charts';

//http
import { HttpClientModule, HttpClient } from '@angular/common/http';

//translation
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '../../node_modules/@angular/common';


registerLocaleData(localeEs)
registerLocaleData(localeEn)

export function setTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CalendarPage,
    HeaderComponent,
    ChartsPage,
    SelectDayTypeComponent,
    LocalizedDatePipe,
    LocalizedDayTypePipe,
    ModalEditComponent,
    ModalDateComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(AppComponent),
    CalendarModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (setTranslateLoader),
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent,
    CalendarPage,
    ChartsPage,
    SelectDayTypeComponent,
    ModalEditComponent,
    ModalDateComponent 
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DialogsProvider,
    DatabaseProvider,
    SQLite,
    HelpersProvider
  ]
})
export class AppModule {}
