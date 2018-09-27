import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams,Slides } from 'ionic-angular';

@Component({
  selector: 'page-helper',
  templateUrl: 'helper.html',
})
export class HelperPage {

  @ViewChild('slider') slider: Slides;

  slides = [
    {
      title: "Bienvenid@ a hours worked",
      description: "Haremos una breve visita por la opciones que componen la aplicación <b>deslizate por la pantalla o pulsa Sigiente</b>",
      image: "assets/imgs/logo.png",
    },
   {
    title: "¿Empezamos?",
     description: "Pincha un dia al que quieras establecer un horario trabajado",
     image: "assets/imgs/tuto-1.png",
   },
   {
     title: "Inicio de horario",
     description: "Selecciona el inicio de tu horario y despues el final del mismo",
     image: "assets/imgs/tuto-2.png",
   },
   {
     title: "Tipo de dia",
     description: "Puedes seleccionar el tipo de dia ya sea Festivo ,Trabajado o vacaciones, esto teservira para ver que dias no trabajas.",
     image: "assets/imgs/tuto-3.png",
   }
 ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelperPage');
  }

  next(){
    this.slider.slideNext();
  }

  prev(){
    this.slider.slidePrev();
  }

  close(){
    this.navCtrl.pop();
  }

}