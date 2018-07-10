import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalEditPage } from './modal-edit';
import { CalendarModule } from 'angular-calendar';
@NgModule({
  declarations: [
    ModalEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalEditPage),
    CalendarModule
  ],
})
export class ModalEditPageModule {}
