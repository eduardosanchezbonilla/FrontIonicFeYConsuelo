import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE, DEFAULT_VOICE_IMAGE } from 'src/app/constants/constants';
import { Event } from 'src/app/models/event/event';
import { EventMusicianAssistance } from 'src/app/models/event/event-musician-assistance';
import { MusicianEvent } from 'src/app/models/musician-event/musician-event';
import { Musician } from 'src/app/models/musician/musician';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEventMusicianAssistance, GetEventReportAssistance, ResetEvent, ResetEventMusicianAssistance } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { CreateMusicianEvent, DeleteMusicianEvent } from 'src/app/state/musicien-event/musician-event.actions';
import { MusicianEventState } from 'src/app/state/musicien-event/musician-event.state';
import { ChangeDetectorRef } from '@angular/core';
import { FileManagerService } from 'src/app/services/filemanager/file-manager.service';

@Component({
  selector: 'app-modal-musician-assistance',
  templateUrl: './modal-musician-assistance.component.html',
  styleUrls: ['./modal-musician-assistance.component.scss'],
})
export class ModalMusicianAssistanceComponent implements OnInit {

  @Select(EventState.eventMusicianAssistance)
  eventMusicianAssistance$: Observable<EventMusicianAssistance>;
  eventMusicianAssistanceSubscription: Subscription;
  public eventMusicianAssistance: EventMusicianAssistance;  
  public expandedAccordionValues: string[] = []; //
  
  @Input() event: Event;
  @Input() date: string;
  @Input() type: string;

  public initScreen = false;
  public initSearchFinish = false;  
  public showImage: string;  
  public showTextEvent: string;
  public showDateTextEvent: string;

  public totalBusAssist: number = 0;
  public totalNotBusAssist: number = 0;
  public totalAssist: number = 0;
  public totalNotAssist: number = 0;

  public isChecked : boolean;

  constructor(    
    private cdr: ChangeDetectorRef,
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private fileManagerService: FileManagerService
  ) { }

  convertDateFormat(dateString: string): string {
    // Divide la cadena en sus partes (año, mes, día)
    const [year, month, day] = dateString.split('-');
    
    // Retorna la fecha en el nuevo formato
    return `${day}-${month}-${year}`;
  }

  ngOnInit() {
    this.isChecked = true;
    this.store.dispatch(new ResetEventMusicianAssistance({})).subscribe({ next: async () => { } })        
    this.eventMusicianAssistance = new EventMusicianAssistance();    
    this.totalAssist = 0;
    this.totalNotAssist = 0;
    this.totalBusAssist = 0;
    this.totalNotBusAssist = 0;
    if(this.event.image){
      this.showImage = `data:image/jpeg;base64,${this.event.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_EVENT_IMAGE}`;      
    }   
  
    if(this.type === 'REHEARSAL'){
      this.showTextEvent = this.event.title?this.event.title:"Ensayo General";
      if(this.event.location){
        this.showTextEvent = this.showTextEvent + " (" + this.event.location + ")";
      }
      this.showDateTextEvent = this.convertDateFormat(this.event.date) + " (" + this.event.startTime + " - " + this.event.endTime + ")";
    }
    else {
      this.showTextEvent = this.event.title;
      if(this.event.municipality){
        this.showTextEvent = this.showTextEvent + " (" + this.event.municipality + ")";
      }
      this.showDateTextEvent = this.convertDateFormat(this.event.date) + " (" + this.event.startTime + " - " + this.event.endTime + ")";
    }   
   
    this.store.dispatch(new GetEventMusicianAssistance({eventType: this.type, eventId: this.event.id}));
    this.getEventMusicianAssistance();   
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
    if (this.eventMusicianAssistanceSubscription) {      
      this.eventMusicianAssistanceSubscription.unsubscribe();  
    }        
    this.eventMusicianAssistance = null;    
    this.store.dispatch(new ResetEventMusicianAssistance({})).subscribe({ next: async () => { } })    
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getEventMusicianAssistance(){
    this.eventMusicianAssistanceSubscription = this.eventMusicianAssistance$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(EventState.finish)        
        if(finish){          
          this.eventMusicianAssistance = this.store.selectSnapshot(EventState.eventMusicianAssistance);                     
          this.initSearchFinish = true;    
          if(this.eventMusicianAssistance){
            this.expandedAccordionValues = this.eventMusicianAssistance.musiciansGroupByVoice.map(group => group.voice.id+"");                
            this.calculateTotalAssist();            
          }
          this.dismissInitialLoading();              
        }
      }
    })
  }

  // Definimos la función para contar asistentes y no asistentes
  calculateTotalAssist() {    
    const { totalAssist, totalNotAssist, totalBusAssist, totalNotBusAssist } = this.eventMusicianAssistance.musiciansGroupByVoice.reduce(
      (totals, group) => {
        group.musicians.forEach(musician => {          
          if (musician.assistLastRehearsal) {            
            totals.totalAssist++;
            if(musician.assistBus){
              totals.totalBusAssist++;
            }
            else{
              totals.totalNotBusAssist++;
            }
          } else {            
            totals.totalNotAssist++;
          }          
        });
        return totals;
      },
      { totalAssist: 0, totalNotAssist: 0 , totalBusAssist:0, totalNotBusAssist:0} // Valores iniciales
    );

    this.totalAssist = totalAssist;
    this.totalNotAssist = totalNotAssist; 
    this.totalBusAssist = totalBusAssist;
    this.totalNotBusAssist = totalNotBusAssist;   
  }

  updateEventMusicianAssistance(musician: Musician){            
    // si es ensayo directamente actualizamos
    if(this.type === 'REHEARSAL'){
      this.doUpdateEventMusicianAssistance(musician, false);     
    }
    else{ 
      // actuacion

      // si estamos eliminando asistencia
      if(musician.assistLastRehearsal){
        // eliminamos asistencia
        this.doUpdateEventMusicianAssistance(musician, false);     
      }
      else{        
        // si estamos marcando asistir
        if(!this.event.displacementBus){
          this.doUpdateEventMusicianAssistance(musician, false);     
        }              
      }      
    }    
  }

  doUpdateEventMusicianAssistance(musician: Musician, bus: boolean){
    if(musician.assistLastRehearsal){
      // eliminamos
      musician.assistLastRehearsal = false;

      let musicianEvent = new MusicianEvent(
        musician.id,
        this.type,
        this.eventMusicianAssistance.event.id,
        musician.assistLastRehearsal,
        bus
      ); 
      
      this.store.dispatch(new DeleteMusicianEvent({musicianEvent: musicianEvent}))
        .subscribe({
          next: async () => {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              //this.toast.presentToast("Ensayo actualizado correctamente");              
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
            this.calculateTotalAssist();        
          }
        }
      )
    }
    else{      
      // asociamos
      musician.assistLastRehearsal = true;
      let musicianEvent = new MusicianEvent(
        musician.id,
        this.type,
        this.eventMusicianAssistance.event.id, 
        musician.assistLastRehearsal,
        bus
      ); 
      
      this.store.dispatch(new CreateMusicianEvent({musicianEvent: musicianEvent}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              //this.toast.presentToast("Ensayo actualizado correctamente");                        
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
            } 
            this.calculateTotalAssist();                 
          }
        }
      )    
    }    
  }
  
  onSegmentAssistChanged(musician: Musician,event:any){
    if(event.detail.value==='notAssist'){
      this.doUpdateEventMusicianAssistanceSegment(musician, false, false);    
    }
    if(event.detail.value==='assistBus'){
      this.doUpdateEventMusicianAssistanceSegment(musician, true, true);    
    }
    if(event.detail.value==='assistNotBus'){
      this.doUpdateEventMusicianAssistanceSegment(musician, true, false);    
    }
  }

  doUpdateEventMusicianAssistanceSegment(musician: Musician, assist:boolean, bus: boolean){
    if(!assist){    
      
      musician.assistLastRehearsal = false;
      musician.assistBus = bus;

      let musicianEvent = new MusicianEvent(
        musician.id,
        this.type,
        this.eventMusicianAssistance.event.id,
        musician.assistLastRehearsal,
        bus
      ); 
      
      this.store.dispatch(new DeleteMusicianEvent({musicianEvent: musicianEvent}))
        .subscribe({
          next: async () => {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              //this.toast.presentToast("Ensayo actualizado correctamente");              
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
            this.calculateTotalAssist();        
          }
        }
      )
    }
    else{      

      musician.assistLastRehearsal = true;
      musician.assistBus = bus;

      // asociamos      
      let musicianEvent = new MusicianEvent(
        musician.id,
        this.type,
        this.eventMusicianAssistance.event.id, 
        musician.assistLastRehearsal,
        bus
      ); 
      
      this.store.dispatch(new CreateMusicianEvent({musicianEvent: musicianEvent}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              //this.toast.presentToast("Ensayo actualizado correctamente");                        
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
            } 
            this.calculateTotalAssist();                 
          }
        }
      )    
    }    
  }

  getSegmentValue(musician: any): string {
    
    if (musician.assistLastRehearsal && musician.assistBus) {      
      return 'assistBus';
    }
    if (musician.assistLastRehearsal && !musician.assistBus) {      
      return 'assistNotBus';
    }    
    return 'notAssist';
  }

  trackByMusicianFn(index, musician) {        
    return musician.id; // Utiliza un identificador único de tu elemento
  }

  trackByVoiceFn(index, musicianGroupByVoice) {        
    return musicianGroupByVoice.voice.id; // Utiliza un identificador único de tu elemento
  }

  async showAssiatanceInfo(){
    await this.loadingService.presentLoading('Loading...');

    this.store.dispatch(new GetEventReportAssistance({eventType: this.type, eventId: this.event.id}))
        .subscribe({
          next: async () => {
            const finish = this.store.selectSnapshot(EventState.finish)        
            if(finish){       
              
              const success = this.store.selectSnapshot(EventState.success);
              if(success){
                let eventReportAssistance = this.store.selectSnapshot(EventState.eventReportAssistance);  
                this.fileManagerService.showFile(this.event.id+".pdf", eventReportAssistance.report);           
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
              }  
              await this.loadingService.dismissLoading();                              
            }              
          }
        }
      )
  }
}
