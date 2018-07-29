import { Component ,Output, EventEmitter } from '@angular/core';
import { Platform ,Events, App} from 'ionic-angular';
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
  @Output() changeCalendarView:EventEmitter<any> = new EventEmitter<any>();
  rootPage:any =  NotloginPage;
  title: string;
  
  constructor(platform: Platform, statusBar:StatusBar, splashScreen:SplashScreen, private firebaseservice:FirebaseService ,private event:Events ,private app:App) {
    platform.ready().then(() => {
      
      statusBar.styleDefault();
      splashScreen.hide();
    });
    
    platform.registerBackButtonAction(()=>{
      console.log('call');
      
      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();
      
      if(activeView != null){
        console.log(activeView.name);
        if(activeView.name =='CalendarPage'){
          activeView.instance.changeView('month');
          console.log(activeView.instance.view);
          
        }else if(activeView.name == 'ChartsPage'){
            nav.pop();
        }
        
      }

    })
    

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
