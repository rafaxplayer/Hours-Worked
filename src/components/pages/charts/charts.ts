import { Component ,ChangeDetectionStrategy, ViewChildren, QueryList} from '@angular/core';
import { NavController,NavParams } from 'ionic-angular';
import { isWithinRange ,isSameWeek } from 'date-fns';
import { DatabaseProvider } from '../../../providers/database/database';
import { CalendarEvent } from 'calendar-utils';
import { BaseChartDirective }  from 'ng2-charts/ng2-charts';
import { ChartType } from '../../../interfaces/interfaces';
import { TranslateService,LangChangeEvent } from '@ngx-translate/core';
import { HelpersProvider } from '../../../providers/helpers/helpers';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
  selector: 'charts-page',
  templateUrl: 'charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsPage {

  @ViewChildren(BaseChartDirective) chartList: QueryList<BaseChartDirective>;

  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

   chartType:string;
  
   barChartLegend:boolean = true;

   barChartLabelsYear:string[] = this.translateService.instant('MONTHS');

   barChartLabelsWeek:string[] = this.translateService.instant('DAYSWEEK');

   chartTypes:ChartType[];

  translateObserver:Subscription;
   
  barChartDataYear:Array<any> = [
    {data:[], label:this.translateService.instant('HOURS_THIS_YEAR')},
    {data:[], label:this.translateService.instant('HOURS_PREV_YEAR')}
  ];
  
  barChartDataWeek:Array<any> = [
    {data:[], label:this.translateService.instant('HOURS_THIS_WEEK')},
    {data:[], label:this.translateService.instant('HOURS_PREV_WEEK')}
  ];

  date:Date;
  
  horarios:CalendarEvent[]=[];
    
  chartTypeSelected:ChartType;

  loadingShow:boolean;

  constructor(private database:DatabaseProvider ,
              public navCtrl:NavController,
              public navParams:NavParams,
              private translateService:TranslateService,
              private helpers:HelpersProvider) {
    
    this.chartTypes = [{id:'bar',value:'Bars'},{id:'line',value:'Line'},{id:'pie',value:'Pie'},{id:'radar',value:'Radar'},{id:'doughnut',value:'Doughnut'}]

    this.chartTypeSelected = this.chartTypes[0];

    this.chartType= this.chartTypeSelected.id;

    if(navParams.data){
      this.date = navParams.data.date;
    }
      
    this.translateObserver = this.translateService.onLangChange.subscribe((event :LangChangeEvent)=>{
      
      this.barChartLabelsYear = event.translations.MONTHS;
      this.barChartLabelsWeek = event.translations.DAYSWEEK;

      this.barChartDataYear[0].label= event.translations.HOURS_THIS_YEAR;
      this.barChartDataYear[0].label= event.translations.HOURS_PREV_YEAR;

      this.barChartDataWeek[0].label= event.translations.HOURS_THIS_WEEK;
      this.barChartDataWeek[0].label= event.translations.HOURS_PREV_WEEK;
     }) 

  }

  ionViewWillEnter(){
    this.getHorarios();
  }

  getHorarios(){
    this.database.getHorarios().then((data)=>{
      
      this.horarios = [];
      data.forEach((hor)=>{
        let x = JSON.parse(hor.horario)
        let horario = Object.assign({},x);
        horario.start= new Date( x.start );
        horario.end = new Date( x.end );
        horario.meta.id = hor.id;
        
        this.horarios.push(horario as CalendarEvent);

      })
      
      this.updateChartYearHours( this.barChartDataYear );
      this.updateChartWeekHours( this.barChartDataWeek );
      this.updateCharts();
      
    })
  }

  updateCharts(){
    this.chartList.forEach((child)=> child.chart.update() );
  }

  updateChartYearHours(dataChartYear:Array<any>){

    for( let i = 0; i < 12; i++ ){ 
      dataChartYear[0].data.push(this.getMonthHours(this.horarios, i, this.date.getFullYear())); 
      dataChartYear[1].data.push(this.getMonthHours(this.horarios, i, this.date.getFullYear()-1));
    } 

  }

  updateChartWeekHours(dataChartWeek:Array<any>){

    for( let i=0; i < 7; i++){ 
      dataChartWeek[0].data.push(this.getDayHoursofThisWeek(this.horarios, i, this.date.getFullYear(), true)); 
      dataChartWeek[1].data.push(this.getDayHoursofThisWeek(this.horarios, i, this.date.getFullYear(), false)); 
    }
  
  }
 
  getMonthHours(data:CalendarEvent[],month:number,year:number):number{

    let minutes = 0;
    let thisMonth = data.filter(item => {
      const itemDate= new Date(item.start);
      return itemDate.getMonth() == month && itemDate.getFullYear() == year;
    });
    
    if(thisMonth){
      thisMonth.map(data=>{
        minutes = minutes + data.meta.minutes;
      })
    }
    return this.helpers.convertMinutesToHours(minutes);

  }


  getDayHoursofThisWeek(data:CalendarEvent[],dayofWeek:number,year:number,isThis:boolean){

    let minutes = 0;
    let daysOfThisWeek = data.filter( item => {

      const itemDate = new Date( item.start );
      let range = this.getRangePreviousWeek( this.date );
  
      if(isThis){
  
          return  itemDate.getDay() == dayofWeek && isSameWeek( itemDate, this.date  );
  
      }else{
         
          return itemDate.getDay() == dayofWeek && isWithinRange( itemDate , range.first, range.last ) && itemDate.getFullYear() == year;
        
      }
      
    });
    
    if(daysOfThisWeek){
      daysOfThisWeek.map( data =>{
        minutes = minutes + data.meta.minutes;
      })
    }
    return this.helpers.convertMinutesToHours(minutes);
  }
 
  getRangePreviousWeek(date:Date):any{
    let prevDatesWeek={
      first:0,
      last:0
    };
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    let dummy =  date.getDay();
    
    dummy = dummy + 6;
    
    prevDatesWeek.first = date.setDate(date.getDate() - dummy );
    
    prevDatesWeek.last = date.setDate(date.getDate() + 6);
    
    return prevDatesWeek;

  }

  chartChange(event){

    if(event.target.value == 'Char type'){
      return;
    }
    this.chartType = event.target.value
    
  }

  ionViewWillUnload(){
    this.translateObserver.unsubscribe();
  }
}
