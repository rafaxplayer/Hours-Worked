import { Component } from '@angular/core';
import { Platform ,Events} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseService } from '../providers/firebase/firebase.service'
import { ViewChild} from '@angular/core'

import { NotloginPage } from '../components/pages/notlogin/notlogin';
import { CalendarPage } from '../components/pages/calendar/calendar'

@Component({
  templateUrl: 'app.html'
})
export class AppComponent {

  @ViewChild('rootNav') nav;
  rootPage:any =  NotloginPage;
  title: string;
  
  constructor(platform: Platform, statusBar:StatusBar, splashScreen:SplashScreen, private firebaseservice:FirebaseService,private event:Events ) {
    platform.ready().then(() => {
      
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.firebaseservice.currentUserObservable().subscribe(user => {
            
      let page = user ? CalendarPage : NotloginPage;
      if(this.nav){
        this.nav.setRoot(page);
      }
      this.event.publish('user',user);
      
    }); 
    //header event to nav root page
    this.event.subscribe('goroot',()=> this.nav.popToRoot());
    
  }
}
