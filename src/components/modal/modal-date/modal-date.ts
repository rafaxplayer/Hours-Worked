import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the ModalDatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-modal-date',
  templateUrl: 'modal-date.html',
})
export class ModalDatePage {
  
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
