import { Component } from '@angular/core';
import { NavParams, ViewController} from 'ionic-angular';

@Component({
  selector: 'modal-date',
  templateUrl: 'modal-date.html',
})
export class ModalDateComponent {
  
  public data:any;

  constructor( private navParams: NavParams, private viewCtrl:ViewController) {}

  closeModal(){
    this.viewCtrl.dismiss({isValid:false});
  }

  save(){
    this.viewCtrl.dismiss({isValid:true});
  }

  ionViewWillLoad() {
    this.data = this.navParams.get('data');
  }
  
}
