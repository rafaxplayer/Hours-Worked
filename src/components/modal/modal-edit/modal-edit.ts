import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavParams, ViewController, ModalController, Modal } from 'ionic-angular';
import { CalendarEvent } from 'angular-calendar';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { isValid, isBefore, isEqual, differenceInMinutes } from 'date-fns'
import { Subject } from 'rxjs';
import { DatabaseProvider } from '../../../providers/database/database';
import { TranslateService } from '@ngx-translate/core';
import { HelpersProvider } from '../../../providers/helpers/helpers';
import { ModalDateComponent } from '../modal-date/modal-date';

@Component({
  selector: 'modal-edit',
  templateUrl: 'modal-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalEditComponent {

  events: CalendarEvent[] = [];

  event: CalendarEvent;

  viewDate: Date = new Date();

  date: Date;

  startPeriod: boolean = true;

  refresh: Subject<any> = new Subject();

  constructor(public viewCtrl: ViewController,
    public navParams: NavParams,
    private dialogsProvider: DialogsProvider,
    private modalCtrl: ModalController,
    private database: DatabaseProvider,
    private translateService: TranslateService,
    private helpers: HelpersProvider) {

    this.viewDate = this.navParams.get('date');
    this.event = this.navParams.get('event');
    let oldEvent = Object.assign({}, this.event);
    oldEvent.color = { primary: '#ad2121', secondary: '#FAE3E3' };
    this.events.push(oldEvent);

  }

  hour_clicked(event) {
    this.date = new Date(event.date);
    this.openModalDate();
  }

  closeModal() {
    this.viewCtrl.dismiss({ isUpdate: false });
  }

  openModalDate() {

    let periodMsg = this.helpers.getPeriodMsg(this.startPeriod);
    let dateModal = this.helpers.getFormatDate(this.date);
    let hourModal = this.helpers.getFormatHour(this.date, this.startPeriod);

    let dataModal = {
      periodtext: periodMsg,
      date: dateModal,
      hour: hourModal
    }

    let modalDate: Modal = this.modalCtrl.create(ModalDateComponent, { data: dataModal }, { enableBackdropDismiss: false });
    modalDate.present();
    modalDate.onDidDismiss((data) => {

      if (data.isValid) {

        if (!isValid(this.date)) {
          this.dialogsProvider.dialogInfo('Error', this.translateService.instant('INVALID_SCHEDULE'), 'error');
          return;
        }

        if (this.startPeriod) {
          this.event.start = this.date;
          this.startPeriod = false;
          this.dialogsProvider.dialogInfo(this.translateService.instant('START_SCHEDULE'), this.translateService.instant('END_SCHEDULE'), 'info');
        } else {

          if (isBefore(this.date, this.event.start) || isEqual(this.date, this.event.start)) {
            this.dialogsProvider.dialogInfo('Error', this.translateService.instant('SCHEDULE_END_OVERLAP'), 'error');
            return;
          }

          this.event.end = this.date;
          let minutes = differenceInMinutes(this.event.end, this.event.start);
          this.event.meta.minutes = minutes;
          this.event.title = `${this.helpers.formatMinutes(minutes)} trabajados`;

          this.events.push(this.event);
          this.refresh.next();
          this.startPeriod = true;
          this.dialogsProvider.dialogConfirm('Ok', this.translateService.instant('SCHEDULE_CONFIRM', { start: this.event.start.toLocaleTimeString(), end: this.event.end.toLocaleTimeString() }), 'question')
            .then((ret) => {
              if (ret) {

                this.database.updateHorario(this.event).then(() => {
                  this.viewCtrl.dismiss({ isUpdate: true });
                })

              } else {
                this.events.pop();
                this.refresh.next();
              }

            }).catch((err) => this.dialogsProvider.dialogInfo('Error', err, 'error'));

        }

      } else { this.startPeriod = true }

    });

  }
}
