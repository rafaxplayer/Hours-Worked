import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import swal from 'sweetalert2';


@Injectable()
export class DialogsProvider {

  swalDlg = swal.mixin({
    confirmButtonClass: 'btn-dlg dlg-ok',
    cancelButtonClass: 'btn-dlg dlg-cancel',
    buttonsStyling: false,
  })
  

  constructor(public alertCtrl: AlertController, private translateService: TranslateService) { }

  dialogInfo(title: string, message: string, type: any, time:number = null) {
   
    this.swalDlg({
      type: type,
      title: title,
      text: message,
      timer: time,
      showConfirmButton: time == null
    })

  }

  dialogConfirm(title: string, message: string, type:any): Promise<any> {

    return new Promise((resolve, reject) => {
     
      this.swalDlg({
        title: title,
        text: message,
        type: type,
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('YES'),
        cancelButtonText: this.translateService.instant('CANCEL'),
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          resolve(true); return true
        } else if (
          // Read more about handling dismissals
          result.dismiss === swal.DismissReason.cancel
        ) {
          resolve(false); return false;
        }
      }) 

    });

  }

  
}
