import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'page-helper',
  templateUrl: 'helper.html',
})
export class HelperPage {

  @ViewChild('slider') slider: Slides;

  slides = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private translate: TranslateService) { }

  ionViewDidEnter() {

    this.translate.get('HELPERS').subscribe(val => {
        this.slides = this.initHelper(val);
      
    });

    this.translate.onLangChange.subscribe((event:LangChangeEvent)=>{
      this.slides=this.initHelper(event.translations.HELPERS);

    })
  }

  next() {
    this.slider.slideNext();
  }

  prev() {
    this.slider.slidePrev();
  }

  close() {
    this.navCtrl.pop();
  }
  
  initHelper(val:any):any{
    return [
      {
        title: val.title1,
        description: val.description1,
        image: val.image1
      },
      {
        title: val.title2,
        description: val.description2,
        image: val.image2
      },
      {
        title: val.title3,
        description: val.description3,
        image: val.image3
      },
      {
        title: val.title4,
        description: val.description4,
        image: val.image4
      }]
  }
}