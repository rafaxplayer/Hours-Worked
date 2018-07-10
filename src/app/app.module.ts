import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

//components
import { AppComponent } from './app.component';
import { CalendarPage } from '../components/pages/calendar/calendar';
import { ChartsComponent } from '../components/pages/charts/charts';
import { HeaderComponent } from '../components/header/header';
import { NotloginPage} from '../components/pages/notlogin/notlogin';
import { SelectDayTypeComponent } from '../components/modal/select-daytype/select-daytype';


//native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//Providers
import { FirebaseService } from '../providers/firebase/firebase.service';
import { DialogsProvider } from '../providers/dialogs/dialogs.service';

//Animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Calendar
import { CalendarModule } from 'angular-calendar';

//charts
import { ChartsModule } from 'ng2-charts';

//firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

const firebase={
  apiKey: "AIzaSyBDqNebgm81TqptCztfHACpeZuriqwMrSI",
  authDomain: "work-manager-e2652.firebaseapp.com",
  databaseURL: "https://work-manager-e2652.firebaseio.com",
  projectId: "work-manager-e2652",
  storageBucket: "work-manager-e2652.appspot.com",
  messagingSenderId: "813326057616"
}

@NgModule({
  declarations: [
    AppComponent,
    CalendarPage,
    HeaderComponent,
    NotloginPage,
    ChartsComponent,
    SelectDayTypeComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(AppComponent),
    CalendarModule.forRoot(),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AppComponent,
    CalendarPage,
    HeaderComponent,
    NotloginPage,
    ChartsComponent,
    SelectDayTypeComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FirebaseService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DialogsProvider
  ]
})
export class AppModule {}
