import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ModalDatePage } from './modal-date';
@NgModule({
  declarations: [
  
    ModalDatePage
  ],
  imports: [
    IonicPageModule.forChild(ModalDatePage),
  ],
})
export class ModalsModule {}
