import { Component ,Output, EventEmitter } from '@angular/core';
import { Platform ,Events, App} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ViewChild} from '@angular/core'
import { CalendarPage } from '../components/pages/calendar/calendar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html'
})
export class AppComponent {

  @ViewChild('rootNav') nav;

  @Output() changeCalendarView:EventEmitter<any> = new EventEmitter<any>();

  rootPage:any =  CalendarPage;
    
  constructor(platform: Platform, 
    statusBar:StatusBar, 
    public splashScreen:SplashScreen, 
    private translateService: TranslateService,
    private event:Events ,
    private app:App) {
      
    platform.ready().then(() => {

      this.translateService.setDefaultLang('en');
      this.translateService.use('en');
      console.log(this.translateService.currentLang);
      

      statusBar.styleDefault();
      this.splashScreen.hide();
    });
    
    platform.registerBackButtonAction(()=>{
     
      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();
      
      if(activeView != null){
       
        if(activeView.instance instanceof CalendarPage){
          if(activeView.instance.view == 'month'){
              platform.exitApp();
           }
          activeView.instance.changeView('month');
         
          
        }else if(activeView.name == 'ChartsPage'){
            nav.pop();
        }
        
      }

    })
    
    //header event to nav root page
    this.event.subscribe('goroot',()=> this.nav.popToRoot());
    
  }

  
  
}
