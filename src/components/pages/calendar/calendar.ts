import { Component, ChangeDetectionStrategy,ChangeDetectorRef,ViewChild, Input } from '@angular/core';
import { NavController,ActionSheetController,Events,LoadingController,PopoverController,Content } from 'ionic-angular';
import { CalendarEvent  } from 'angular-calendar';
import { Subject } from 'rxjs';
import { DayTypes ,formatMinutes, convertMinutesToHours, getFormatDate,getFormatHour,getPeriodMsg} from '../../../app/helpers';
import { isBefore, isEqual, isValid, isWithinRange, isSameDay, differenceInMinutes } from 'date-fns'
import { ModalController ,Modal} from 'ionic-angular';
import { FirebaseService } from '../../../providers/firebase/firebase.service';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { ChartsPage } from '../pages.index';
import { SelectDayTypeComponent } from '../../modal/select-daytype/select-daytype';
import { DayType } from '../../../interfaces/interfaces';

@Component({
  selector: 'page-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendar.html'
})
export class CalendarPage {

  @ViewChild(Content) content: Content;

  chartsPage:any = ChartsPage;
  
  propsButtonDay:DayType; 

  dayTypesStored:any[]=[];
        
  events:CalendarEvent[]=[];

  view:string = 'month';

  viewDate:Date;
  
  dataBaseHourHandSubscribe:any;

  dataBaseDayTypesSubscribe:any;

  hoursWorked:string = "00:00";

  date:Date;
  
  startHorario:boolean = true;
 
  horario:CalendarEvent={
    title:"",
    start:new Date(),
    end:new Date(),
    color: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    meta:{
      id:'',
      minutes:0
    }
          
  }

  refresh: Subject<any> = new Subject();
  
  constructor(public navCtrl: NavController ,
    private loadingCtrl:LoadingController ,
    public event:Events, 
    private modal: ModalController,
    private popoverCtrl:PopoverController,
    private actSheet:ActionSheetController, 
    private dialogsProvider: DialogsProvider, 
    private firebaseService:FirebaseService,
    private changeref:ChangeDetectorRef) {
      this.date = new Date();
      this.propsButtonDay = DayTypes[0];
      this.viewDate = new Date();
      
  }

  ionViewWillEnter() {
    // get events with firebase
    this.dataBaseHourHandSubscribe = this.firebaseService.getHorarios().snapshotChanges().subscribe(item => {
     let loading = this.loadingCtrl.create();
     loading.present();
      this.events = [];
      item.forEach(element => {
        let x = element.payload.toJSON();
        x["start"] = new Date( x["start"] );
        x["end"] = new Date( x["end"] ); 
        x["actions"] = [];
        this.events.push( x as CalendarEvent );
      });  
      this.refresh.next();
      loading.dismiss();
    }); 
   

    this.dataBaseDayTypesSubscribe = this.firebaseService.getDayTypes().snapshotChanges().subscribe(item=>{
      this.dayTypesStored = [];
      item.forEach(element =>{
        this.dayTypesStored.push({date:element.key,daytype:element.payload.val()})
      });
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
      title: '¿Que hacemos con el horario?',
      enableBackdropDismiss:true,
      cssClass:'act-sheet',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'ios-trash',
          handler: () => {
            this.dialogsProvider.dialogConfirm(
              'Eliminar Horario?','¿Seguro quieres eliminar este horario?','alertDanger').then((ret)=>{
                  if(ret){
                    this.firebaseService.deleteHorario(event);
                   }
                }).catch(()=> this.dialogsProvider.dialogInfo('Error','Ocurrio un error al eliminar el horario','alertDanger',3000) );
          }
        },
        {
          text: 'Editar',
          icon: 'md-create',
          handler: () => {
            let modalEdit:Modal = this.modal.create('ModalEditPage',{date:this.viewDate, event:event, id:event.meta.id});
            modalEdit.present();
          }
        },
        {
          text: 'Cancelar',
          icon: 'md-close',
          role: 'cancel',
          handler: () => {
            console.log('Archive clicked');
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
    let periodMsg = getPeriodMsg(this.startHorario);
    let dateModal = getFormatDate(this.date);
    let hourModal = getFormatHour(this.date,this.startHorario);

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
          this.dialogsProvider.dialogInfo('Error','El horario no es valido','alertDanger');
          return;
        }

        if(this.startHorario){
          this.horario.start = this.date;
          this.startHorario = false;
        }else{
          
          if(isBefore(this.date,this.horario.start) || isEqual(this.date,this.horario.start)){
            this.dialogsProvider.dialogInfo('Error','El fin del horario no puede ser igual o antes del inicio de horario','alertDanger');
            return;
          }

          this.horario.end = this.date;
          let minutes = differenceInMinutes(this.horario.end,this.horario.start);
          this.horario.meta.minutes = minutes;
          this.horario.title = `${formatMinutes(minutes)} trabajados`;
          
          if(this.checkSchedulesOverlap(this.horario, this.events)){
            this.dialogsProvider.dialogInfo('Error','Los horarios no se pueden solapar','alertDanger');
            this.startHorario = true;
            return;
          }

          this.firebaseService.addHorario(this.horario).then((ret)=>{
            this.refresh.next();
            this.dialogsProvider.dialogInfo('Guardado','Horario añadido','alertInfo');
            this.startHorario = true;
          }).catch(erro=>{
            this.dialogsProvider.dialogInfo('Error al crear horario',erro,'alertDanger');
          });
          
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
    this.hoursWorked = `${convertMinutesToHours(totalminutes)} horas trabajadas`;
    
    //view month render...
    if( this.view == 'month' ){
      event.body.forEach( day => {
        let minutes:number=0;
        day.events.forEach(event=>{
          minutes = minutes+event.meta.minutes;
        })
        
        day.badgeTotal = convertMinutesToHours(minutes);
        
          let samedata:any = this.dayTypesStored.filter((data) => day.date.toDateString() === data.date);
  
          if(samedata.length){
             day.cssClass = samedata[0].daytype.value
          } 
       
      });
    }
    // view day render....
    if( this.view =='day' ){
      // button typeday on view day
      let daytypedata:any = this.dayTypesStored.filter((data)=> isSameDay(this.viewDate.toDateString(), data.date));
      this.propsButtonDay = daytypedata.length > 0 ? daytypedata[0].daytype : DayTypes[0];
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
          this.firebaseService.addDayType(this.viewDate,data).then(()=>{
            this.propsButtonDay = data;
            this.refresh.next();
            this.dialogsProvider.dialogInfo('Ok','Tipo de dia cambiado','alertInfo');
          }).catch((err)=>{this.dialogsProvider.dialogInfo('Error',err,'alertDanger',3000)});
      };
    }); 

    pop.present();
  }

  deleteFreeDays(){
    this.dialogsProvider.dialogConfirm('Eliminar festivos','Se eliminaran todos los dias marcados como fiesta o vacaciones de este mes, ¿Estas de acuerdo?','alertDanger',true)
        .then((ret)=>{
          if(ret){
            this.firebaseService.getDayTypes().remove();
          }
        })
  }

  changeView(view:string):void{
    console.log('call calendar page',view);
    
    this.view = view;
    this.changeref.detectChanges();
  }

  ionViewDidLeave(){
    this.dataBaseHourHandSubscribe.unsubscribe();
    this.dataBaseDayTypesSubscribe.unsubscribe();
  }

}
