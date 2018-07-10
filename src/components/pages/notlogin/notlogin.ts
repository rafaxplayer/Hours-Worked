import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('ionViewDidLoad NotloginPage');
  }

  
}
