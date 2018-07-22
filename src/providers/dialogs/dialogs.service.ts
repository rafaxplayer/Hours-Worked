import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class DialogsProvider {

  constructor(public alertCtrl:AlertController) {}

  dialogInfo(title:string,message:string,cClass:string,time?:number,BackdropDismiss:boolean = true){

    let alrtInfo = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Cerrar'],
      cssClass:'alert ' + cClass,
      enableBackdropDismiss:BackdropDismiss
    });
    if(time){
      setTimeout(()=>{alrtInfo.dismiss()},time);
    }
    alrtInfo.present();

  }

  dialogConfirm(title:string,message:string,cClass:string,BackdropDismiss:boolean = true):Promise<any>{

    return new Promise((resolve,reject) =>{

      let alrtConfirm = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: 'Si',
            handler: ()=>{ alrtConfirm.dismiss().then(()=>resolve(true)); return false; }
          },
          {
            text: 'No',
            handler: () => { alrtConfirm.dismiss().then(()=>resolve(false)) ; return false}
          }
        ],
        cssClass:'alert ' + cClass,
        enableBackdropDismiss:BackdropDismiss
      });
      alrtConfirm.present();

    });

  }

}
