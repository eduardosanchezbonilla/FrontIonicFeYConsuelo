import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { ChartConfiguration, ChartData, ChartOptions, ChartType, Plugin } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { MusicianSolosStatsResponse } from 'src/app/models/musician-solos-stats/musician-solos-stats-response';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetMusicianSolosStats, ResetMusicianSolosStats } from 'src/app/state/musician-solos-stats/musician-solos-stats.actions';
import { MusicianSolosStatsState } from 'src/app/state/musician-solos-stats/musician-solos-stats.state';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  selector: 'app-modal-musician-solos-stats',
  templateUrl: './modal-musician-solos-stats.component.html',
  styleUrls: ['./modal-musician-solos-stats.component.scss'],
})
export class ModalMusicianSolosStatsComponent implements OnInit {

  public musicianSolosStatsSubscription: Subscription;
  @Select(MusicianSolosStatsState.musicianSolosStats)
  public musicianSolosStats$: Observable<MusicianSolosStatsResponse[]>;
  public musicianSolosStats: MusicianSolosStatsResponse[];

  public initScreen = false;
  public initSearchFinish = false;  

  public profile: string;  

  
  constructor(
      private store:Store,
      private modalController: ModalController,
      private toast:ToastService,
      private userService: UsersService,
      private loadingService: LoadingService,  
      private storage: StorageService  
  ) { }

  async ngOnInit() {
    this.store.dispatch(new ResetMusicianSolosStats({})).subscribe({ next: async () => { } })        

    this.profile = await this.storage.getItem('profile');    
        
    this.store.dispatch(new GetMusicianSolosStats({}));    
    this.getMusicianSolosStats();   
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish){      
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
    if (this.musicianSolosStatsSubscription) {      
      this.musicianSolosStatsSubscription.unsubscribe();  
    }                
    this.musicianSolosStats = null;    
    this.store.dispatch(new ResetMusicianSolosStats({})).subscribe({ next: async () => { } })            
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getMusicianSolosStats(){
    this.musicianSolosStatsSubscription = this.musicianSolosStats$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(MusicianSolosStatsState.finish)        
        const errorStatusCode = this.store.selectSnapshot(MusicianSolosStatsState.errorStatusCode)        
        const errorMessage = this.store.selectSnapshot(MusicianSolosStatsState.errorMessage)        
        if(finish){       
          this.initSearchFinish = true;  
          if(errorStatusCode==200){          
            this.musicianSolosStats = this.store.selectSnapshot(MusicianSolosStatsState.musicianSolosStats);                   
            this.updateChartData();
          }
          else{            
            if(errorStatusCode==403){       
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }                
          }
          this.dismissInitialLoading();              
        }
      }
    })
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


  /*****************************************************************/
  /*************************  GRAFICOS  ****************************/
  /*****************************************************************/
  public chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
 
  public chartType: ChartType = 'bar';

  /*public chartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y', // Barras horizontales
    responsive: true, // El gráfico se ajusta al contenedor
    maintainAspectRatio: false, // Desactiva la relación de aspecto fija
    plugins: {
      legend: {
        display: false, // Ocultar la leyenda
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Porcentaje de Solos'
        }
      },
      y: {
        ticks: {
          font: {
            size: 8, // Tamaño pequeño para los nombres
          },
          autoSkip: false, // Mostrar todas las etiquetas
          maxRotation: 0, // No rotar las etiquetas
          padding: 5 // Espaciado entre etiquetas
        }
      }
    }
  };*/

  public chartPlugins: Plugin[] = [ extraLegendSpacingPlugin, ChartDataLabels ];

  public chartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y', // Gráfico de barras horizontales
    responsive: true,
    maintainAspectRatio: false,    
    scales: {
      x: {
        stacked: true,  // Apila los valores horizontalmente
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Solos',
          //padding: { top: 20, bottom: 20 } // Aumenta el espacio entre el título y el área del gráfico
        }/*,
        ticks: {
          padding: 50
        }*/
      },
      y: {
        stacked: true,  // Apila los valores en el eje de categorías
        ticks: {
          font: { size: 8 },
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
          size: 9
          //weight: 'bold'
        },
        anchor: 'center', // Posición de anclaje del label
        align: 'center',  // Se coloca encima de la barra
        //offset: 4,      // Ajusta el espacio entre el label y la barra
        // Solo se muestra un label por barra: en el último dataset se calcula la suma
        formatter: (value, context) => {
          //console.log(value);
          //if (context.datasetIndex === context.chart.data.datasets.length - 1) {
          //  const total = context.chart.data.datasets.reduce((acc, dataset, index) => {
          //    return acc + Number(dataset.data[context.dataIndex]);
          //  }, 0);
          //  return total;
          //}
          //return '';
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

  public dynamicHeight: number = 400; // Valor inicial
    
  /*updateChartData(): void {
    this.dynamicHeight = this.musicianSolosStats.length * 40;
    this.chartData = {
      labels: this.musicianSolosStats.map(m => `${m.name} ${m.surname}`),
      datasets: [
        {
          label: 'Porcentaje de Solos',
          data: this.musicianSolosStats.map(m => m.percentageSolos),
          backgroundColor: this.getColorsFromPalette(this.musicianSolosStats.length),
          hoverBackgroundColor: this.getColorsFromPalette(this.musicianSolosStats.length)
        }
      ]
    };
  }*/

  toTitleCase(text: string): string {
    return text.replace(/\p{L}+/gu, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  updateChartData(): void {
    this.dynamicHeight = this.musicianSolosStats.length * 35;
    this.chartData = {      
      labels: this.musicianSolosStats.map(m => `${this.toTitleCase(m.name.trim())} ${this.toTitleCase(m.surname.trim())}`),
      datasets: [
        {
          label: 'Solos principales',
          data: this.musicianSolosStats.map(m => m.totalMainSolos),
          backgroundColor: 'rgba(160, 211, 175, 0.8)', 
          //backgroundColor: 'rgba(56, 128, 255, 0.8)'          
        },
        {
          label: 'Solos suplente',
          data: this.musicianSolosStats.map(m => m.totalSecondarySolos),
          backgroundColor: 'rgba(255, 205, 210, 0.8)',
          //backgroundColor: 'rgba(12, 209, 232, 0.8)'                    
        }
      ]      
    };
  }

  getColorPalette(): string[] {
    return [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF8A80', '#00BFA5', '#A1887F', '#80DEEA', '#FFD54F', '#CE93D8'
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

}
