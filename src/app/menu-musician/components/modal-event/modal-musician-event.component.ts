import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { CalendarComponentOptions } from 'ion2-calendar';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_MUSICIAN_IMAGE } from 'src/app/constants/constants';
import { Event } from 'src/app/models/event/event';
import { MusicianEvent } from 'src/app/models/musician-event/musician-event';
import { MusicianEventListResponse } from 'src/app/models/musician-event/musician-event-list-response';
import { Musician } from 'src/app/models/musician/musician';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEvents, ResetEvent } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { CreateMusicianEvent, DeleteMusicianEvent, GetMusicianEvents, ResetMusicianEvent } from 'src/app/state/musicien-event/musician-event.actions';
import { MusicianEventState } from 'src/app/state/musicien-event/musician-event.state';

@Component({
  selector: 'app-modal-musician-event',
  templateUrl: './modal-musician-event.component.html',
  styleUrls: ['./modal-musician-event.component.scss'],
})
export class ModalMusicianEventComponent implements OnInit {

  public musicianEventListResponseSubscription: Subscription;
  @Select(MusicianEventState.musicianEventListResponse)
  public musicianEventListResponse$: Observable<MusicianEventListResponse>;
  public musicianEventListResponse: MusicianEventListResponse;
  
  @Input() musician: Musician;
  public showImage: string;


  public initScreen = false;
  public initSearchFinish = false;

  public selectedDate: Date;    
  public selectedMonthDate: Date;   
  public strSelectedMonth: string;
  public strSelectedYear: string;
  public calendarOptions: CalendarComponentOptions = {    
    //pickMode: 'multi',
    defaultTitle: '',
    from: new Date(2000, 0, 1),
    weekStart: 1,
    weekdays: ['Dom','Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    monthPickerFormat: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], // Configuración de los meses   
  };  

  constructor(
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private storage: StorageService
  ) { }

  async ngOnInit() {    
    if(this.musician.image){
      this.showImage = `data:image/jpeg;base64,${this.musician.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;      
    }     
    this.selectedMonthDate  = new Date();
    this.updateSelectedStrMonthAndYear();
    this.getEvents();      
    this.filterEvents(
      this.getFirstDayOfMonth(new Date()),
      this.getLastDayOfMonth(new Date()),
      false
    );       
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
    console.log("ngOnDestroy musician events");
    if (this.musicianEventListResponseSubscription) {      
      this.musicianEventListResponseSubscription.unsubscribe();  
    }     
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })  
    this.store.dispatch(new ResetMusicianEvent({})).subscribe({ next: async () => { } })  
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
  getFirstDayOfMonth(date: Date){
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);    
    const day = firstDayOfMonth.toLocaleDateString('es-ES', { day: '2-digit' });
    const month = firstDayOfMonth.toLocaleDateString('es-ES', { month: '2-digit' });
    const year = firstDayOfMonth.toLocaleDateString('es-ES', { year: 'numeric' });    
    return `${year}-${month}-${day}`;
  }

  getLastDayOfMonth(date: Date){
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const day = lastDayOfMonth.toLocaleDateString('es-ES', { day: '2-digit' });
    const month = lastDayOfMonth.toLocaleDateString('es-ES', { month: '2-digit' });
    const year = lastDayOfMonth.toLocaleDateString('es-ES', { year: 'numeric' });    
    return `${year}-${month}-${day}`;    
  }

  async getEvents(){            
    this.musicianEventListResponseSubscription = this.musicianEventListResponse$     
      .subscribe(
        {
          next: async ()=> {      
            const finish = this.store.selectSnapshot(MusicianEventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(MusicianEventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(MusicianEventState.errorMessage);            
            if(finish){             
              this.selectedDate = null; 
              if(errorStatusCode==200){                   
                this.musicianEventListResponse = this.store.selectSnapshot(MusicianEventState.musicianEventListResponse);              
                if(!this.musicianEventListResponse.events){
                  this.musicianEventListResponse.events = [];
                }            
                this.setCalendarDays(this.musicianEventListResponse.events);
              }
              else{
                this.musicianEventListResponse.events = [];
                this.setCalendarDays(this.musicianEventListResponse.events);
                // si el token ha caducado (403) lo sacamos de la aplicacion
                if(errorStatusCode==403){            
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

  async filterEvents(startDate:string ,endDate: string,showLoading:boolean=true){
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }       
    this.store.dispatch(new GetMusicianEvents({musicianId:this.musician.id,startDate:startDate, endDate:endDate})).subscribe({ next: async () => { } });    
  }

  refreshEvents($event){       
    this.filterEvents(
      this.getFirstDayOfMonth(this.selectedMonthDate),
      this.getLastDayOfMonth(this.selectedMonthDate)
    );   
    $event.target.complete();
  }

  getTitle(event:Event){
    // si hay varios eventos ese dia devolveremos "Varios", sino devolvemos su hora
    const dayEvents = this.musicianEventListResponse.events?.filter( day => {
      const configDate = new Date(day.date).toISOString().split('T')[0]; // Normaliza la fecha configurada
      return configDate === event.date; // Compara las fechas normalizadas
    });

    if (dayEvents?.length==1) {
      return dayEvents[0].startTime;
    }
    else {
      return "Varios";
    }
  }

  setCalendarDays(events: Event[]) { 
    this.calendarOptions =  {    
      ...this.calendarOptions,
      daysConfig: events && events.length > 0 
        ? events.map(event => ({
              date: new Date(event.date),                 
              subTitle: this.getTitle(event),
              cssClass: event.clsClass           
            }
          )
        )
        : [] 
    };    
  }

  isRehearsalDay(eventList: Event[]){
    return eventList.some(event => event.type === 'REHEARSAL');
  }

  async showModalMusicianEvent(event: Event){   

    if(event.displacementBus){
      const alert = await this.alertController.create({
        //header: 'Tipo de Evento',
        header: event.title?event.title:(event.description?event.description:'Evento'),
        inputs: [
          {
            name: 'assistBus',
            type: 'radio',
            label: 'Asistiré (bus)',
            value: 'ASSIST_BUS',
            checked: (event.musicianAssist && event.musicianBus) , 
          },
          {
            name: 'assistOther',
            type: 'radio',
            label: 'Asistiré (por mi cuenta)',
            value: 'ASSIST_BUS_OTHER',
            checked: (event.musicianAssist && !event.musicianBus)
          },        
          {
            name: 'notAssist',
            type: 'radio',
            label: 'No asistiré',
            value: 'NOT_ASSIST',
            checked: !event.musicianAssist, 
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.selectedDate = null; 
            },
          },
          {
            text: 'OK',
            handler: async (selectedType) => {      
              this.updateOrDeleteMusicianPerformance(event, selectedType);            
            },
          },
        ],
        cssClass: 'custom-alert-width' // Agregar la clase personalizada
      });  
      await alert.present();   
    }
    else{
      const alert = await this.alertController.create({
        header: event.title?event.title:(event.description?event.description:'Evento'),
        inputs: [
          {
            name: 'assist',
            type: 'radio',
            label: 'Asistiré',
            value: 'ASSIST',
            checked: event.musicianAssist , 
          },        
          {
            name: 'notAssist',
            type: 'radio',
            label: 'No asistiré',
            value: 'NOT_ASSIST',
            checked: !event.musicianAssist, 
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.selectedDate = null; 
            },
          },
          {
            text: 'OK',
            handler: async (selectedType) => {      
              this.updateOrDeleteMusicianPerformance(event, selectedType);            
            },
          },
        ],
        cssClass: 'custom-alert-width' // Agregar la clase personalizada
      });  
      await alert.present();   
    }   
  }

  async showModalExistsMultipleEvent(selectedDateString: any, events: Event[]) {
    const alert = await this.alertController.create({
      header: 'Selecciona un evento',
      inputs: events.map((event, index) => ({
        name: `event_${index}`,
        type: 'radio',
        label: `${event.title}`,
        value: event,
        checked: index === 0, // Marcar el primer evento como seleccionado por defecto
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.selectedDate = null; // Restablece la fecha seleccionada si el usuario cancela
          },
        },
        {
          text: 'OK',
          handler: (selectedEvent: Event) => {
            if (selectedEvent) {              
              this.showModalMusicianEvent(selectedEvent);        
            }
          },
        },
      ],
      cssClass: 'custom-alert-width' // Agregar la clase personalizada
    });
  
    await alert.present();

  }

  async onDateChange(selectedDateString: any) {    
    this.selectedMonthDate = new Date(selectedDateString);    
    this.updateSelectedStrMonthAndYear();
    
    const selectedEvents = this.musicianEventListResponse.events?.filter(day => {
      const selectedDate = new Date(selectedDateString).toISOString().split('T')[0]; // Normaliza la fecha seleccionada
      const configDate = new Date(day.date).toISOString().split('T')[0]; // Normaliza la fecha configurada
      return selectedDate === configDate; // Compara las fechas normalizadas
    });

    // si es ensayo
    if(this.isRehearsalDay(selectedEvents)){
      this.updateOrDeleteMusicianRehearsal(selectedEvents[0]);
    }
    // si es actuacion
    else{
      if (selectedEvents?.length>1) {
        this.showModalExistsMultipleEvent(selectedDateString,selectedEvents);
      }
      else if (selectedEvents?.length ==1) {      
        // si habia solo un evento, entonces damos opcion a modificar o eliminar          
        this.showModalMusicianEvent(selectedEvents[0]);          
      }      
    }
    
    setTimeout(() => {      
      this.selectedDate = null; 
    }, 1); // 2000 milise   */
      
  }

  onMonthChange(event: any) {        
    this.selectedDate = null;  
    this.selectedMonthDate = event.newMonth.dateObj;
    this.updateSelectedStrMonthAndYear();
    this.filterEvents(
      this.getFirstDayOfMonth(this.selectedMonthDate),
      this.getLastDayOfMonth(this.selectedMonthDate)
    );      
  }

  updateSelectedStrMonthAndYear(){
    this.strSelectedMonth = this.selectedMonthDate.toLocaleDateString('es-ES', { month: 'long' });
    this.strSelectedMonth = this.strSelectedMonth.charAt(0).toUpperCase() + this.strSelectedMonth.slice(1);
    this.strSelectedYear = this.selectedMonthDate.toLocaleDateString('es-ES', { year: 'numeric' });    
  }

  /*******************************************************************/
  /**************************  MUSICIAN EVENT  ***********************/
  /*******************************************************************/
  async updateOrDeleteMusicianRehearsal(event: Event){    
    let musicianEvent = new MusicianEvent();
    musicianEvent.eventId = event.id;
    musicianEvent.eventType = event.type;
    musicianEvent.musicianId = this.musician.id;
    musicianEvent.bus = false;    

    // si estaba marcado como asistido, lo debo eliminar
    if(event.musicianAssist){
      this.deleteMusicianEvent(musicianEvent);
    }
    else{ // sino insertarlo
      this.updateMusicianEvent(musicianEvent);
    }    
  }

  async updateOrDeleteMusicianPerformance(event: Event, type: string){    
    let musicianEvent = new MusicianEvent();
    musicianEvent.eventId = event.id;
    musicianEvent.eventType = event.type;
    musicianEvent.musicianId = this.musician.id;
           
    if(type==='NOT_ASSIST'){
      this.deleteMusicianEvent(musicianEvent);
    }
    else{
      if(type==='ASSIST_BUS'){
        musicianEvent.bus = true;                
      }
      else{
        musicianEvent.bus = false;
      }
      this.updateMusicianEvent(musicianEvent);
    }
  }

  async updateMusicianEvent(musicianEvent: MusicianEvent){
    //await this.loadingService.presentLoading('Loading...');  
   
    this.store.dispatch(new CreateMusicianEvent({musicianEvent: musicianEvent}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(MusicianEventState.success);
          if(success){
            this.toast.presentToast("Evento actualizado correctamente");            
            this.filterEvents(
              this.getFirstDayOfMonth(this.selectedMonthDate),
              this.getLastDayOfMonth(this.selectedMonthDate),
              false
            );   
            this.updateMusicianEventRehearsal(musicianEvent, true);       
          }
          else{
            this.updateMusicianEventRehearsal(musicianEvent, false);
            const errorStatusCode = this.store.selectSnapshot(MusicianEventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(MusicianEventState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }    
            await this.loadingService.dismissLoading();      
          }          
        }
      }
    )    
  }

  async deleteMusicianEvent(musicianEvent: MusicianEvent){
    //await this.loadingService.presentLoading('Loading...');    

    this.store.dispatch(new DeleteMusicianEvent({musicianEvent: musicianEvent}))
      .subscribe({
        next: async () => {
          const success = this.store.selectSnapshot(MusicianEventState.success);
          if(success){
            this.toast.presentToast("Evento actualizado correctamente");
            this.filterEvents(
              this.getFirstDayOfMonth(this.selectedMonthDate),
              this.getLastDayOfMonth(this.selectedMonthDate),
              false
            );   
            this.updateMusicianEventRehearsal(musicianEvent, false);
          }
          else{
            this.updateMusicianEventRehearsal(musicianEvent, true);
            const errorStatusCode = this.store.selectSnapshot(MusicianEventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(MusicianEventState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }    
            await this.loadingService.dismissLoading();      
          }          
        }
      }
    )
  }

  updateMusicianEventRehearsal(musicianEvent: MusicianEvent, assist:boolean){
    // si hemos actualizado un envayo, debemos mirar en el musico, por si debemos actualizar esos datos
    if(musicianEvent.eventType==='REHEARSAL'){
      if(this.musician.idLastRehearsal===musicianEvent.eventId){
        this.musician.assistLastRehearsal = assist;        
      }
    }
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


}

