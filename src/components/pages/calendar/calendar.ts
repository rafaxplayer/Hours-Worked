import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, Events, PopoverController, Content } from 'ionic-angular';
import { CalendarEvent, DAYS_OF_WEEK } from 'angular-calendar';
import { Subject, Subscription } from 'rxjs';
import { isBefore, isEqual, isValid, isWithinRange, isSameDay, differenceInMinutes } from 'date-fns'
import { ModalController, Modal } from 'ionic-angular';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { ChartsPage } from '../pages.index';
import { SelectDayTypeComponent } from '../../modal/select-daytype/select-daytype';
import { ModalEditComponent } from '../../modal/modal-edit/modal-edit';
import { ModalDateComponent } from '../../modal/modal-date/modal-date';
import { DatePicker } from '@ionic-native/date-picker';
import { DayType } from '../../../interfaces/interfaces';
import { DatabaseProvider } from '../../../providers/database/database';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HelpersProvider } from '../../../providers/helpers/helpers';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendar.html',

})
export class CalendarPage {

  @ViewChild(Content) content: Content;

  chartsPage: any = ChartsPage;

  propsButtonDay: DayType;

  dayTypesStored: any[] = [];

  events: CalendarEvent[] = [];

  view: string = 'month';

  viewDate: Date;

  locale: string;

  hoursWorked: string = "00:00";

  segmentDate: Date;

  startHorario: boolean = true;

  horario: CalendarEvent;

  refresh: Subject<any> = new Subject();

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  translateObserver: Subscription;

  constructor(
    public navCtrl: NavController,
    public event: Events,
    private modal: ModalController,
    private popoverCtrl: PopoverController,
    private actSheet: ActionSheetController,
    private dialogsProvider: DialogsProvider,
    private database: DatabaseProvider,
    private changeref: ChangeDetectorRef,
    private translate: TranslateService,
    private helper: HelpersProvider,
    private datePicker: DatePicker,
    private simpleStorage: Storage) {

    this.segmentDate = new Date();
    this.propsButtonDay = this.helper.DayTypes[0];
    this.viewDate = new Date();

    this.translateObserver = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.locale = event.lang;
    });
  }

  ionViewWillEnter() {
    this.getHorarios();
    this.getFreeDays();

    this.simpleStorage.get('calendar').then((val) => {
      console.log(val);

      if (!val) {
        let msgs = this.translate.instant('HELPERS');
        this.dialogsProvider.dialogInfo(msgs.CALENDAR_WELCOME_TITLE, msgs.CALENDAR_WELCOME_MSG, 'alertInfo')
        this.simpleStorage.set('calendar', 'true');
      }

    })

  }

  getHorarios() {
    this.database.getHorarios().then((horarios) => {

      this.events = [];
      horarios.forEach((data, i) => {
        let x = JSON.parse(data.horario)
        let newHorario = Object.assign({}, x);
        newHorario.start = new Date(x.start);
        newHorario.end = new Date(x.end);
        newHorario.meta.id = data.id;
        this.events.push(newHorario as CalendarEvent);

      })

      this.refresh.next();
    })
  }

  getFreeDays() {
    this.database.getFreeDays().then((freedays) => {

      this.dayTypesStored = [];
      freedays.forEach((data: any) => {
        this.dayTypesStored.push(data);
      })

      this.refresh.next();

    })
  }

  // day click on month.... show day view
  dayClick({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (this.view == 'month') {
      this.viewDate = date;
      this.view = 'day';
    }

  }

  // header day click ... show view day
  weekDayClick(event) {
    this.viewDate = event.date;
    this.view = 'day';
  }

  //Event clicked
  eventClicked({ event }: { event: CalendarEvent }): void {
    let actSheetEvent = this.actSheet.create({
      title: this.translate.instant('WHAT_SCHEDULE'),
      enableBackdropDismiss: true,
      cssClass: 'act-sheet',
      buttons: [
        {
          text: this.translate.instant('DELETE'),
          role: 'destructive',
          icon: 'ios-trash',
          handler: () => {
            this.dialogsProvider.dialogConfirm(
              this.translate.instant('DELETE_SCHEDULE'), this.translate.instant('CONFIRM_DELETE_SCHEDULE'), 'alertDanger').then((ret) => {
                if (ret) {

                  this.database.deleteHorario(event.meta.id);
                  this.getHorarios();
                }
              }).catch(() => this.dialogsProvider.dialogInfo('Error', this.translate.instant('ERROR_DELETE_SCHEDULE'), 'alertDanger', 3000));
          }
        },
        {
          text: this.translate.instant('EDIT'),
          icon: 'md-create',
          handler: () => {
            let modalEdit: Modal = this.modal.create(ModalEditComponent, { date: this.viewDate, event: event, id: event.meta.id });
            modalEdit.present();
            modalEdit.onDidDismiss((isUpdate) => {
              if (isUpdate) {
                this.getHorarios();
              }

            });
          }
        },
        {
          text: this.translate.instant('CANCEL'),
          icon: 'md-close',
          role: 'cancel',
          handler: () => {
            console.log('Archive cancel');
          }
        }

      ]
    });
    actSheetEvent.present();
  }

  // hour click on day view
  hour_clicked(event) {
    this.segmentDate = new Date(event.date);
    this.openDateModal();
  }

  openDateModal() {

    let periodMsg = this.helper.getPeriodMsg(this.startHorario);
    let dateModal = this.helper.getFormatDate(this.segmentDate);
    let hourModal = this.helper.getFormatHour(this.segmentDate, this.startHorario);

    let dataModal = {
      periodtext: periodMsg,
      date: dateModal,
      hour: hourModal
    }

    let modalDate: Modal = this.modal.create(ModalDateComponent, { data: dataModal });
    modalDate.present();
    modalDate.onDidDismiss((data) => {

      if (data.isValid) {
        if (!isValid(this.segmentDate)) {
          this.dialogsProvider.dialogInfo('Error', this.translate.instant('INVALID_SCHEDULE'), 'alertDanger');
          return;
        }

        if (this.startHorario) {
          this.horario = this.cleanHorario();
          this.horario.start = this.segmentDate;
          this.startHorario = false;
          this.dialogsProvider.dialogInfo(this.translate.instant('START_SCHEDULE'), this.translate.instant('END_SCHEDULE'), 'alertInfo', 3000);
        } else {

          if (isBefore(this.segmentDate, this.horario.start) || isEqual(this.segmentDate, this.horario.start)) {
            this.dialogsProvider.dialogInfo('Error', this.translate.instant('SCHEDULE_OVERLAP'), 'alertDanger');
            return;
          }

          this.horario.end = this.segmentDate;
          let minutes = differenceInMinutes(this.horario.end, this.horario.start);
          this.horario.meta.minutes = minutes;
          this.horario.title = `${this.helper.formatMinutes(minutes)} ${this.translate.instant('WORKED')}`;

          if (this.checkSchedulesOverlap(this.horario, this.events)) {
            this.dialogsProvider.dialogInfo('Error', this.translate.instant('SCHEDULE_OVERLAP'), 'alertDanger');
            this.startHorario = true;
            return;
          }

          this.database.addHorario(this.horario).then((horario) => {

            this.dialogsProvider.dialogInfo(this.translate.instant('SAVED'), this.translate.instant('ADD_SCHEDULE'), 'alertInfo', 2000);
            this.startHorario = true;
            this.getHorarios();

            this.simpleStorage.get('day-type').then((val) => {
              console.log(val);
      
              if (!val) {
                let msgs = this.translate.instant('HELPERS');
                this.dialogsProvider.dialogInfo(msgs.DAYTYPE_WELCOME_TITLE, msgs.DAYTYPE_WELCOME_MSG, 'alertInfo')
                this.simpleStorage.set('day-type', true);
              }
      
            })

          }).catch(e => console.log(e));

        }

      } else { this.startHorario = true }

    });

  }

  beforeViewRender(event): void {

    let totalminutes = 0;

    event.period.events.forEach(evt => {
      totalminutes = totalminutes + evt.meta.minutes;
    });

    // print hours worked on panel information
    this.hoursWorked = `${this.helper.convertMinutesToHours(totalminutes)}`;

    //view month render...
    if (this.view == 'month') {
      event.body.forEach(day => {
        let minutes: number = 0;
        day.events.forEach(event => {
          minutes = minutes + event.meta.minutes;
        })

        day.badgeTotal = this.helper.convertMinutesToHours(minutes);

        let samedata: any = this.dayTypesStored.filter((data) => day.date.toDateString() === data.date);

        if (samedata.length) {

          let dTypeObj = JSON.parse(samedata[samedata.length - 1].daytype);
          day.cssClass = dTypeObj.value;
        }

      });
    }

    // view day render....
    if (this.view == 'day') {
      //tutorial on first use
      this.simpleStorage.get('day').then((val) => {
        console.log(val);

        if (!val) {
          let msgs = this.translate.instant('HELPERS');
          this.dialogsProvider.dialogInfo(msgs.DAY_WELCOME_TITLE, msgs.DAY_WELCOME_MSG, 'alertInfo')
          this.simpleStorage.set('day', true);
        }

      })

      // button typeday on view day
      let daytypedata: any = this.dayTypesStored.filter((data) => isSameDay(this.viewDate.toDateString(), data.date));
      this.propsButtonDay = daytypedata.length > 0 ? JSON.parse(daytypedata[daytypedata.length - 1].daytype) : this.helper.DayTypes[0];
      // detect changes
      this.changeref.detectChanges();

    }
    this.content.scrollToTop();

  }

  // comprueba si dos eventos se solapan
  checkSchedulesOverlap(date: CalendarEvent, events: CalendarEvent[]): boolean {

    //get events today
    let eventstoday = events.filter(iEvent => isSameDay(iEvent.start, date.start));

    // get event today isWithinRange new period
    let today = eventstoday.filter(iEvent => isWithinRange(date.start, iEvent.start, iEvent.end) || isWithinRange(date.end, iEvent.start, iEvent.end))

    // if iswithingrange return bolean
    return (today.length > 0);
  }

  //Add day type
  showMenuFreeDays() {

    let pop = this.popoverCtrl.create(SelectDayTypeComponent, { date: this.viewDate, dayType: this.propsButtonDay });

    pop.onDidDismiss((data) => {

      if (data != null) {

        this.database.addFreeDay(this.viewDate, data).then((freeDay) => {
          this.propsButtonDay = data;
          this.refresh.next();
          this.dialogsProvider.dialogInfo('Ok', this.translate.instant('DAYTYPE_CHANGED'), 'alertInfo', 2500);
          this.getFreeDays();
        }).catch(e => this.dialogsProvider.dialogInfo('Error', e.message, 'alertDanger', 3000));
      };
    });
    pop.present();
  }

  cleanHorario(): CalendarEvent {
    return this.horario = {
      title: "",
      start: new Date(),
      end: new Date(),
      color: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
      },
      meta: {
        id: 0,
        minutes: 0
      }
    }
  }

  deleteFreeDays() {
    this.dialogsProvider.dialogConfirm(this.translate.instant('DELETE_FREE'), this.translate.instant('DELETE_FREE_DAYS'), 'alertDanger', true)
      .then((ret) => {
        if (ret) {
          this.database.removeFreeDays();
          this.getFreeDays();
        }
      })

  }

  changeView(view: string): void {
    this.view = view;
    this.changeref.detectChanges();
  }

  ionViewWillUnload() {
    this.translateObserver.unsubscribe();
  }
  // show date picker 
  showDatePicker() {

    this.datePicker.show({
      date: this.viewDate,
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK,
      cancelText: this.translate.instant('CANCEL'),
    }).then(
      date => {
        this.viewDate = date,
          this.refresh.next();
      },
      err => console.log('Error occurred while getting date: ', err)
    );

  }

}
