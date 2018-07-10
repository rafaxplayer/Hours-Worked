import { Component } from '@angular/core';
import { IonicPage ,ViewController} from 'ionic-angular';
import { FirebaseService } from '../../../providers/firebase/firebase.service';

@IonicPage()
@Component({
  selector: 'page-modal-login',
  templateUrl: 'modal-login.html',
})
export class ModalLoginPage {

  registerCredentials = { email: '', password: '' };

  constructor(public view:ViewController,private firebaseService:FirebaseService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalLoginPage');
  }
  login(){
    if(this.registerCredentials.email || this.registerCredentials.password){
      this.firebaseService.useremailLogin(this.registerCredentials)
          .then(()=>this.view.dismiss())
          
    }
    
  }

  loginWithGoogle(){
    this.firebaseService.googleLogin()
        .then(()=>{this.view.dismiss()})
        
  }
}
