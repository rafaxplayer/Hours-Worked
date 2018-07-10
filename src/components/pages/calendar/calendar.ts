import { Component, ChangeDetectionStrategy} from '@angular/core';
import { NavController,ActionSheetController,Events,LoadingController,PopoverController } from 'ionic-angular';
import { CalendarEvent,CalendarMonthViewDay} from 'angular-calendar';
import { Subject } from 'rxjs';
import { formatMinutes, convertMinutesToHours, getFormatDate,getFormatHour,getPeriodMsg} from '../../../app/helpers';
import { isBefore, isEqual, isValid, isWithinRange, isSameDay, isSameWeek, isSameMonth, differenceInMinutes } from 'date-fns'
import { ModalController ,Modal} from 'ionic-angular';
import { FirebaseService } from '../../../providers/firebase/firebase.service';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { ChartsComponent } from '../charts/charts';
import { SelectDayTypeComponent } from '../../modal/select-daytype/select-daytype';
import { DayType } from '../../../app/helpers';


@Component({
  selector: 'page-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendar.html'
})
export class CalendarPage {
    
  propsButtonDay:DayType = { label:'Trabajado' ,value:'worked' ,color:'primary' };

  events:CalendarEvent[]=[];

  view: string = 'month';

  viewDate: Date = new Date();
  
  dataBaseSubscribe:any;

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
    private firebaseService:FirebaseService) {
      this.date = new Date();
  }

  ionViewWillEnter() {
    // get events with firebase
    this.dataBaseSubscribe=this.firebaseService.getHorarios().snapshotChanges().subscribe(item => {
     let loading=this.loadingCtrl.create();
     loading.present();
      this.events = [];
      item.forEach(element => {
        let x = element.payload.toJSON();
        x["start"] = new Date(x["start"]);
        x["end"] = new Date(x["end"]); 
        x["actions"] = [];
        this.events.push(x as CalendarEvent);
        this.hoursWorked = this.horasTrabajadas('month');
      });  
      this.refresh.next();
      loading.dismiss();
    }); 

    this.event.subscribe('user',(user)=>{
      if(!user){this.dataBaseSubscribe.unsubscribe()}
    });
   
  }

  // day click on month.... show day view
  dayClick({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    
    if(this.view == 'month'){
      this.viewDate = date;
      this.view = 'day';
      this.hoursWorked = this.horasTrabajadas('day');
    } 
    
  }

  weekDayClick(event){
    this.viewDate = event.date;
    this.view = 'day';
    this.hoursWorked = this.horasTrabajadas('day');
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
                }).catch(()=> alert('Ocurrio un error') );
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
         
          this.horasTrabajadas(this.view);
        }

      }else{ this.startHorario = true }

    });
   
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    this.viewDate=new Date();
    body.forEach(day => {
      let minutes:number=0;
      day.events.forEach(event=>{
        minutes=minutes+event.meta.minutes;
      })

      day.badgeTotal = convertMinutesToHours(minutes);
     
    });
  }
 
  // helpers
  horasTrabajadas(view:string):string{
    let ret="";
    let horariosFilter = this.getEventsWithView(view);
    if(horariosFilter){
      let minutes = 0;
      horariosFilter.forEach(element => {
        
        minutes = minutes + element.meta.minutes;
        
      });
      ret = formatMinutes(minutes) + " Horas Trabajadas";
    }else{
      ret='No hay horas';
    }
    return ret;
  }

  getEventsWithView(view:string):CalendarEvent[]{

    let eventsFilter:CalendarEvent[];

    switch(view){
      case "day":
        eventsFilter = this.events.filter(iEvent => isSameDay(iEvent.start,this.viewDate));
      break;
      case "month":
        eventsFilter = this.events.filter(iEvent => isSameMonth(iEvent.start,this.viewDate));
      break;
      case "week":
        eventsFilter = this.events.filter(iEvent => isSameWeek(iEvent.start,this.viewDate));
      break;
      default:
        eventsFilter = this.events.filter(iEvent => isSameMonth(iEvent.start,this.viewDate));
      
    }
    
    return eventsFilter;
      
  }

  checkSchedulesOverlap(date:CalendarEvent,events:CalendarEvent[]):boolean{
   
    //get events today
    let eventstoday = events.filter(iEvent => isSameDay(iEvent.start, date.start) );
  
    // get event today isWithinRange new period
    let today = eventstoday.filter(iEvent => isWithinRange(date.start,iEvent.start,iEvent.end) || isWithinRange(date.end,iEvent.start,iEvent.end))
    
    // if iswithingrange return bolean
    return (today.length > 0);
  }

  showView(view:string){
    this.view = view;
  }

  showMenuFreeDays(){
    let pop = this.popoverCtrl.create(SelectDayTypeComponent,{ date:this.viewDate });

    pop.onDidDismiss((data:DayType) =>{

      if(data != null){
        this.propsButtonDay = data;
       
        console.log('ondismiss',this.propsButtonDay);
        
      };
    }); 

    pop.present();
  }

  goCharts(){
    this.navCtrl.push(ChartsComponent);
  }

  goBack(){
    this.view = 'month';
  }

  ionViewDidLeave(){
    this.dataBaseSubscribe.unsubscribe();
  }
 
}
