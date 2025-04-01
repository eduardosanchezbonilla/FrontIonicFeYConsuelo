import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { StorageService } from '../services/storage/storage.service';
import { LoadingService } from '../services/loading/loading.service';
import { AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { ModalEditEventComponent } from './component/modal-edit-event/modal-edit-event.component';
import { Select, Store } from '@ngxs/store';
import { EventState } from '../state/event/event.state';
import { Event } from '../models/event/event';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { CreateEvent, DeleteEvent, GetEvent, GetEvents, GetEventsGroupByAnyo, ResetEvent, UpdateEvent } from '../state/event/event.actions';
import { UsersService } from '../services/user/users.service';
import { ToastService } from '../services/toast/toast.service';
import { CreateMusicianEvent, DeleteMusicianEvent, ResetMusicianEvent } from '../state/musicien-event/musician-event.actions';
import { MusicianEvent } from '../models/musician-event/musician-event';
import { MusicianEventState } from '../state/musicien-event/musician-event.state';
import { ModalMusicianAssistanceComponent } from './component/modal-musician-assistance/modal-musician-assistance.component';
import { EventGroupByAnyo } from '../models/event/event-group-by-anyo';
import { FilterEvents } from '../models/event/filter-events';
import { DEFAULT_ANYO_IMAGE, DEFAULT_EVENT_IMAGE, DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from '../constants/constants';
import { IonFab } from '@ionic/angular';
import { ModalRepertoireEventComponent } from './component/modal-repertoire-event/modal-repertoire-event.component';
import { VideoCategory } from '../models/video-category/video-category';
import { ModalViewCategoryImageComponent } from '../menu-multimedia/component/modal-view-category-image/modal-view-category-image.component';
import { EventListResponse } from '../models/event/event-list-response';
import { ModalFormationEventComponent } from './component/modal-formation-event/modal-formation-event.component';
import { ModalStatsComponent } from './component/modal-stats/modal-stats.component';
import { ModalRouteEventComponent } from './component/modal-route-event/modal-route-event.component';
import { ModalCrossheadEventComponent } from './component/modal-crosshead-event/modal-crosshead-event.component';
import { Router } from '@angular/router';
import { ModalStatsMarchsComponent } from './component/modal-stats-marchs/modal-stats-marchs.component';
import { ModalAttachEventComponent } from './component/modal-attach-event/modal-attach-event.component';

@Component({
  selector: 'app-menu-event',
  templateUrl: './menu-event.page.html',
  styleUrls: ['./menu-event.page.scss'],
})
export class MenuEventPage implements OnDestroy {

  expandedCard: string | null = null;

  @ViewChild('fabEvents', { static: false }) fabEvents!: IonFab;
  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;    

  public eventListResponseSubscription: Subscription;
  @Select(EventState.eventListResponse)
  public eventListResponse$: Observable<EventListResponse>;
  public eventListResponse: EventListResponse;

  public eventGroupByAnyoSubscription: Subscription;
  @Select(EventState.eventsGroupByAnyo)
  public eventsGroupByAnyo$: Observable<EventGroupByAnyo[]>;
  public eventsGroupByAnyo: EventGroupByAnyo[];
  public expandAnyoList: string[];
  public expandAnyoMap: Map<string, boolean> = new Map();
  public filter: FilterEvents;
  public searchTextChanged = new Subject<string>();
  public isSearching: boolean = false;
  public defaultAnyoImage: string = DEFAULT_ANYO_IMAGE;
  public defaultEventImage: string = DEFAULT_EVENT_IMAGE;   
  public oldPerformances: boolean;   
  public oldPerformancesValue: boolean=false;  
  public firstOldPerformances: boolean;
  public clickOldPerformances: boolean;

  public showMonthStatistics = true;
  public showYearStatistics = true;
  public showHistoricStatistics = true;
  public showGlobalStatistics = true;
  
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
    monthFormat: 'MMM YYYY', // Configura el formato del mes    
    monthPickerFormat: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], // Configuración de los meses           
  };  
  
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public finishSearchEvents = false;

  selectedSegment: string = 'calendar'; // Valor inicial del segmento

  public viewCalendar: boolean = true;
  public viewPerformance: boolean = false;

  public todayPerformance: number[];
  public isTodayPerformance: boolean = false;
  public eventToday: Event;

  public imageLoaded = false;
  public loading: boolean = true; // Estado de carga de la imagen

  constructor(
    private loadingService: LoadingService,
    private storage: StorageService,
    private modalController:ModalController,
    private store:Store,
    private userService: UsersService,
    private toast:ToastService,
    private alertController: AlertController,
    private router: Router
  ) {        
    this.expandAnyoList = null;
    this.expandAnyoMap = null;
    this.filter = new FilterEvents();
    this.filter.filter = '';
    this.isSearching = false;
    this.searchTextChanged
      .pipe(debounceTime(300)) // 200 milisegundos de espera
      .subscribe(value => {
        this.searchEventsGroupByAnyo(value);
      });    
   }


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
    if(this.router.url.indexOf('menu-today-performance')>=0){
      let user = JSON.parse(await this.storage.getItem('user'));     
      if(user?.todayPerformance?.length>0){
        this.todayPerformance = user.todayPerformance;
        this.isTodayPerformance = true;              
      }
    }
    
    this.profile = await this.storage.getItem('profile');     
    this.finishSearchEvents = false;
    this.firstOldPerformances = true;
    this.clickOldPerformances = false;
    if(this.profile!=='INVITADO' && !this.isTodayPerformance){ // si es dia de actuacion no mostramos tampoco calendario, en esa pantalla siempre lista de actuaciones
      this.viewCalendar = true;
      this.viewPerformance = false;
      this.selectedSegment = 'calendar';
      this.selectedDate = new Date();          
      this.selectedMonthDate = new Date();                
      this.selectedMonthDate  = new Date();
      this.updateSelectedStrMonthAndYear();    
      this.getEvents();      
      this.filterEvents(
        this.getFirstDayOfMonth(new Date()),
        this.getLastDayOfMonth(new Date())
      );   
      this.getEventsGroupByAnyo();
    }
    else{    
      this.viewCalendar = false;
      this.viewPerformance = true;      
      this.selectedSegment = 'performance';
      this.getEventsGroupByAnyo();
      this.filterEventsGroupByAnyo();
    }        
    
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){    
    if(this.router.url.indexOf('menu-today-performance')>=0){
      let user = JSON.parse(await this.storage.getItem('user'));     
      if(user?.todayPerformance?.length>0){
        this.todayPerformance = user.todayPerformance;
        this.isTodayPerformance = true;        
      }
    }
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
    this.finishSearchEvents = false;
    if(!this.isTodayPerformance){
      this.eventsGroupByAnyo = [];
    }    
    if(this.profile!=='INVITADO' && !this.isTodayPerformance){
      this.viewCalendar = true;          
    }
    else{
      this.viewCalendar = false; 
    }
    if (this.eventListResponseSubscription) {                  
      this.eventListResponseSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    if (this.eventGroupByAnyoSubscription) {             
      this.eventGroupByAnyoSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }    
    this.store.dispatch(new ResetEvent({})).subscribe({ next: async () => { } })  
    this.store.dispatch(new ResetMusicianEvent({})).subscribe({ next: async () => { } })  
  }

  /*******************************************************************/
  /**************************  CALENDAR  *****************************/
  /*******************************************************************/   
  async showModalExistsEvent(selectedDateString: any,selectedEvent: Event){

    let inputs = [];
    inputs.push(
      {
        name: 'edit',
        type: 'radio',
        label: 'Modificar',
        value: 'edit',
        checked: true, 
      }
    );     
    inputs.push(
      {
        name: 'delete',
        type: 'radio',
        label: 'Eliminar',
        value: 'delete',
      }
    );
    inputs.push(
      {
        name: 'musicianAssistance',
        type: 'radio',
        label: 'Asistencia musicos',
        value: 'musicianAssistance',
      }
    );
    inputs.push(
      {
        name: 'repertoire',
        type: 'radio',
        label: 'Repertorio',
        value: 'repertoire',
      }
    );
    if(!this.isRehearsalDay([selectedEvent]) && selectedEvent.performanceType!=='CONCIERTO'){
      inputs.push(
        {
          name: 'crosshead',
          type: 'radio',
          label: 'Cruceta',
          value: 'crosshead',
        }
      );
    }
    if(!this.isRehearsalDay([selectedEvent]) && selectedEvent.image){
      inputs.push(
        {
          name: 'viewPerformanceImage',
          type: 'radio',
          label: 'Ver cartel',
          value: 'viewPerformanceImage',
        }
      );
    }
    if(!this.isRehearsalDay([selectedEvent]) ){
      inputs.push(
        {
          name: 'formation',
          type: 'radio',
          label: 'Formación',
          value: 'formation',
        }
      );
    }
    if(!this.isRehearsalDay([selectedEvent]) && selectedEvent.performanceType!=='CONCIERTO'){
      inputs.push(
        {
          name: 'route',
          type: 'radio',
          label: 'Itinerario',
          value: 'route',
        }
      );
    }
    if(!this.isRehearsalDay([selectedEvent]) && this.profile==='SUPER_ADMIN' && selectedEvent.googleId && selectedEvent.googleId!==''){
      inputs.push(
        {
          name: 'attach',
          type: 'radio',
          label: 'Adjuntos',
          value: 'attach',
        }
      );
    }

    const alert = await this.alertController.create({
      //header: 'Evento',
      header: selectedEvent.title?selectedEvent.title:(selectedEvent.description?selectedEvent.description:'Evento'),
      inputs: inputs,      
      cssClass: 'custom-alert-width', // Agregar la clase personalizada
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
            if('delete'===selectedType){ 
              this.selectedDate = null; 
              this.confirmDeleteEvent( selectedEvent);            
            }
            if('musicianAssistance'===selectedType){ 
              this.selectedDate = null; 
              this.eventMusicianAssistance( selectedEvent.type,  selectedEvent, selectedDateString);              
            }
            if('repertoire'===selectedType){ 
              this.selectedDate = null; 
              this.eventRepertoire( selectedEvent.type,  selectedEvent, selectedDateString);              
            }
            if('formation'===selectedType){ 
              this.selectedDate = null; 
              this.formationRepertoire( selectedEvent.type,  selectedEvent, selectedDateString);              
            }
            if('route'===selectedType){ 
              this.selectedDate = null; 
              this.eventRoute( selectedEvent.type,  selectedEvent, selectedDateString);              
            }
            if('viewPerformanceImage'===selectedType){ 
              this.selectedDate = null; 
              this.viewPerformanceImage( selectedEvent);              
            }
            if('crosshead'===selectedType){ 
              this.selectedDate = null; 
              this.crossheadEvent( selectedEvent.type,  selectedEvent, selectedDateString);              
            }
            if('attach'===selectedType){ 
              this.selectedDate = null; 
              this.eventAttach( selectedEvent.type,  selectedEvent, selectedDateString);              
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
    const selectedDateString = event.date;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    let inputs = [];
    if(this.profile!=='INVITADO'){
      inputs.push(
        {
          name: 'assist',
          type: 'radio',
          label: 'Asistencia',
          value: 'ASSIST',
          checked: !(new Date(selectedDateString)<currentDate),
          disabled: (new Date(selectedDateString)<currentDate), 
        }
      );     
    }
    inputs.push(
      {
        name: 'repertoire',
        type: 'radio',
        label: 'Repertorio',
        checked: (new Date(selectedDateString)<currentDate) && this.profile!=='INVITADO',
        value: 'REPERTOIRE',            
      }
    );
    if(this.profile!=='INVITADO'){
      if(!this.isRehearsalDay([event]) && event.performanceType!=='CONCIERTO'){
        inputs.push(
          {
            name: 'crosshead',
            type: 'radio',
            label: 'Cruceta',
            value: 'CROSSHEAD',
          }
        );
      }
    }    
    inputs.push(
      {
        name: 'information',
        type: 'radio',
        label: 'Informacion detallada',
        checked: this.profile==='INVITADO',
        value: 'INFORMATION'            
      }
    );    
    if(this.profile!=='INVITADO'){        
      if(!this.isRehearsalDay([event]) ){
        inputs.push(
          {
            name: 'formation',
            type: 'radio',
            label: 'Formación',
            value: 'FORMATION'            
          }
        );
      }    
    }
    if(!this.isRehearsalDay([event]) && event.performanceType!=='CONCIERTO'){
      inputs.push(
        {
          name: 'route',
          type: 'radio',
          label: 'Itinerario',
          value: 'ROUTE',
        }
      );
    }
    
    const alert = await this.alertController.create({
      header: event.title?event.title:(event.description?event.description:'Evento'),
      inputs: inputs,
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

            if('ASSIST'===selectedType){ 
              this.showModalMusicianAssistanceEvent(event);        
            }
            if('REPERTOIRE'===selectedType){ 
              this.showEventRepertoire(event, null);        
            }
            if('INFORMATION'===selectedType){ 
              this.createUpdateEvent(event.type,  event, selectedDateString);
            }   
            if('FORMATION'===selectedType){ 
              this.selectedDate = null; 
              this.formationRepertoire( event.type,  event, selectedDateString);              
            }   
            if('ROUTE'===selectedType){ 
              this.selectedDate = null; 
              this.eventRoute( event.type,  event, selectedDateString);              
            }    
            if('CROSSHEAD'===selectedType){ 
              this.selectedDate = null; 
              this.crossheadEvent( event.type,  event, selectedDateString);              
            }   
          },
        },
      ],
      cssClass: 'custom-alert-width' // Agregar la clase personalizada
    });  
    await alert.present();            
  }

  async showModalMusicianAssistanceEvent(event: Event){    
    const selectedDateString = event.date;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    if(new Date(selectedDateString)<currentDate){
      this.toast.presentToast("No se puede modificar eventos de dias anteriores.<br> Contacta con el administrador");
      return;
    }

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
            checked: (event.musicianAssist && event.musicianBus), 
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
              this.updateOrDeleteMusicianEvent(event, selectedType);            
            },
          },
        ],
        cssClass: 'custom-alert-width' // Agregar la clase personalizada
      });  
      await alert.present();      
    }
    else{
      const alert = await this.alertController.create({
        //header: 'Tipo de Evento',
        header: event.title?event.title:(event.description?event.description:'Evento'),
        inputs: [
          {
            name: 'assistBus',
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
              this.updateOrDeleteMusicianEvent(event, selectedType);            
            },
          },
        ],
        cssClass: 'custom-alert-width' // Agregar la clase personalizada
      });  
      await alert.present();      
    }
  
  }

  isRehearsalDay(eventList: Event[]){
    return eventList.some(event => event.type === 'REHEARSAL');
  }

  showModalAssistanceMusician(selectedEvents: Event){
    const selectedDateString = selectedEvents.date;    
    this.showModalAssistanceMusicianArray([selectedEvents],selectedDateString);
  }

  showModalAssistanceMusicianArray(selectedEvents: Event[], selectedDateString: any){    
    // un musico solo puede tocar las casillas que son actuaciones, para indicar si asiste, o no asiste, en bus o coche
    //if(!this.isRehearsalDay(selectedEvents)){

      if (selectedEvents?.length>1) {
        this.showModalExistsMultipleEvent(selectedDateString,selectedEvents);
      }
      else if (selectedEvents?.length ==1) {      
        // si habia solo un evento, entonces damos opcion a modificar o eliminar          
        this.showModalMusicianEvent(selectedEvents[0]);          
      }         
    //}
  }
  
  async onDateChange(selectedDateString: any) {    
    this.selectedMonthDate = new Date(selectedDateString);   
    this.updateSelectedStrMonthAndYear();

    const selectedEvents = this.eventListResponse.events?.filter(day => {
      const selectedDate = new Date(selectedDateString).toISOString().split('T')[0]; // Normaliza la fecha seleccionada
      const configDate = new Date(day.date).toISOString().split('T')[0]; // Normaliza la fecha configurada
      return selectedDate === configDate; // Compara las fechas normalizadas
    });
    
    if(this.profile==='MUSICO'){      
      this.showModalAssistanceMusicianArray(selectedEvents, selectedDateString);
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
    const dayEvents = this.eventListResponse.events?.filter( day => {
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
  /**************************  EVENTOS  ******************************/
  /*******************************************************************/  
  async getEvents(){            
    this.eventListResponseSubscription = this.eventListResponse$     
      .subscribe(
        {
          next: async ()=> {      
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               
            if(finish){             
              this.selectedDate = null; 
              if(errorStatusCode==200){                   
                this.eventListResponse = this.store.selectSnapshot(EventState.eventListResponse);                   
                if(!this.eventListResponse.events){
                  this.eventListResponse.events = [];
                }            
                this.setCalendarDays(this.eventListResponse.events);
              }
              else{
                if(this.eventListResponse){
                  this.eventListResponse.events = [];
                  this.setCalendarDays(this.eventListResponse.events);
                }
                else{
                  this.eventListResponse = new EventListResponse();
                  this.eventListResponse.events = [];
                  this.setCalendarDays(this.eventListResponse.events);
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

  async filterEvents(startDate:string ,endDate: string,showLoading:boolean=true){    
    this.finishSearchEvents = false;    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }       
    this.store.dispatch(new GetEvents({startDate:startDate, endDate:endDate, allEvents:true})).subscribe({ next: async () => { } });    
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
            
            if(this.viewPerformance){
              this.filterEventsGroupByAnyo(false);   
            }
            if(this.viewCalendar){              
              this.filterEvents(
                this.getFirstDayOfMonth(this.selectedMonthDate),
                this.getLastDayOfMonth(this.selectedMonthDate),
                false
              );         
            }            
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

  async updatePerformance(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    userSliding.close();

    // abrimos la modal
    this.createUpdateEvent("PERFORMANCE",event,event.date);
  }

  async confirmDeletePerformance(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    userSliding.close();

    // abrimos la modal
    this.confirmDeleteEvent(event);
  }

  async updateMusicianAssistance(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.eventMusicianAssistance( "PERFORMANCE",  event, event.date);                  
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

            if(this.viewPerformance){
              this.filterEventsGroupByAnyo(false);   
            }
            if(this.viewCalendar){              
              this.filterEvents(
                this.getFirstDayOfMonth(this.selectedMonthDate),
                this.getLastDayOfMonth(this.selectedMonthDate),
                false
              );         
            }        
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

            if(this.viewPerformance){
              this.filterEventsGroupByAnyo(false);   
            }
            if(this.viewCalendar){              
              this.filterEvents(
                this.getFirstDayOfMonth(this.selectedMonthDate),
                this.getLastDayOfMonth(this.selectedMonthDate),
                false
              );         
            }                    
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
            if(this.viewPerformance){      
              this.filterEventsGroupByAnyo(false);   
            }
            if(this.viewCalendar){
              this.filterEvents(
                this.getFirstDayOfMonth(this.selectedMonthDate),
                this.getLastDayOfMonth(this.selectedMonthDate),
                false
              );      
            }            
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
            if(this.viewPerformance){      
              this.filterEventsGroupByAnyo(false);   
            }
            if(this.viewCalendar){
              this.filterEvents(
                this.getFirstDayOfMonth(this.selectedMonthDate),
                this.getLastDayOfMonth(this.selectedMonthDate),
                false
              );      
            }                    
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

  async eventMusicianAssistance(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalMusicianAssistanceComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
  }

  async showEventRepertoire(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.eventRepertoire( event.type,  event, event.date);                  
  }

  async eventRepertoire(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalRepertoireEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
  }

  /*******************************************************************/

  async onSegmentChanged(event: any) {
    
    if(this.viewCalendar && event.detail.value==='calendar'){
      return;
    }

    if(this.viewPerformance && event.detail.value==='performance'){
      return;
    }

    this.viewCalendar = event.detail.value==='calendar';
    this.viewPerformance = event.detail.value==='performance';

    if (this.fabEvents) {
      this.fabEvents.close(); // Cierra el FAB programáticamente
    }

    if(this.viewPerformance){      
      this.filterEventsGroupByAnyo();   
    }
    if(this.viewCalendar){
      this.eventsGroupByAnyo = [];
      this.selectedDate = this.selectedMonthDate;                          
    
      this.filterEvents(
        this.getFirstDayOfMonth(this.selectedMonthDate),
        this.getLastDayOfMonth(this.selectedMonthDate)
      );         
    }
  }

  async getEventsGroupByAnyo(){            
    this.eventGroupByAnyoSubscription = this.eventsGroupByAnyo$     
      .subscribe(
        {
          next: async ()=> {                  
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               
            if(finish){                     
              if(errorStatusCode==200){                   
                this.eventsGroupByAnyo = this.store.selectSnapshot(EventState.eventsGroupByAnyo);              
                if(!this.eventsGroupByAnyo){
                  this.eventsGroupByAnyo = [];
                }                  
                if(this.expandAnyoList===null || (this.clickOldPerformances && this.firstOldPerformances)){                              
                  this.expandAnyoMap = new Map(); 
                  this.eventsGroupByAnyo.map(eventGroupByAnyo => eventGroupByAnyo.anyo+"").forEach(element => {                   
                    this.expandAnyoMap.set(element, true);
                  });
                  this.updateExpandAnyoList();              
                }
                else{                        
                  this.updateExpandAnyoList();
                }        
                if(this.clickOldPerformances && this.firstOldPerformances){                 
                  this.firstOldPerformances = false;
                }

                if(this.isTodayPerformance && this.eventsGroupByAnyo.length>0){
                  this.eventToday = this.eventsGroupByAnyo[0].events[0];
                }
              }
              else{                
                if(this.expandAnyoList===null){                             
                  this.expandAnyoMap = new Map(); 
                }
                this.eventsGroupByAnyo = [];     
                this.eventsGroupByAnyo.map(eventGroupByAnyo => eventGroupByAnyo.anyo+"").forEach(element => {
                  this.expandAnyoMap.set(element, false);
                });  
                this.updateExpandAnyoList();           
                // si el token ha caducado (403) lo sacamos de la aplicacion
                if(errorStatusCode==403){            
                  this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
                }
                else{
                  this.toast.presentToast(errorMessage);
                }   

              }                
              this.isSearching = false;                       
              this.initSearchFinish = true;    
              await this.loadingService.dismissLoading();                 
              this.finishSearchEvents = true;
            }          
        }
      }
    )
  }

  async filterEventsGroupByAnyo( showLoading:boolean=true){    
    if (this.isTodayPerformance && (!this.eventGroupByAnyoSubscription || (this.eventGroupByAnyoSubscription && this.eventGroupByAnyoSubscription.closed))) {
      this.getEventsGroupByAnyo();    
    }

    this.finishSearchEvents = false;
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }       
    let startDate = this.oldPerformances ? '' : new Date().toISOString().split('T')[0];    
    if(this.isTodayPerformance){
      this.store.dispatch(new GetEventsGroupByAnyo({eventType: 'PERFORMANCE', startDate:startDate, endDate:startDate, name: this.filter.filter})).subscribe({ next: async () => { } });    
    }
    else{
      this.store.dispatch(new GetEventsGroupByAnyo({eventType: 'PERFORMANCE', startDate:startDate, endDate:'', name: this.filter.filter})).subscribe({ next: async () => { } });    
    }    
  }

  refreshEventsGroupByAnyo($event){       
    this.filterEventsGroupByAnyo();   
    $event.target.complete();
  }

  searchEventsGroupByAnyo(searchText: string) {
    if(this.isSearching == false){
      this.isSearching = true;
      this.filterEventsGroupByAnyo();      
    }
  }

  onSearchTextChanged(event: any) {
    this.searchTextChanged.next(event.detail.value);
  }

  updateExpandAnyoList(){
    this.expandAnyoList = Array.from(this.expandAnyoMap)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);    
  }

  trackByAnyoFn(index, anyo) {      
    return anyo;
  }

  trackByPerformanceFn(index, performance) {    
    return performance.id;
  }

  accordionGroupChange = (ev: any) => {
    this.expandAnyoMap.forEach((value, key) => {
      this.expandAnyoMap.set(key, false);
    });
    ev.detail.value.forEach(element => {
      this.expandAnyoMap.set(element, true);
    }); 
    this.updateExpandAnyoList();    
  };

  onOldPerformancesChanged(event: any){
    if(this.oldPerformances!=this.oldPerformancesValue){
      this.oldPerformancesValue=this.oldPerformances;
      this.clickOldPerformances = true;
      this.filterEventsGroupByAnyo();       
    }    
  }

  expandAll(){    
    this.expandAnyoMap.forEach((value, key) => {
      this.expandAnyoMap.set(key, true);
    }); 
    this.updateExpandAnyoList();    
  }

  collapseAll(){    
    this.expandAnyoMap.forEach((value, key) => {
      this.expandAnyoMap.set(key, false);
    });
    this.updateExpandAnyoList();    
  }

  getMunicipalityProvinceAndLocation(event: Event): string {
    if (event.location) {
      return `${event.municipality} - ${event.province} (${event.location})`;
    }
    else{
      return `${event.municipality} - ${event.province}`;
    }
  }

  logout(){
    
    this.doDestroy();
    this.userService.logout();
  }

  async viewPerformanceImage(event: Event){    
    if(!event.image){
      this.toast.presentToast("No existe imagen para previsualizar");
    }
    else{
      await this.loadingService.presentLoading('Loading...');    
      this.store.dispatch(new GetEvent({eventType:event.type,eventId: event.id}))
        .subscribe({
          next: async ()=> {
            const finish = this.store.selectSnapshot(EventState.finish);          
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
            
            if(finish){                        
              if(errorStatusCode==200){                                        
                let videoCategory = new VideoCategory();
                videoCategory.name = 'Cartel Actuación';
                videoCategory.image = this.store.selectSnapshot(EventState.event).image;
                
                const modal = await this.modalController.create({
                  component: ModalViewCategoryImageComponent,
                  componentProps: { videoCategory, loadImage: false },
                });

                await modal.present();       
              }
              else{
                this.dismissInitialLoading();                 
              }                                                
            }      
          }
        }
      )
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

  async showFormationRepertoire(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.formationRepertoire( event.type,  event, event.date);                  
  }

  async formationRepertoire(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalFormationEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
  }

  async showEventRoute(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.eventRoute( event.type,  event, event.date);                  
  }

  async eventRoute(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalRouteEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
  }

  async showCrossheadEvent(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.crossheadEvent( event.type,  event, event.date);                  
  }

  async crossheadEvent(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalCrossheadEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
  }

  async showEventAttach(event: Event, userSliding: IonItemSliding){
    // cerramos el sliding 
    if(userSliding){
      userSliding.close();
    }

    // abrimos la modal
    this.eventAttach( event.type,  event, event.date);                  
  }

  async eventAttach(type:string, event: Event, date: string){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalAttachEventComponent,
      componentProps: {
        date: date,
        type: this.translateEventType(type),
        event: event
      }
    });
    modal.present();
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

  async openModalStatsAssintance(){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalStatsComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='cancel'){    
      this.filterEvents(
        this.getFirstDayOfMonth(this.selectedMonthDate),
        this.getLastDayOfMonth(this.selectedMonthDate)
      );   
    }  
  }

  async openModalStatsMarchs(){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalStatsMarchsComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='cancel'){    
      this.filterEvents(
        this.getFirstDayOfMonth(this.selectedMonthDate),
        this.getLastDayOfMonth(this.selectedMonthDate)
      );   
    }  

  }

  toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;
  }


  onImageLoad() {    
    this.imageLoaded = true; // Oculta el loader cuando la imagen termina de cargarse
    this.loading = false;
    this.dismissInitialLoading();    
  }

  async openEventImage(event: any, objectEvent: Event){
    event.stopPropagation(); 

    if(!objectEvent.image){
      this.toast.presentToast("No existe imagen para previsualizar");
    }
    else{      
      let videoCategory = new VideoCategory();
      videoCategory.name = 'Cartel Actuación';
      videoCategory.image = objectEvent.image;

      await this.loadingService.presentLoading('Loading...');    
      const modal = await this.modalController.create({
        component: ModalViewCategoryImageComponent,
        componentProps: { videoCategory, loadImage: false },
      });

      await modal.present();
    }          
  }

  getUbication(event:Event){
    if(event && event.municipality && event.province){
      return event.municipality.trim() + ' (' + event.province.trim() + ')';      
    }
    else{
      return '';
    }
  }
}
