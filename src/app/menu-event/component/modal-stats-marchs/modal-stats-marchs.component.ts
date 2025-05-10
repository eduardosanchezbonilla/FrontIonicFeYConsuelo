import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE, DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { GlobalEventStatsResponse } from 'src/app/models/event/global-event-stats-response';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEvents, GetEventStats, ResetEvent } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { ChartConfiguration, ChartData, ChartOptions, ChartType, Plugin } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CaptureService } from 'src/app/services/capture/capture.service';
import { EventStatResponse } from 'src/app/models/event/event-stats-response';
import { EventStatInfoResponse } from 'src/app/models/event/event-stat-info-response';

// Plugin personalizado para aumentar la altura de la leyenda
const extraLegendSpacingPlugin: Plugin = {
  id: 'extraLegendSpacingPlugin',
  beforeUpdate: (chart) => {
    // Cast del legend a "any" para poder acceder a la propiedad "fit"
    const legend: any = chart.legend;
    if (legend && !legend._extraFit) {
      const originalFit = legend.fit;
      legend.fit = function() {
        originalFit.call(this);
        // Incrementa la altura de la leyenda en 20 píxeles
        this.height += 10;
      };
      legend._extraFit = true;
    }
  }
};

@Component({
  selector: 'app-modal-stats-marchs',
  templateUrl: './modal-stats-marchs.component.html',
  styleUrls: ['./modal-stats-marchs.component.scss'],
})
export class ModalStatsMarchsComponent implements OnInit {

  expandedCard: string | null = null;
  public expandedCards: string[] = [];
  
  public selectedEventType: string = '';
  public excludeSpecialTypes: boolean = true;
  
  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;    

  public eventStatsResponseSubscription: Subscription;
  @Select(EventState.eventStats)
  public eventStatsResponse$: Observable<GlobalEventStatsResponse>;
  public eventStatsResponse: GlobalEventStatsResponse;
  public defaultEventImage: string = DEFAULT_EVENT_IMAGE;   
  public expandedAccordions: string[] = [];

  public initScreen = false;
  public initSearchFinish = false;  
  startDate: string = new Date().toISOString().split('T')[0]; // Hoy
  endDate: string = new Date().toISOString().split('T')[0]; // Hoy
  public profile: string;  

  constructor(
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,        
    private captureService: CaptureService,
    private storage: StorageService,
  ) { }

  async ngOnInit() {    
    this.profile = await this.storage.getItem('profile');   
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })    
    this.selectedEventType = '';
    this.getStatistics();          
  }

  async dismissInitialLoading(){
    if(this.initScreen /*&& this.initSearchFinish*/){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){    
    this.initScreen = true;    
    this.dismissInitialLoading();
  }

  ngOnDestroy() {      
    this.doDestroy();
  }
  
  async ionViewDidLeave(){    
    this.doDestroy();
  }

  private doDestroy(){    
    if (this.eventStatsResponseSubscription) {      
      this.eventStatsResponseSubscription.unsubscribe();  
    }                
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })    
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  /*******************************************************************/
  /**************************  EVENTOS  ******************************/
  /*******************************************************************/  
  async getStatistics(){            
    this.eventStatsResponseSubscription = this.eventStatsResponse$     
      .subscribe(
        {
          next: async ()=> {      
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               
            if(finish){                                     
              if(errorStatusCode==200){                   
                this.eventStatsResponse = this.store.selectSnapshot(EventState.eventStats);                                                                
                if(this.eventStatsResponse?.eventStats?.length>0){
                  this.expandedAccordions = this.eventStatsResponse.eventStats.map(stat => stat.event.id+"");
                  this.expandedCard= 'totalStats';     
                  this.expandedCards.push('totalStats');
                  this.expandedCards.push('eventStats');
                  this.updateChartData();            
                }    
              }
              else{
                this.expandedCard= null;      
                this.expandedCards = [];          
                // si el token ha caducado (403) lo sacamos de la aplicacion
                if(errorStatusCode==403){         
                  await this.loadingService.dismissLoading();           
                  this.cancel();    
                  this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
                }
                else{
                  this.toast.presentToast(errorMessage);
                }   

              }                 
              this.initSearchFinish = true;    
              this.dismissInitialLoading();                 
            }          
        }
      }
    )
  }

  async filterStatistics(showLoading:boolean=true){           
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }       
    this.store.dispatch(new GetEventStats({startDate:this.startDate, endDate:this.endDate, eventType: this.selectedEventType, excludeSpecialTypes:this.excludeSpecialTypes})).subscribe({ next: async () => { } });        
  }
  
  getProgressColorMusicianPercentageAssistEvents(percentage: number): string {
    if (percentage >= 80) {
      return 'success';
    } else if (percentage >= 50) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  getProgressColorMarchStats(percentage: number): string {
    if (percentage >= 50) {
      return 'success';
    } else if (percentage >= 20) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    let fechaFormateada = date.toLocaleString('es-ES', opciones);
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }

  /*toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;   
  }*/

  toggleCard(card: string): void {
    if (this.expandedCards.includes(card)) {
      this.expandedCards = this.expandedCards.filter(c => c !== card);
    } else {
      this.expandedCards.push(card);
    }
  }
  

  public chartPlugins: Plugin[] = [ extraLegendSpacingPlugin, ChartDataLabels ];

  public chartDataTotalMarchByEvent: ChartConfiguration['data'] = {
      labels: [],
      datasets: []
  };
  public chartDataAverageMarchByHourByEvent: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  public chartDataPieMarchByEvent: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  public chartDataTotalMarchByType: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  public chartTypeTotalMarchByEvent: ChartType = 'bar';
  public chartTypeAverageMarchByHourByEvent: ChartType = 'bar';
  public chartTypePieMarchByEvent: ChartType = 'pie';
  public chartTypeTotalMarchByType: ChartType = 'bar';

  public chartOptionsTotalMarchByType: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: false,
          text: 'Tipos de marchas'
        },
        ticks: {
          font: { size: 9 },
          autoSkip: false,
          //maxRotation: 0,
          padding: 5
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número total de marchas'
        }      
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 0,  // Sin cuadro de color
          font: {
            size: 14,
            family: 'Arial',
            style: 'normal',
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            // Para gráficos verticales, el valor generalmente se encuentra en context.parsed.y
            const value = context.parsed.y || 0;
            return `${datasetLabel}: ${value}`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#000',
        font: {
          size: 9
        },
        anchor: 'center',
        align: 'center',
        formatter: (value, context) => {
          return value > 0 ? value : '';
        }
      }
    }
  };
  
  public chartOptionsTotalMarchByEvent: ChartConfiguration['options'] = {
    indexAxis: 'y', // Gráfico de barras horizontales
    responsive: true,
    maintainAspectRatio: false,    
    scales: {
      x: {
        stacked: true,  // Apila los valores horizontalmente
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de marchas',          
        }
      },
      y: {
        stacked: true,  // Apila los valores en el eje de categorías
        ticks: {
          font: { size: 9 },
          autoSkip: false,
          maxRotation: 0,
          padding: 5
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',    
        labels: {
          boxWidth: 0,  // Esto elimina el cuadro de color
          font: {
            size: 14,
            family: 'Arial',
            style: 'normal',
            weight: 'bold'
          },
        }    
      },      
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${datasetLabel}: ${value}`;
          }
        }
      },
      // Configuración del plugin de data labels
      datalabels: {
        display: true,
        color: '#000',
        font: {
          size: 11          
        },
        anchor: 'center', // Posición de anclaje del label
        align: 'center',  // Se coloca encima de la barra        
        formatter: (value, context) => {
          if(value>0){
            return value;
          }
          else{
            return '';
          }
        },
        
      }
    }
  };

  public chartOptionsAverageMarchByHourByEvent: ChartConfiguration['options'] = {
    indexAxis: 'y', // Gráfico de barras horizontales
    responsive: true,
    maintainAspectRatio: false,    
    scales: {
      x: {
        stacked: true,  // Apila los valores horizontalmente
        beginAtZero: true,
        title: {
          display: true,
          text: 'Marchas por hora',          
        }
      },
      y: {
        stacked: true,  // Apila los valores en el eje de categorías
        ticks: {
          font: { size: 9 },
          autoSkip: false,
          maxRotation: 0,
          padding: 5
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',  
        labels: {
          boxWidth: 0,  // Esto elimina el cuadro de color
          font: {
            size: 14,
            family: 'Arial',
            style: 'normal',
            weight: 'bold'
          },
        }
      },      
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${datasetLabel}: ${value}`;
          }
        }
      },
      // Configuración del plugin de data labels
      datalabels: {
        display: true,
        color: '#000',
        font: {
          size: 11          
        },
        anchor: 'center', // Posición de anclaje del label
        align: 'center',  // Se coloca encima de la barra        
        formatter: (value, context) => {
          if(value>0){
            return value;
          }
          else{
            return '';
          }
        },
        
      }
    }
  };

  public chartOptionsPieMarchByEvent: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    /*layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }
    },*/
    plugins: {
      title: {
        display: true,
        text: 'Marchas por hora en cada evento',
        font: {
          size: 14,
        },
        padding: {
          top: 10,
          bottom: 10,
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          //boxWidth: 20,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return ` ${label}: ${value} marchas por hora`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#000',
        font: {
          family: 'Arial',
          weight: 'bold',
          size: 11
        },
        formatter: (value, context) => value,
        //formatter: (value, context) => {          
        //  const label = context.chart.data.labels[context.dataIndex];
        //  return `${label}: ${value}`;
        //}
        anchor: 'center',  // Posición de anclaje del label (ej.: 'end', 'center', 'start')
        align: 'end',   // Alineación relativa al anclaje (ej.: 'end', 'center', 'start')
        offset: 0,      // Desplazamiento en píxeles
        padding: 3,     // Espacio interno
        //backgroundColor: 'rgba(0,0,0,0.2)',  // Fondo semitransparente (opcional)
        borderRadius: 4,                     // Bordes redondeados (opcional)
        borderWidth: 1,                      // Grosor del borde (opcional)
        borderColor: 'rgba(0,0,0,1)',      // Color del borde (opcional)
        clamp: true,                         // Recorte del label
        rotation: 0,                         // Rotación del label
        
      }
    }
  };

  public dynamicHeight: number = 400; // Valor inicial
    
  toTitleCase(text: string): string {
    return text.replace(/\p{L}+/gu, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  getEventName(eventStat){

    if(eventStat.event.type == 'REHEARSAL'){
      return 'Ensayo ' + this.formatDate(eventStat.event.date);
    }
    else{
      if(eventStat.event.title){
        return this.toTitleCase(eventStat.event.title.trim());
      }
      else if(eventStat.event.description){
        return this.toTitleCase(eventStat.event.description.trim());
      }
      else{
        return 'Evento';
      }
    }
  }

  updateChartData(): void {
    this.dynamicHeight = (this.eventStatsResponse.eventStats.length * 40)+100;

    // grafico barras marchas en cada tipo
    this.chartDataTotalMarchByType = {            
      labels: this.eventStatsResponse.totalStats.marchsTypeStats.map(m => {
        const eventName = this.toTitleCase(m.name);        
        if (eventName.includes('-')) {
          return eventName.split('-').map(part => part.trim());
        }        
        return eventName;
      }),
      datasets: [
        {
          label: 'Número total de marchas por tipo',
          data: this.eventStatsResponse.totalStats.marchsTypeStats.map(m => m.count),
          backgroundColor: this.getColorsFromPalette(this.eventStatsResponse.totalStats.marchsTypeStats.length),
          hoverBackgroundColor: this.getColorsFromPalette(this.eventStatsResponse.totalStats.marchsTypeStats.length)
          //backgroundColor: 'rgba(160, 211, 175, 0.8)', 
          //backgroundColor: 'rgba(56, 128, 255, 0.8)'          
        }
      ]      
    };
    

    // grafico barras marchas en cada evento
    this.chartDataTotalMarchByEvent = {            
      labels: this.eventStatsResponse.eventStats.map(m => {
        const eventName = this.getEventName(m);        
        if (eventName.includes('-')) {
          return eventName.split('-').map(part => part.trim());
        }        
        return eventName;
      }),
      datasets: [
        {
          label: 'Número total de marchas por evento',
          data: this.eventStatsResponse.eventStats.map(m => m.stats.totalNumberMarchs),
          backgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length),
          hoverBackgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length)
          //backgroundColor: 'rgba(160, 211, 175, 0.8)', 
          //backgroundColor: 'rgba(56, 128, 255, 0.8)'          
        }
      ]      
    };
    
    this.chartOptionsTotalMarchByEvent = {
      ...this.chartOptionsTotalMarchByEvent,
      scales: {
        ...this.chartOptionsTotalMarchByEvent.scales,
        ['x']: {
          ...this.chartOptionsTotalMarchByEvent.scales?.['x'],
          max: Math.max(...this.eventStatsResponse.eventStats.map(m => m.stats.totalNumberMarchs))
        }
      }
    };

    // grafico barras marchas por hora en cada evento
    this.chartDataAverageMarchByHourByEvent = {            
      labels: this.eventStatsResponse.eventStats.map(m => {
        const eventName = this.getEventName(m);        
        if (eventName.includes('-')) {
          return eventName.split('-').map(part => part.trim());
        }        
        return eventName;
      }),
      datasets: [
        {
          label: 'Marchas por hora en cada evento',
          data: this.eventStatsResponse.eventStats.map(m => m.stats.averageNumberMarchsByHour),
          backgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length),
          hoverBackgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length)
          //backgroundColor: 'rgba(160, 211, 175, 0.8)', 
          //backgroundColor: 'rgba(56, 128, 255, 0.8)'          
        }
      ]      
    };

    this.chartOptionsAverageMarchByHourByEvent = {
      ...this.chartOptionsAverageMarchByHourByEvent,
      scales: {
        ...this.chartOptionsAverageMarchByHourByEvent.scales,
        ['x']: {
          ...this.chartOptionsAverageMarchByHourByEvent.scales?.['x'],
          max: Math.max(...this.eventStatsResponse.eventStats.map(m => m.stats.averageNumberMarchsByHour))
        }
      }
    };    

    // grafico de sectores de marchas en cada evento
    this.chartDataPieMarchByEvent = {
      labels: this.eventStatsResponse.eventStats.map(m => this.getEventName(m)),
      datasets: [{
        data: this.eventStatsResponse.eventStats.map(m => m.stats.averageNumberMarchsByHour),
        backgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length),
        hoverBackgroundColor: this.getColorsFromPalette(this.eventStatsResponse.eventStats.length)
      }]
    };

  }

  /*getColorPalette(): string[] {
    return [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF8A80', '#00BFA5', '#A1887F', '#80DEEA', '#FFD54F', '#CE93D8'
    ];
  }*/

  getColorPalette(): string[] {
    return [
      '#e6194b', // Rojo fuerte
      '#3cb44b', // Verde intenso
      '#ffe119', // Amarillo brillante
      '#0082c8', // Azul vibrante
      '#f58231', // Naranja
      '#911eb4', // Púrpura
      '#46f0f0', // Cian
      '#f032e6', // Magenta      
      '#fabebe', // Rosa suave
      '#008080', // Teal
      '#e6beff', // Lavanda
      '#aa6e28', // Marrón
      '#fffac8', // Beige
      '#800000', // Granate
      '#aaffc3', // Verde menta
      '#808000', // Oliva
      '#ffd8b1', // Melocotón
      '#000080', // Azul marino
      '#808080',  // Gris
      '#d2f53c', // Lima
    ];
  }

  getColorsFromPalette(count: number): string[] {
    const palette = this.getColorPalette();
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  trackByEventStatFn(index, eventStat) {      
    return eventStat.event.id; // Utiliza un identificador único de tu elemento
  }

  hasValidMarchOwnSlow(eventStat:EventStatResponse): boolean {
    return eventStat?.stats?.mostPlayerMarchOwnSlow?.some(march => march.count > 0);
  }

  hasValidMarchOtherSlow(eventStat:EventStatResponse): boolean {
    return eventStat?.stats?.mostPlayerMarchOtherSlow?.some(march => march.count > 0);
  }

  @ViewChild(IonContent, { static: false }) content: IonContent;
  public isCapturing = false;
  
  async downloadStats() {
    try {      
      if(!this.eventStatsResponse || !this.eventStatsResponse.eventStats || this.eventStatsResponse.eventStats.length==0){
        this.toast.presentToast('No se han generado estadísticas para descargar');
        return;
      }
      this.isCapturing = true;   
      await this.loadingService.presentLoading('Loading...');                
      await this.captureService.capture(this.content, 'capture', 'capturaStats.png',200,50);      
    } catch (error) {     
      this.toast.presentToast('Error al capturar y compartir la imagen: ' + error);       
    } finally {
      this.isCapturing = false;
      await this.loadingService.dismissLoading();   
    }    
  }


}
  