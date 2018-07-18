import { Component } from '@angular/core';
import {  NavController, NavParams, LoadingController } from 'ionic-angular';

/**
 * Generated class for the NotloginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-notlogin',
  templateUrl: 'notlogin.html',
})
export class NotloginPage {

  showImageNotLogin:boolean;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private loaderCtrl:LoadingController) {
    this.showImageNotLogin=false;
  }


  ionViewWillEnter(){
    let loader = this.loaderCtrl.create();
    loader.present();
    setTimeout(()=>{
      this.showImageNotLogin=true;
      loader.dismiss()},2000)
  }
  
}
