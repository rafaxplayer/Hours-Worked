import { Component } from '@angular/core';
import { FirebaseService } from '../../providers/firebase/firebase.service'
import { ModalController ,Modal, Events} from 'ionic-angular';
import { CalendarPage } from '../pages/calendar/calendar';


@Component({
  selector: 'header',
  templateUrl: 'header.html'
})
export class HeaderComponent {

  authState:any;

  calendarPage:any=CalendarPage;
  
  constructor(private firebaseservice:FirebaseService,private modal: ModalController,public event:Events) {
    this.event.subscribe('user',(user)=> this.authState = user)
  }

  login():void{
    
    const modalLogin:Modal = this.modal.create('ModalLoginPage');
    modalLogin.present();
    
  }
  
  logOut():void{
    this.firebaseservice.signOut();
  }

  goRoot(){
    this.event.publish('goroot');
  }
  
  ionViewDidLeave(){
    this.event.unsubscribe('user');
  }
}
