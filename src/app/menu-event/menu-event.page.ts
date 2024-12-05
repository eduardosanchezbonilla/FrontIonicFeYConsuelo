import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { StorageService } from '../services/storage/storage.service';
import { LoadingService } from '../services/loading/loading.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalEditEventComponent } from './component/modal-edit-event/modal-edit-event.component';
import { Select, Store } from '@ngxs/store';
import { EventState } from '../state/event/event.state';
import { Event } from '../models/event/event';
import { Observable, Subscription } from 'rxjs';
import { CreateEvent, DeleteEvent, GetEvents, ResetEvent, UpdateEvent } from '../state/event/event.actions';
import { UsersService } from '../services/user/users.service';
import { ToastService } from '../services/toast/toast.service';
import { CreateMusicianEvent, DeleteMusicianEvent, ResetMusicianEvent } from '../state/musicien-event/musician-event.actions';
import { MusicianEvent } from '../models/musician-event/musician-event';
import { MusicianEventState } from '../state/musicien-event/musician-event.state';

@Component({
  selector: 'app-menu-event',
  templateUrl: './menu-event.page.html',
  styleUrls: ['./menu-event.page.scss'],
})
export class MenuEventPage implements OnDestroy {

  public eventSubscription: Subscription;
  @Select(EventState.events)
  public events$: Observable<Event[]>;
  public events: Event[];
  
  public selectedDate: Date;    
  public selectedMonthDate: Date;   
  public calendarOptions: CalendarComponentOptions = {    
    //pickMode: 'multi',
    defaultTitle: '',
    from: new Date(2000, 0, 1),
    weekStart: 1,
    weekdays: ['Dom','Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    monthPickerFormat: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], // Configuración de los meses   
  };  
  
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;

  selectedSegment: string = 'calendar'; // Valor inicial del segmento

  constructor(
    private loadingService: LoadingService,
    private storage: StorageService,
    private modalController:ModalController,
    private store:Store,
    private userService: UsersService,
    private toast:ToastService,
    private alertController: AlertController
  ) { }


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

  async ionViewWillEnter(){
    this.selectedSegment = 'calendar';
    this.selectedDate = new Date();          
    this.selectedMonthDate = new Date();          
    this.profile = await this.storage.getItem('profile');         
    this.getEvents();      
    this.filterEvents(
      this.getFirstDayOfMonth(new Date()),
      this.getLastDayOfMonth(new Date())
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
    console.log("ngOnDestroy calendar");
    if (this.eventSubscription) {      
      this.eventSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })  
    this.store.dispatch(new ResetMusicianEvent({})).subscribe({ next: async () => { } })  
  }

  /*******************************************************************/
  /**************************  CALENDAR  *****************************/
  /*******************************************************************/   
  async showModalExistsEvent(selectedDateString: any,selectedEvent: Event){
    const alert = await this.alertController.create({
      header: 'Evento',
      inputs: [
        {
          name: 'edit',
          type: 'radio',
          label: 'Modificar',
          value: 'edit',
          checked: true, 
        },
        {
          name: 'delete',
          type: 'radio',
          label: 'Eliminar',
          value: 'delete',
        },
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
          handler: (selectedType) => {     
            if('edit'===selectedType){ 
              this.createUpdateEvent(selectedEvent.type,  selectedEvent, selectedDateString);                      
            }
            else{
              this.selectedDate = null; 
              this.confirmDeleteEvent( selectedEvent);            
            }
          },
        },
      ],
    });

    await alert.present();

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
              if(this.profile==='MUSICO'){
                this.showModalMusicianEvent(selectedEvent);        
              }
              else{
                this.showModalExistsEvent(selectedDateString, selectedEvent);              
              }
            }
          },
        },
      ],
      cssClass: 'custom-alert-width' // Agregar la clase personalizada
    });
  
    await alert.present();

  }

  async showModalNewEvent(selectedDateString: any){
    const alert = await this.alertController.create({
      header: 'Tipo de Evento',
      inputs: [
        {
          name: 'rehearsal',
          type: 'radio',
          label: 'Ensayo',
          value: 'REHEARSAL',
          checked: true, 
        },
        {
          name: 'performance',
          type: 'radio',
          label: 'Actuación',
          value: 'PERFORMANCE',
        },
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
          handler: (selectedType) => {      
            this.createUpdateEvent(selectedType,  null, selectedDateString);     
          },
        },
      ],
    });  
    await alert.present();      
  }

  async showModalMusicianEvent(event: Event){    
    const alert = await this.alertController.create({
      header: 'Tipo de Evento',
      inputs: [
        {
          name: 'assistBus',
          type: 'radio',
          label: 'Asistiré (bus)',
          value: 'ASSIST_BUS',
          checked: (event.assist && event.bus) || !event.assist, 
        },
        {
          name: 'assistOther',
          type: 'radio',
          label: 'Asistiré (por mi cuenta)',
          value: 'ASSIST_BUS_OTHER',
          checked: (event.assist && !event.bus)
        },        
        {
          name: 'notAssist',
          type: 'radio',
          label: 'No asistiré',
          value: 'NOT_ASSIST',
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
            this.updateOrDeleteMusicianEvent(event, selectedType);            
          },
        },
      ],
      cssClass: 'custom-alert-width' // Agregar la clase personalizada
    });  
    await alert.present();      
  }

  isRehearsalDay(eventList: Event[]){
    return eventList.some(event => event.type === 'REHEARSAL');
  }
  
  async onDateChange(selectedDateString: any) {    
    this.selectedMonthDate = new Date(selectedDateString);   

    const selectedEvents = this.events?.filter(day => {
      const selectedDate = new Date(selectedDateString).toISOString().split('T')[0]; // Normaliza la fecha seleccionada
      const configDate = new Date(day.date).toISOString().split('T')[0]; // Normaliza la fecha configurada
      return selectedDate === configDate; // Compara las fechas normalizadas
    });
    
    if(this.profile==='MUSICO'){
      // un musico solo puede tocar las casillas que son actuaciones, para indicar si asiste, o no asiste, en bus o coche
      if(!this.isRehearsalDay(selectedEvents)){
        if (selectedEvents?.length>1) {
          this.showModalExistsMultipleEvent(selectedDateString,selectedEvents);
        }
        else if (selectedEvents?.length ==1) {      
          // si habia solo un evento, entonces damos opcion a modificar o eliminar          
          this.showModalMusicianEvent(selectedEvents[0]);          
        }         
      }
    }
    else{      
      
      if (selectedEvents?.length>1) {
        this.showModalExistsMultipleEvent(selectedDateString,selectedEvents);
      }
      else if (selectedEvents?.length ==1) {      
        // si habia solo un evento, entonces damos opcion a modificar o eliminar
        this.showModalExistsEvent(selectedDateString,selectedEvents[0]);
      } 
      else {
        // sino habia dia, damos opcion a crear ensayo o actuacion
        this.showModalNewEvent(selectedDateString);
      }
    }  
    setTimeout(() => {      
      this.selectedDate = null; 
    }, 1); // 2000 milise   
      
  }

  getTitle(event:Event){
    // si hay varios eventos ese dia devolveremos "Varios", sino devolvemos su hora
    const dayEvents = this.events?.filter( day => {
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
              //subTitle: event.startTime,               
              subTitle: this.getTitle(event),
              cssClass: event.clsClass           
            }
          )
        )
        : [] 
    };    
  }

  onMonthChange(event: any) {        
    this.selectedDate = null;  
    this.selectedMonthDate = event.newMonth.dateObj;
    this.filterEvents(
      this.getFirstDayOfMonth(this.selectedMonthDate),
      this.getLastDayOfMonth(this.selectedMonthDate)
    );      
  }

  /*******************************************************************/
  /**************************  EVENTOS  ******************************/
  /*******************************************************************/  
  async getEvents(){            
    this.eventSubscription = this.events$     
      .subscribe(
        {
          next: async ()=> {      
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               
            if(finish){             
              this.selectedDate = null; 
              if(errorStatusCode==200){                   
                this.events = this.store.selectSnapshot(EventState.events);              
                if(!this.events){
                  this.events = [];
                }            
                this.setCalendarDays(this.events);
              }
              else{
                this.events = [];
                this.setCalendarDays(this.events);
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
    this.store.dispatch(new GetEvents({startDate:startDate, endDate:endDate})).subscribe({ next: async () => { } });    
  }

  refreshEvents($event){       
    this.filterEvents(
      this.getFirstDayOfMonth(this.selectedMonthDate),
      this.getLastDayOfMonth(this.selectedMonthDate)
    );   
    $event.target.complete();
  }

  /*******************************************************************/
  /**************************  MODALES  ******************************/
  /*******************************************************************/  
  translateEventType(eventType:string){    
    if(eventType==='Actuacion'){
      return 'PERFORMANCE';
    }
    if(eventType==='Ensayo'){
      return 'REHEARSAL';
    }
    return eventType;
  }


  async createUpdateEvent(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    const updating = event?true:false;

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalEditEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event,
        updating: updating
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      if(!updating){
        this.doCreateEvent(data);
      }
      else{
        this.doUpdateEvent(data);
      }
    }
    else{
      this.selectedDate = null; 
    }
  }

  getVoiceList(event: Event){    
    if(event.voiceList){
      // mapeamos para obtener solo los ids con un array
      return event.voiceList.map(voice => voice.id);
    }
    return [];
  }

  async doCreateEvent(event: Event){
    await this.loadingService.presentLoading('Loading...');     
    event.voiceIdList = this.getVoiceList(event);     
    event.voiceList = null;
    event.repetitionPeriod === '' ? event.repetitionPeriod = null : event.repetitionPeriod;
      
    this.store.dispatch(new CreateEvent({event: event}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Evento creado correctamente");            
            this.filterEvents(
              this.getFirstDayOfMonth(this.selectedMonthDate),
              this.getLastDayOfMonth(this.selectedMonthDate),
              false
            );          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
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

  async doUpdateEvent(event: Event){
    event.voiceIdList = this.getVoiceList(event);     
    event.voiceList = null;
    await this.loadingService.presentLoading('Loading...');    

    this.store.dispatch(new UpdateEvent({eventType:event.type,eventId: event.id, event:event}))
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Evento modificado correctamente");
            this.filterEvents(
              this.getFirstDayOfMonth(this.selectedMonthDate),
              this.getLastDayOfMonth(this.selectedMonthDate),
              false
            );       
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
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

  async confirmDeleteEvent(event:Event) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el evento?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteEvent(event);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteEvent(event:Event) {
    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    

    this.store.dispatch(new DeleteEvent({eventType:event.type,eventId:event.id}))
      .subscribe({
        next: async () => {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Evento eliminado correctamente");
            this.filterEvents(
              this.getFirstDayOfMonth(this.selectedMonthDate),
              this.getLastDayOfMonth(this.selectedMonthDate),
              false
            );   
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
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

  /*******************************************************************/
  /**************************  MUSICIAN EVENT  ***********************/
  /*******************************************************************/
  async updateOrDeleteMusicianEvent(event: Event, type: string){    
    const user = JSON.parse(await this.storage.getItem('user'));        
    let musicianEvent = new MusicianEvent();
    musicianEvent.eventId = event.id;
    musicianEvent.eventType = event.type;
    musicianEvent.musicianId = user.musician.id;
           
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
    await this.loadingService.presentLoading('Loading...');  
   
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
          }
          else{
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
    await this.loadingService.presentLoading('Loading...');    

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
          }
          else{
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

  /*******************************************************************/

  async onSegmentChanged(event: any) {
    //await this.loadingService.presentLoading('Loading...');
    //this.filterAllNotifications = event.detail.value==='all';    
    //this.filterRequest();    
  }


}
