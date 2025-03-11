import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { EventListResponse } from 'src/app/models/event/event-list-response';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEvents, ResetEvent } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';

@Component({
  selector: 'app-modal-stats',
  templateUrl: './modal-stats.component.html',
  styleUrls: ['./modal-stats.component.scss'],
})
export class ModalStatsComponent implements OnInit {

  expandedCard: string | null = null;

  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;    

  public eventListResponseSubscription: Subscription;
  @Select(EventState.eventListResponse)
  public eventListResponse$: Observable<EventListResponse>;
  public eventListResponse: EventListResponse;

  public initScreen = false;
  public initSearchFinish = false;  
  startDate: string = new Date().toISOString().split('T')[0]; // Hoy
  endDate: string = new Date().toISOString().split('T')[0]; // Hoy

  public showMonthStatistics = true;
  public showYearStatistics = true;
  public showHistoricStatistics = true;
  public showGlobalStatistics = true;

  constructor(
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,    
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })    
    
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);
    this.startDate = lastYear.toISOString().split('T')[0]; // Fecha de hace un año

    this.getStatistics();      
    this.filterStatistics(false);   
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
    if (this.eventListResponseSubscription) {      
      this.eventListResponseSubscription.unsubscribe();  
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
    this.eventListResponseSubscription = this.eventListResponse$     
      .subscribe(
        {
          next: async ()=> {      
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               
            if(finish){                                     
              if(errorStatusCode==200){                   
                this.eventListResponse = this.store.selectSnapshot(EventState.eventListResponse);                                              
                if(!this.eventListResponse.events){
                  this.eventListResponse.events = [];
                }                            
              }
              else{
                if(this.eventListResponse){
                  this.eventListResponse.events = [];                  
                }
                else{
                  this.eventListResponse = new EventListResponse();
                  this.eventListResponse.events = [];                  
                }
                // si el token ha caducado (403) lo sacamos de la aplicacion
                if(errorStatusCode==403){            
                  this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
                }
                else{
                  this.toast.presentToast(errorMessage);
                }   

              }  
              this.calculateShowStatistics();   
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
    this.store.dispatch(new GetEvents({startDate:this.startDate, endDate:this.endDate, allEvents: false})).subscribe({ next: async () => { } });    
  }

  calculateShowStatistics(){
    let eventDate = new Date(Math.min.apply(null, this.eventListResponse.events.map(e => new Date(e.date))));

    if(this.eventListResponse.musicianEventAssistStatistic &&
       this.eventListResponse.musicianEventAssistStatistic.musicianCurrentMonthTotalNumberEvents && 
       this.eventListResponse.musicianEventAssistStatistic.musicianCurrentMonthTotalNumberEvents > 0   &&
       eventDate<=new Date()
    ){
      this.showMonthStatistics=true;
    }
    else{
      this.showMonthStatistics=false;
    }

    if(this.eventListResponse.musicianEventAssistStatistic &&
       this.eventListResponse.musicianEventAssistStatistic.musicianCurrentYearTotalNumberEvents && 
       this.eventListResponse.musicianEventAssistStatistic.musicianCurrentYearTotalNumberEvents > 0 
    ){
      this.showYearStatistics=true;
    }
    else{
      this.showYearStatistics=false;
    }

    if(this.eventListResponse.musicianEventAssistStatistic &&
      this.eventListResponse.musicianEventAssistStatistic.musicianHistoricTotalNumberEvents && 
      this.eventListResponse.musicianEventAssistStatistic.musicianHistoricTotalNumberEvents > 0 
    ){
      this.showHistoricStatistics=true;
    }
    else{
      this.showHistoricStatistics=false;
    }

    this.showGlobalStatistics = this.showMonthStatistics || this.showYearStatistics || this.showHistoricStatistics;        
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
    if (percentage >= 60) {
      return 'success';
    } else if (percentage >= 30) {
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

  toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;
  }
  
}
