import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalEditPage } from './modal-edit';
import { CalendarModule } from 'angular-calendar';
import { TranslateModule} from '@ngx-translate/core'
@NgModule({
  declarations: [
    ModalEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalEditPage),
    CalendarModule,
    TranslateModule
  ],
})
export class ModalEditPageModule {}
