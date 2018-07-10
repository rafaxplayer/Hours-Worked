import { Component, ChangeDetectionStrategy} from '@angular/core';
import { IonicPage,NavParams,ViewController,ModalController,Modal } from 'ionic-angular';
import { CalendarEvent} from 'angular-calendar';
import { DialogsProvider } from '../../../providers/dialogs/dialogs.service';
import { formatMinutes, getFormatDate,getFormatHour,getPeriodMsg} from '../../../app/helpers';
import { isValid,isBefore,isEqual, differenceInMinutes } from 'date-fns'
import { Subject } from 'rxjs';
import { FirebaseService } from '../../../providers/firebase/firebase.service';



@IonicPage()
@Component({
  selector: 'page-modal-edit',
  templateUrl: 'modal-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalEditPage {

  events:CalendarEvent[]=[];
  event:CalendarEvent;
  viewDate: Date = new Date();
  date:Date;
  startPeriod:boolean = true;

  refresh: Subject<any> = new Subject();
  
  constructor(public viewCtrl: ViewController, 
    public navParams: NavParams,
    private dialogsProvider:DialogsProvider,
    private modalCtrl:ModalController,
    private firebaseService:FirebaseService) {

    this.viewDate = this.navParams.get('date');
    this.event = this.navParams.get('event');
    let oldEvent = Object.assign({},this.event);
    oldEvent.color = { primary: '#ad2121', secondary: '#FAE3E3' };
    this.events.push(oldEvent);
       
    
  }

  
  hour_clicked(event){
    this.date = new Date(event.date);
    this.openModalDate();
  }

  closeModal(){
    this.viewCtrl.dismiss({isUpdate:false});
  }

  openModalDate(){

    let periodMsg = getPeriodMsg(this.startPeriod);
    let dateModal = getFormatDate(this.date);
    let hourModal = getFormatHour(this.date,this.startPeriod);

    let dataModal = {
      periodtext:periodMsg,
      date:dateModal,
      hour:hourModal
    }

    let modalDate:Modal = this.modalCtrl.create('ModalDatePage',{ data:dataModal },{enableBackdropDismiss:false});
    modalDate.present();
    modalDate.onDidDismiss((data)=>{
      
      if(data.isValid){

        if(!isValid(this.date)){
          this.dialogsProvider.dialogInfo('Error','El horario no es valido','alertDanger');
          return;
        }

        if(this.startPeriod){
          this.event.start = this.date;
          this.startPeriod = false;
        }else{

          if(isBefore(this.date,this.event.start) || isEqual(this.date,this.event.start)){
            this.dialogsProvider.dialogInfo('Error','El fin del horario no puede ser igual o antes del inicio de horario','alertDanger');
            return;
          }

          this.event.end = this.date;
          let minutes = differenceInMinutes(this.event.end,this.event.start);
          this.event.meta.minutes = minutes;
          this.event.title = `${formatMinutes(minutes)} trabajados`;
          console.log('fininsh event',this.event);
          
          this.events.push(this.event);  
          this.refresh.next();
          this.startPeriod=true;
          this.dialogsProvider.dialogConfirm('Ok','Horario creado,¿Quieres guardarlo asi?','alertInfo',false)
              .then((ret)=>{
                if(ret){
                  this.firebaseService.updateHorario(this.event).then(()=>{
                    this.viewCtrl.dismiss({ isUpdate:true });
                  });
                  
                }else{
                  this.events.pop();
                  this.refresh.next();
                }

              }).catch((err)=>this.dialogsProvider.dialogInfo('Error',err,'alertDanger'));
         
        } 

      }else{ this.startPeriod = true }

    });
   
  }
}
