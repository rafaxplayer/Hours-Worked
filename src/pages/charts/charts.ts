import { Component, ChangeDetectionStrategy, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { isWithinRange, isSameWeek, isSameYear, isSameMonth, subMonths, subYears } from 'date-fns';
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

  chartType: string;

  barChartLegend: boolean = true;

  barChartLabelsYear: string[] = this.translateService.instant('MONTHS');

  barChartLabelsMonth: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',];

  barChartLabelsWeek: string[] = this.translateService.instant('DAYSWEEK');

  chartTypes: ChartType[];

  translateObserver: Subscription;

  barChartDataYear: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_YEAR') },
    { data: [], label: this.translateService.instant('HOURS_PREV_YEAR') }
  ];

  allHoursYear: number;

  barChartDataMonth: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_MONTH') },
    { data: [], label: this.translateService.instant('HOURS_PREV_MONTH') }
  ];

  allHoursMonth: number;

  barChartDataWeek: Array<any> = [
    { data: [], label: this.translateService.instant('HOURS_THIS_WEEK') },
    { data: [], label: this.translateService.instant('HOURS_PREV_WEEK') }
  ];

  allHoursWeek: number;

  date: Date;

  horarios: CalendarEvent[] = [];

  chartTypeSelected: ChartType;

  loadingShow: boolean;

  constructor(private database: DatabaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private translateService: TranslateService,
    private helpers: HelpersProvider,
    private changeRef: ChangeDetectorRef) {

    this.chartTypes = [{ id: 'bar', value: 'Bars' }, { id: 'line', value: 'Line' }, { id: 'pie', value: 'Pie' }, { id: 'radar', value: 'Radar' }, { id: 'doughnut', value: 'Doughnut' }]

    this.chartTypeSelected = this.chartTypes[0];

    this.chartType = this.chartTypeSelected.id;

    if (navParams.data) {
      this.date = navParams.data.date;
    }


    this.translateObserver = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {

      this.barChartLabelsYear = event.translations.MONTHS;
      this.barChartLabelsWeek = event.translations.DAYSWEEK;

      this.barChartDataYear[0].label = event.translations.HOURS_THIS_YEAR;
      this.barChartDataYear[1].label = event.translations.HOURS_PREV_YEAR;

      this.barChartDataMonth[0].label = event.translations.HOURS_THIS_MONTH;
      this.barChartDataMonth[1].label = event.translations.HOURS_PREV_MONTH;

      this.barChartDataWeek[0].label = event.translations.HOURS_THIS_WEEK;
      this.barChartDataWeek[1].label = event.translations.HOURS_PREV_WEEK;

      changeRef.detectChanges();
    });

    this.allHoursMonth = 0;
    this.allHoursWeek = 0;
    this.allHoursYear = 0;

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

  updateChartYearHours(dataChartYear: Array<any>, date: Date) {

    for (let i = 0; i < 12; i++) {
      dataChartYear[0].data.push(this.getMonthHours(this.horarios, i, date));
      dataChartYear[1].data.push(this.getMonthHours(this.horarios, i, subYears(date, 1)));
    }
    this.allHoursYear = this.countAllHours(dataChartYear[0].data);
  }

  updateChartMonthHours(dataChartMonth: Array<any>, date: Date) {

    let datePreviousMonth = subMonths(date, 1);

    for (let i = 1; i <= this.barChartLabelsMonth.length; i++) {
      dataChartMonth[0].data.push(this.getDayHours(this.horarios, i, date));
      dataChartMonth[1].data.push(this.getDayHours(this.horarios, i, datePreviousMonth));
    }

    this.allHoursMonth = this.countAllHours(dataChartMonth[0].data);

  }

  updateChartWeekHours(dataChartWeek: Array<any>, date: Date) {

    for (let i = 0; i < 7; i++) {
      dataChartWeek[0].data.push(this.getDayHoursofThisWeek(this.horarios, i, date, true));
      dataChartWeek[1].data.push(this.getDayHoursofThisWeek(this.horarios, i, date, false));
    }

    this.allHoursWeek = this.countAllHours(dataChartWeek[0].data);

  }

  getMonthHours(data: CalendarEvent[], month: number, date: Date): number {

    let thisMonth = data.filter(item => {
      const itemDate = new Date(item.start);
      return itemDate.getMonth() == month && isSameYear(itemDate, date);
    });

    return this.dataToHours(thisMonth);

  }


  getDayHoursofThisWeek(data: CalendarEvent[], dayofWeek: number, date: Date, isThis: boolean) {

    let daysOfThisWeek = data.filter(item => {

      const itemDate = new Date(item.start);
      let range = this.getRangePreviousWeek(this.date);

      if (isThis) {

        return itemDate.getDay() == dayofWeek && isSameWeek(itemDate, this.date);

      } else {

        return itemDate.getDay() == dayofWeek && isWithinRange(itemDate, range.first, range.last) && isSameYear(itemDate, date);

      }

    });

    return this.dataToHours(daysOfThisWeek);
  }

  // get hours worked with day
  getDayHours(data: CalendarEvent[], day: number, date: Date): number {

    let daysMonth = data.filter(item => {
      let itemDate = new Date(item.start);
      return (isSameMonth(itemDate, date) && isSameYear(itemDate, date) && itemDate.getDate() == day);
    });

    return this.dataToHours(daysMonth);

  }


  dataToHours(data: any[]): number {
    let minutes = 0;
    if (data.length > 0) {
      data.map(data => {
        minutes = minutes + data.meta.minutes;
      })
    }
    return this.helpers.convertMinutesToHours(minutes);
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

  countAllHours(dataChar: any[]): number {
    let numHours = 0;
    dataChar.forEach(data => {
      numHours = numHours + data
    });

    return numHours;
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
