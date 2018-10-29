import { Storage } from '@ionic/storage';
import { Component, ChangeDetectionStrategy, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { isWithinRange, isSameWeek, isSameYear, isSameMonth, subMonths, subYears, getDaysInMonth, isSameDay } from 'date-fns';
import { DatabaseProvider } from '../../providers/database/database';
import { CalendarEvent } from 'calendar-utils';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import { ChartType } from '../../interfaces/interfaces';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { Subscription } from 'rxjs';

@Component({
  selector: 'charts-page',
  templateUrl: 'charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsPage {

  @ViewChildren(BaseChartDirective) chartList: QueryList<BaseChartDirective>;

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  overtimeHours: number;

  chartType: string;

  barChartLegend: boolean = true;

  barChartLabelsYear: string[] = this.translateService.instant('MONTHS');

  barChartLabelsMonth: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',];

  barChartLabelsWeek: string[] = this.translateService.instant('DAYSWEEK');

  chartTypes: ChartType[];

  translateObserver: Subscription;

  barChartDataWeek: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_WEEK') },
    { data: [], label: this.translateService.instant('HOURS_PREV_WEEK') },
    { data: [], label: this.translateService.instant('OVERTIME_HOURS') }
  ];

  allHoursWeek: string;

  allOverTimeHoursWeek: string;

  barChartDataMonth: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_MONTH') },
    { data: [], label: this.translateService.instant('HOURS_PREV_MONTH') },
    { data: [], label: this.translateService.instant('OVERTIME_HOURS') }
  ];

  allHoursMonth: string;

  allOverTimeHoursMonth: string;

  barChartDataYear: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_YEAR') },
    { data: [], label: this.translateService.instant('HOURS_PREV_YEAR') },
    { data: [], label: this.translateService.instant('OVERTIME_HOURS') }
  ];

  allHoursYear: string;

  allOverTimeHoursYear: string;

  date: Date;

  horarios: CalendarEvent[] = [];

  chartTypeSelected: ChartType;

  loadingShow: boolean;

  constructor(private database: DatabaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private translateService: TranslateService,
    private helpers: HelpersProvider,
    private changeRef: ChangeDetectorRef,
    private simpleStorage: Storage) {

    this.chartTypes = [{ id: 'bar', value: 'Bars' }, { id: 'line', value: 'Line' }, { id: 'pie', value: 'Pie' }, { id: 'radar', value: 'Radar' }, { id: 'doughnut', value: 'Doughnut' }]

    this.chartTypeSelected = this.chartTypes[0];

    this.chartType = this.chartTypeSelected.id;

    if (navParams.data) {
      this.date = navParams.data.date;
    }

    this.simpleStorage.get('hours').then((nHours) => {
      this.overtimeHours = nHours ? Number(nHours) : 0;
    })


    this.translateObserver = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {

      this.barChartLabelsYear = event.translations.MONTHS;
      this.barChartLabelsWeek = event.translations.DAYSWEEK;

      this.barChartDataYear[0].label = event.translations.HOURS_THIS_YEAR;
      this.barChartDataYear[1].label = event.translations.HOURS_PREV_YEAR;
      this.barChartDataYear[2].label = event.translations.OVERTIME_HOURS;

      this.barChartDataMonth[0].label = event.translations.HOURS_THIS_MONTH;
      this.barChartDataMonth[1].label = event.translations.HOURS_PREV_MONTH;
      this.barChartDataMonth[2].label = event.translations.OVERTIME_HOURS;

      this.barChartDataWeek[0].label = event.translations.HOURS_THIS_WEEK;
      this.barChartDataWeek[1].label = event.translations.HOURS_PREV_WEEK;
      this.barChartDataWeek[2].label = event.translations.OVERTIME_HOURS;

      changeRef.detectChanges();
    });

    this.allHoursMonth = '00:00';
    this.allHoursWeek = '00:00';
    this.allHoursYear = '00:00';
    this.allOverTimeHoursMonth = '00:00';
    this.allOverTimeHoursWeek = '00:00';
    this.allOverTimeHoursYear = '00:00';

  }

  ionViewWillEnter() {
    this.getHorarios();
  }

  getHorarios() {
    this.database.getHorarios().then((data) => {

      this.horarios = [];
      data.forEach((hor) => {
        let x = JSON.parse(hor.horario)
        let horario = Object.assign({}, x);
        horario.start = new Date(x.start);
        horario.end = new Date(x.end);
        horario.meta.id = hor.id;

        this.horarios.push(horario as CalendarEvent);

      });

      this.updateChartMonthHours(this.barChartDataMonth, this.date);
      this.updateChartYearHours(this.barChartDataYear, this.date);
      this.updateChartWeekHours(this.barChartDataWeek, this.date);
      this.changeRef.detectChanges();
      this.updateCharts();

    })
  }

  updateCharts() {
    this.chartList.forEach((child) => child.chart.update());
  }

  updateChartWeekHours(dataChartWeek: Array<any>, date: Date) {
    //loop 0,6 day of the week
    let totalMinutesWeek = 0;
    let totalOverMinutsWeek = 0;
    for (let i = 0; i < 7; i++) {
      let minutes = this.getDayMinutesofThisWeek(this.horarios, i, date, true);
      let overminutesDay = this.calcOverTimeMinutesForday(minutes, this.overtimeHours);

      totalMinutesWeek = totalMinutesWeek + minutes;
      totalOverMinutsWeek = totalOverMinutsWeek + overminutesDay;

      dataChartWeek[0].data.push(this.helpers.convertMinutesToHours(minutes));
      //last day
      dataChartWeek[1].data.push(this.helpers.convertMinutesToHours(this.getDayMinutesofThisWeek(this.horarios, i, date, false)));
      dataChartWeek[2].data.push(this.helpers.convertMinutesToHours(overminutesDay));

    }

    this.allHoursWeek = this.helpers.convertMinutesToHours(totalMinutesWeek).toString().replace('.', ':');

    this.allOverTimeHoursWeek = this.helpers.convertMinutesToHours(totalOverMinutsWeek).toString().replace('.', ':');


  }

  updateChartMonthHours(dataChartMonth: Array<any>, date: Date) {

    let datePreviousMonth = subMonths(date, 1);

    let totalOverMinutsMonth = 0;

    for (let i = 1; i <= this.barChartLabelsMonth.length; i++) {

      let minutes = this.getDayMinutes(this.horarios, i, date);
      let overMinutsDay = this.calcOverTimeMinutesForday(this.getDayMinutes(this.horarios, i, date), this.overtimeHours)

      totalOverMinutsMonth = totalOverMinutsMonth + overMinutsDay;

      dataChartMonth[0].data.push(this.helpers.convertMinutesToHours(minutes));
      //last month
      dataChartMonth[1].data.push(this.helpers.convertMinutesToHours(this.getDayMinutes(this.horarios, i, datePreviousMonth)));
      dataChartMonth[2].data.push(this.helpers.convertMinutesToHours(overMinutsDay));
    }

    this.allHoursMonth = this.helpers.convertMinutesToHours(this.getMonthMinutes(this.horarios, date.getMonth(), date)).toString().replace('.', ':');

    this.allOverTimeHoursMonth = this.helpers.convertMinutesToHours(totalOverMinutsMonth).toString().replace('.', ':');
  }

  updateChartYearHours(dataChartYear: Array<any>, date: Date) {

    let totalminutesYear = 0;
    let totalOvertimeOverYear = 0;

    for (let i = 0; i < 12; i++) {

      let minutes = this.getMonthMinutes(this.horarios, i, date);
      let overTimeMinutesforMonth = this.calcOverTimeMinutesForMonth(this.horarios,i, date, this.overtimeHours);
           
      totalminutesYear = totalminutesYear + minutes;
      totalOvertimeOverYear = totalOvertimeOverYear + overTimeMinutesforMonth;

      dataChartYear[0].data.push(this.helpers.convertMinutesToHours(minutes));
      //last month
      dataChartYear[1].data.push(this.helpers.convertMinutesToHours(this.getMonthMinutes(this.horarios, i, subYears(date, 1))));
      dataChartYear[2].data.push(this.helpers.convertMinutesToHours(overTimeMinutesforMonth));
    }

    this.allHoursYear = this.helpers.convertMinutesToHours(totalminutesYear).toString().replace('.', ':');

    this.allOverTimeHoursYear = this.helpers.convertMinutesToHours(totalOvertimeOverYear).toString().replace('.', ':');
  }


  getDayMinutesofThisWeek(data: CalendarEvent[], dayofWeek: number, date: Date, isThis: boolean) {

    let daysOfThisWeek = data.filter(item => {

      const itemDate = new Date(item.start);
      let range = this.getRangePreviousWeek(this.date);

      if (isThis) {

        return itemDate.getDay() == dayofWeek && isSameWeek(itemDate, this.date);

      } else {

        return itemDate.getDay() == dayofWeek && isWithinRange(itemDate, range.first, range.last) && isSameYear(itemDate, date);

      }

    });

    return this.dataToMinutes(daysOfThisWeek);
  }

  getMonthMinutes(data: CalendarEvent[], month: number, date: Date): number {

    let thisMonth = data.filter(item => {
      const itemDate = new Date(item.start);
      return itemDate.getMonth() == month && isSameYear(itemDate, date);
    });

    return this.dataToMinutes(thisMonth);

  }
  // get hours worked with day
  getDayMinutes(data: CalendarEvent[], day: number, date: Date): number {

    let daysMonth = data.filter(item => {
      let itemDate = new Date(item.start);
      return (isSameMonth(itemDate, date) && isSameYear(itemDate, date) && itemDate.getDate() == day);
    });

    return this.dataToMinutes(daysMonth);

  }

  dataToMinutes(data: any[]): number {

    let minutes = 0;

    if (data.length > 0) {
      data.map(data => {
        minutes = minutes + data.meta.minutes;
      })
    }
    return minutes;

  }

  getRangePreviousWeek(date: Date): any {
    let prevDatesWeek = {
      first: 0,
      last: 0
    };
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    let dummy = date.getDay();

    dummy = dummy + 6;

    prevDatesWeek.first = date.setDate(date.getDate() - dummy);

    prevDatesWeek.last = date.setDate(date.getDate() + 6);

    return prevDatesWeek;

  }
  // calacular horas extras del dia
  calcOverTimeMinutesForday(nMinutes: number, baseHours: number) {

    let baseMinutes = baseHours * 60;
    
    if (nMinutes > baseMinutes) {

      return nMinutes - baseMinutes;
    }
    return 0;
  }

  // calacular horas extras del mes
  calcOverTimeMinutesForMonth(data: any[],month: number, date: Date, baseHours: number) {
       
    let thisMonth = data.filter(item => {
      const itemDate = new Date(item.start);
     
      return itemDate.getMonth() == month && isSameYear(itemDate, date);
    });

    return 0;

  }

  chartChange(event) {

    if (event.target.value == 'Char type') {
      return;
    }
    this.chartType = event.target.value

  }

  ionViewWillUnload() {
    this.translateObserver.unsubscribe();
  }
}
