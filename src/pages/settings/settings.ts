import { Events, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogsProvider } from '../../providers/dialogs/dialogs.provider';
import { WheelSelector } from '@ionic-native/wheel-selector';
import { Storage } from '@ionic/storage';
import { HelpersProvider } from '../../providers/helpers/helpers.provider';
import { HelperPage } from '../pages.index';


@Component({
  selector: 'settings-page',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  hoursNumber: any[];

  hNumber: string;

  helperPage: any = HelperPage;

  constructor(
    public navCtrl: NavController,
    private translate: TranslateService,
    private dialogs: DialogsProvider,
    private selNumberHours: WheelSelector,
    private simpleStorage: Storage,
    public event: Events,
    private helpers: HelpersProvider) {

    this.simpleStorage.get("hours").then((hours) => {

      this.hNumber = hours ? hours : "0";
    })

    this.hoursNumber = this.helpers.getHoursNumberArray();

  }


  ionViewWillEnter() {
    this.event.publish('settingsIsActive', true);
  }

  ionViewWillUnload() {
    this.event.publish('settingsIsActive', false);
  }

  selectHours() {
    this.selNumberHours.show({
      title: "Select hours",
      items: [
        this.hoursNumber
      ],
      positiveButtonText: "Ok",
      negativeButtonText: this.translate.instant("CANCEL"),
      theme: 'dark',
      wrapWheelText: true,
      displayKey: 'value',
      defaultItems: [
        { index: parseInt(this.hNumber), value: this.hoursNumber[parseInt(this.hNumber)] }
      ]
    }).then(
      result => {
        this.hNumber = result[0].value;
        this.simpleStorage.set('hours', this.hNumber);
      },
      err => console.log('Error: ', err)
    );
  }

  changeInputNumber(nhours: number) {
    console.log(nhours);
    console.log(this.hNumber);

  }
  selectLang(lang: string) {
    this.translate.use(lang);
    this.dialogs.dialogInfo('Ok!', 'Language changed', 'success', 1500);

  }

}
