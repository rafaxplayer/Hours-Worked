import { Component, ChangeDetectionStrategy,ChangeDetectorRef,ViewChild } from '@angular/core';
import { NavController,ActionSheetController,Events,PopoverController,Content } from 'ionic-angular';
import { CalendarEvent ,DAYS_OF_WEEK } from 'angular-calendar';
import { Subject } from 'rxjs';
import { isBefore, isEqual, isValid, isWithinRange, isSameDay, differenceInMinutes } from 'date-fns'
import { ModalController ,Modal} from 'ionic-angular';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { ChartsPage } from '../pages.index';
import { SelectDayTypeComponent } from '../../modal/select-daytype/select-daytype';
import { DayType } from '../../../interfaces/interfaces';
import { DatabaseProvider } from '../../../providers/database/database';
import { TranslateService,LangChangeEvent } from '@ngx-translate/core';
import { HelpersProvider } from '../../../providers/helpers/helpers';


@Component({
  selector: 'calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendar.html',
  
})
export class CalendarPage {

  @ViewChild(Content) content: Content;

  chartsPage:any = ChartsPage;
  
  propsButtonDay:DayType; 

  dayTypesStored:any[]=[];
        
  events:CalendarEvent[]=[];

  view:string = 'month';

  viewDate:Date;

  locale:string;
    
  hoursWorked:string = "00:00";

  date:Date;
  
  startHorario:boolean = true;
 
  horario:CalendarEvent;

  refresh: Subject<any> = new Subject();

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
   
  constructor(
    public navCtrl: NavController ,
    public event:Events, 
    private modal: ModalController,
    private popoverCtrl:PopoverController,
    private actSheet:ActionSheetController, 
    private dialogsProvider: DialogsProvider, 
    private database:DatabaseProvider,
    private changeref:ChangeDetectorRef,
    private translate:TranslateService,
    private helper:HelpersProvider) {
      this.date = new Date();
      this.propsButtonDay = this.helper.DayTypes[0];
      this.viewDate = new Date();
  }

  ionViewWillEnter() {
        
    this.getHorarios();
    this.getFreeDays();
    
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.locale = event.lang;
      
    });
  }

  getHorarios(){
    this.database.getHorarios().then((horarios)=>{
      
      this.events = [];
      horarios.forEach((data,i)=>{
        let x = JSON.parse(data.horario)
        let newHorario = Object.assign({},x);
        newHorario.start= new Date(x.start);
        newHorario.end = new Date(x.end);
        newHorario.meta.id = data.id;
        this.events.push(newHorario as CalendarEvent);

      })
           
      this.refresh.next();
    })
  }

  getFreeDays(){
    this.database.getFreeDays().then((freedays)=>{
     
      this.dayTypesStored = [];
      freedays.forEach((data:any)=>{
        this.dayTypesStored.push(data);
      })
      
      this.refresh.next();
    })
  }

  // day click on month.... show day view
  dayClick({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if(this.view == 'month'){
      this.viewDate = date;
      this.view = 'day';
    } 
    
  }

  // header day click ... show view day
  weekDayClick(event){
    this.viewDate = event.date;
    this.view = 'day';
  }

  //Event clicked
  eventClicked({ event }: { event: CalendarEvent }): void {
    let actSheetEvent = this.actSheet.create({
      title: this.translate.instant('WHAT-SCHEDULE'),
      enableBackdropDismiss:true,
      cssClass:'act-sheet',
      buttons: [
        {
          text: this.translate.instant('DELETE'),
          role: 'destructive',
          icon: 'ios-trash',
          handler: () => {
            this.dialogsProvider.dialogConfirm(
              this.translate.instant('DELETE-SCHEDULE'),this.translate.instant('CONFIRM-DELETE-SCHEDULE'),'alertDanger').then((ret)=>{
                  if(ret){
                    
                    this.database.deleteHorario(event.meta.id);
                    this.getHorarios();
                   }
                }).catch(()=> this.dialogsProvider.dialogInfo('Error',this.translate.instant('ERROR-DELETE-SCHEDULE'),'alertDanger',3000) );
          }
        },
        {
          text: this.translate.instant('EDIT'),
          icon: 'md-create',
          handler: () => {
            let modalEdit:Modal = this.modal.create('ModalEditPage',{date:this.viewDate, event:event, id:event.meta.id});
            modalEdit.present();
            modalEdit.onDidDismiss((isUpdate)=> {
              if(isUpdate){
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
  hour_clicked(event){
    this.date = new Date(event.date);
    this.openModal();
  }

  openModal(){

    let periodMsg = this.helper.getPeriodMsg(this.startHorario);
    let dateModal = this.helper.getFormatDate(this.date);
    let hourModal = this.helper.getFormatHour(this.date,this.startHorario);

    let dataModal = {
      periodtext:periodMsg,
      date:dateModal,
      hour:hourModal
    }

    let modalDate:Modal = this.modal.create('ModalDatePage',{ data:dataModal });
    modalDate.present();
    modalDate.onDidDismiss((data)=>{

      if(data.isValid){
        if(!isValid(this.date)){
          this.dialogsProvider.dialogInfo('Error',this.translate.instant('INVALID-SCHEDULE'),'alertDanger');
          return;
        }
        
        if(this.startHorario){
          this.horario = this.cleanHorario();
          this.horario.start = this.date;
          this.startHorario = false;
          this.dialogsProvider.dialogInfo(this.translate.instant('START-SCHEDULE'),this.translate.instant('END-SCHEDULE'),'alertInfo');
        }else{
          
          if(isBefore(this.date, this.horario.start) || isEqual(this.date, this.horario.start)){
            this.dialogsProvider.dialogInfo('Error',this.translate.instant('SCHEDULE-OVERLAP'),'alertDanger');
            return;
          }

          this.horario.end = this.date;
          let minutes = differenceInMinutes(this.horario.end, this.horario.start);
          this.horario.meta.minutes = minutes;
          this.horario.title = `${this.helper.formatMinutes(minutes)} ${this.translate.instant('WORKED')}`;
          
          if(this.checkSchedulesOverlap(this.horario, this.events)){
            this.dialogsProvider.dialogInfo('Error',this.translate.instant('SCHEDULE-OVERLAP'),'alertDanger');
            this.startHorario = true;
            return;
          }

          this.database.addHorario(this.horario).then((horario)=>{
            
            this.dialogsProvider.dialogInfo(this.translate.instant('SAVED'),this.translate.instant('ADD-SCHEDULE'),'alertInfo');
            this.startHorario = true;
            this.getHorarios();

          }).catch(e => console.log(e));
          
        }

      }else{ this.startHorario = true }

    });
   
  }
  
  beforeViewRender(event): void {
    
    let totalminutes = 0;

    event.period.events.forEach( evt => {
      totalminutes= totalminutes + evt.meta.minutes;
    });

    // print hours worked on panel information
    this.hoursWorked = `${this.helper.convertMinutesToHours(totalminutes)} ${this.translate.instant('APP-TITLE')}`;
    
    //view month render...
    if( this.view == 'month' ){
      event.body.forEach( day => {
        let minutes:number=0;
        day.events.forEach(event=>{
          minutes = minutes+event.meta.minutes;
        })
        
        day.badgeTotal = this.helper.convertMinutesToHours(minutes);
        
          let samedata:any = this.dayTypesStored.filter((data) => day.date.toDateString() === data.date);
  
          if(samedata.length){
                       
            let dTypeObj = JSON.parse(samedata[0].daytype);
            day.cssClass = dTypeObj.value;
          } 
       
      });
    }

    // view day render....
    if( this.view =='day' ){
      // button typeday on view day
      let daytypedata:any = this.dayTypesStored.filter((data)=> isSameDay(this.viewDate.toDateString(), data.date));
      this.propsButtonDay = daytypedata.length > 0 ? JSON.parse(daytypedata[0].daytype) : this.helper.DayTypes[0];
      // detect changes
      this.changeref.detectChanges();
    }
    this.content.scrollToTop();
    
  }
     
  // comprueba si dos eventos se solapan
  checkSchedulesOverlap(date:CalendarEvent,events:CalendarEvent[]):boolean{
   
    //get events today
    let eventstoday = events.filter(iEvent => isSameDay(iEvent.start, date.start) );
  
    // get event today isWithinRange new period
    let today = eventstoday.filter(iEvent => isWithinRange(date.start,iEvent.start,iEvent.end) || isWithinRange(date.end,iEvent.start,iEvent.end))
    
    // if iswithingrange return bolean
    return (today.length > 0);
  }

  //Add day type
  showMenuFreeDays(){
      
    let pop = this.popoverCtrl.create(SelectDayTypeComponent,{ date:this.viewDate ,dayType:this.propsButtonDay });
    
    pop.onDidDismiss((data) =>{
      if(data != null){
                          
        this.database.addFreeDay(this.viewDate, data).then((freeDay)=>{
          this.propsButtonDay = data;
          this.refresh.next();
          this.dialogsProvider.dialogInfo('Ok',this.translate.instant('DAYTYPE-CHANGED'),'alertInfo');
          this.getFreeDays();
        }).catch(e => this.dialogsProvider.dialogInfo('Error',e.message,'alertDanger',3000) );
      };
    }); 
    pop.present();
  }

  cleanHorario():CalendarEvent{
    return this.horario={
      title:"",
      start:new Date(),
      end:new Date(),
      color: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
      },
      meta:{
        id:0,
        minutes:0
      }
    }
  }

  deleteFreeDays(){
    this.dialogsProvider.dialogConfirm('Eliminar festivos',this.translate.instant('DELETE-FREE-DAYS'),'alertDanger',true)
        .then((ret)=>{
          if(ret){
            this.database.removeFreeDays();
            this.getFreeDays();
          }
        }) 
      
  }

  changeView(view:string):void{
    this.view = view;
    this.changeref.detectChanges();
  }
  
}
