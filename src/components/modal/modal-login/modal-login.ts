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

  constructor(private firebaseService:FirebaseService,private viewCtrl:ViewController) {
  }
  
  login(){
    if(this.registerCredentials.email || this.registerCredentials.password){
      this.firebaseService.useremailLogin(this.registerCredentials)
          .then(()=> this.viewCtrl.dismiss() )
          
    }
    
  }

  loginWithGoogle(){
    this.firebaseService.googleLogin()
        .then(()=>{this.viewCtrl.dismiss()})
        
  }

  closeModal(){
    this.viewCtrl.dismiss({isValid:false});
  }
}
