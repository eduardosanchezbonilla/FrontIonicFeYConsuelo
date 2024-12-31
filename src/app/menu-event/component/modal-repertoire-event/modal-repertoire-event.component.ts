import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE } from 'src/app/constants/constants';
import { Event } from 'src/app/models/event/event';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';
import { RepertoireEvent } from 'src/app/models/repertoire-event/repertoire-event';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEventRepertoire, ResetEventRepertoire } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { CreateRepertoireEvent, DeleteRepertoireEvent } from 'src/app/state/repertoire-event/repertoire-event.actions';
import { RepertoireEventState } from 'src/app/state/repertoire-event/repertoire-event.state';

@Component({
  selector: 'app-modal-repertoire-event',
  templateUrl: './modal-repertoire-event.component.html',
  styleUrls: ['./modal-repertoire-event.component.scss'],
})
export class ModalRepertoireEventComponent implements OnInit {

  @Select(EventState.eventRepertoire)
  eventRepertoire$: Observable<EventRepertoire>;
  eventRepertoireSubscription: Subscription;
  public eventRepertoire: EventRepertoire;  
  public expandedAccordionValues: string[] = []; 
  
  @Input() event: Event;
  @Input() date: string;
  @Input() type: string;

  public initScreen = false;
  public initSearchFinish = false;  
  public showImage: string;  
  public showTextEvent: string;
  public showDateTextEvent: string;

  public totalMarch: number = 0;  

  public isChecked : boolean;

  constructor(        
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,
    private alertController: AlertController
  ) { }

  convertDateFormat(dateString: string): string {
    // Divide la cadena en sus partes (año, mes, día)
    const [year, month, day] = dateString.split('-');
    
    // Retorna la fecha en el nuevo formato
    return `${day}-${month}-${year}`;
  }

  ngOnInit() {
    this.isChecked = true;
    this.store.dispatch(new ResetEventRepertoire({})).subscribe({ next: async () => { } })        
    this.eventRepertoire = new EventRepertoire();    
    this.totalMarch = 0;
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
   
    this.store.dispatch(new GetEventRepertoire({eventType: this.type, eventId: this.event.id}));    
    this.getEventRepertoire();   
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
    if (this.eventRepertoireSubscription) {      
      this.eventRepertoireSubscription.unsubscribe();  
    }        
    this.eventRepertoire = null;    
    this.store.dispatch(new ResetEventRepertoire({})).subscribe({ next: async () => { } })    
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getEventRepertoire(){
    this.eventRepertoireSubscription = this.eventRepertoire$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(EventState.finish)        
        if(finish){          
          this.eventRepertoire = this.store.selectSnapshot(EventState.eventRepertoire);                     
          this.initSearchFinish = true;    
          if(this.eventRepertoire){
            this.expandedAccordionValues = this.eventRepertoire.repertoireMarchGroupByType.map(group => group.type.id+"");                
            this.calculateTotalMarchs();            
          }
          this.dismissInitialLoading();              
        }
      }
    })
  }

  // Definimos la función para contar asistentes y no asistentes
  calculateTotalMarchs() {    
    const { totalMarch} = this.eventRepertoire.repertoireMarchGroupByType.reduce(
      (totals, type) => {
        type.marchs.forEach(march => {  
          if(march.checked){
            totals.totalMarch++;                  
          }
        });
        return totals;
      },
      { totalMarch: 0}
    );

    this.totalMarch = totalMarch;    
  }

  updateEventRepertoire(march: RepertoireMarch){            
    if(march.checked){
      // eliminamos
      march.checked = false;

      let repertoireEvent = new RepertoireEvent(
        march.id,
        this.type,
        this.eventRepertoire.event.id,
        march.checked
      ); 
      
      this.store.dispatch(new DeleteRepertoireEvent({repertoireEvent: repertoireEvent}))
        .subscribe({
          next: async () => {
            const success = this.store.selectSnapshot(RepertoireEventState.success);
            if(success){
              //this.toast.presentToast("Marcha actualizada correctamente");              
            }
            else{             
              const errorStatusCode = this.store.selectSnapshot(RepertoireEventState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireEventState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }    
              await this.loadingService.dismissLoading();      
            }  
            this.calculateTotalMarchs();        
          }
        }
      )
    }
    else{      
      // asociamos
      march.checked = true;

      let repertoireEvent = new RepertoireEvent(
        march.id,
        this.type,
        this.eventRepertoire.event.id,
        march.checked
      ); 
      
      this.store.dispatch(new CreateRepertoireEvent({repertoireEvent:repertoireEvent}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(RepertoireEventState.success);
            if(success){
              //this.toast.presentToast("Marcha actualizada correctamente");                        
            }
            else{              
              const errorStatusCode = this.store.selectSnapshot(RepertoireEventState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireEventState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }                 
            } 
            this.calculateTotalMarchs();                 
          }
        }
      )    
    }    
  }
  
  trackByMarchFn(index, march) {        
    return march.id; // Utiliza un identificador único de tu elemento
  }

  trackByTypeFn(index, repertoireMarchGroupByType) {        
    return repertoireMarchGroupByType.type.id; // Utiliza un identificador único de tu elemento
  }
}
