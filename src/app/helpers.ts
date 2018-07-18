import { DayType } from '../interfaces/interfaces';

export function addZeros(time:any):any{
    
    if (time < 10) {
        time = "0" + time;
    }
    return time;

}

export function formatMinutes(m:number):string{

    var minutes = m%60
    var hours = (m - minutes) / 60
    return addZeros(hours) + ":" + addZeros(minutes);
  

}

export function convertMinutesToHours(m:number):number{

    var minutes = m % 60
    var hours =  hours = (m - minutes) / 60
    return parseFloat(hours + '.'+ minutes);

}

 // formating date
 export function getPeriodMsg(startPeriod:boolean):string{
    if(startPeriod){
      return 'Inicio del trabajo';
    }else{
      return 'Final del trabajo';
    }
  }

  export function getFormatDate(date):string{
    return `Dia ${date.getDate()} del ${date.getMonth()} ${date.getFullYear()}`;

  }

  export function getFormatHour(date:Date,startPeriod:boolean):string{

   let outputh:string;

    if(startPeriod){
      outputh= "Empieza ";
    }else{
      outputh= "Acaba ";
    }
    return `${outputh} ${addZeros(date.getHours())}:${addZeros(date.getMinutes())} Horas`;
  }

export const DayTypes:DayType[] = [
  {label:'Trabajado',value:'worked',color:'whiteday'},
  {label:'Fiesta',value:'free',color:'greenday'},
  {label:'Vacaciones',value:'holidays',color:'blueday'}]