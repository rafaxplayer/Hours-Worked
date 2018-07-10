import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalLoginPage } from './modal-login';

@NgModule({
  declarations: [
    ModalLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalLoginPage),
  ],
})
export class ModalLoginPageModule {}
