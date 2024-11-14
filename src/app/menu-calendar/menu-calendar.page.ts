import { Component, OnInit } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';

@Component({
  selector: 'app-menu-calendar',
  templateUrl: './menu-calendar.page.html',
  styleUrls: ['./menu-calendar.page.scss'],
})
export class MenuCalendarPage implements OnInit {

  fromDate = new Date(2000, 0, 1);  // 1 de enero de 2000
  toDate = new Date(2100, 11, 31);  // 31 de diciembre de 2100
  date: string;
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  dateRange: { from: string; to: string; };
  calendarOptions: CalendarComponentOptions = {    
    pickMode: 'multi',
    defaultTitle: '',
    from: this.fromDate,
    weekStart: 1,
    weekdays: ['Dom','Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    monthPickerFormat: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], // Configuración de los meses
    daysConfig: [
      { date: new Date(2024, 10, 11), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 13), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 14), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 18), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 19), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 20), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 21), subTitle: '21:00', cssClass: 'ensayo-general-day' },
      { date: new Date(2024, 10, 23), subTitle: '18:00', cssClass: 'actuacion-day' },
      { date: new Date(2024, 10, 25), subTitle: 'Varios', cssClass: 'multiple-events-day' },
      { date: new Date(2024, 10, 26), subTitle: '21:00', cssClass: 'ensayo-primeras-cornetas-day' },
      { date: new Date(2024, 10, 27), subTitle: '21:00', cssClass: 'ensayo-armonia-day' },
      { date: new Date(2024, 10, 28), subTitle: '21:00', cssClass: 'ensayo-general-day' },

      /*{ date: new Date(2024, 10, 20), subTitle: '21:00', cssClass: 'ensayo-extraordinario-day' },
      { date: new Date(2024, 10, 25), subTitle: '21:00', cssClass: 'ensayo-primeras-cornetas-day' },
      { date: new Date(2024, 10, 28), subTitle: '21:00', cssClass: 'ensayo-armonia-day' },
      { date: new Date(2024, 10, 30), subTitle: '20:00', cssClass: 'actuacion-day' },
      { date: new Date(2024, 10, 22), subTitle: 'Varios', cssClass: 'multiple-events-day' },*/
      // Añade más días según sea necesario
    ]
  };
  titulodeprueba = 'Calendario de ensayos';

  constructor() { }

  ngOnInit() {
  }

  onDateChange(event: any) {
    console.log("Fecha seleccionada:", event);
    // Aquí puedes manejar la selección de fecha
  }

}
