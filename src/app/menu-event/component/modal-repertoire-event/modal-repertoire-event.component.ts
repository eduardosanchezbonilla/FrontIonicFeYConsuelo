import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE, DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { Event } from 'src/app/models/event/event';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';
import { RepertoireEvent } from 'src/app/models/repertoire-event/repertoire-event';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEventRepertoire, ResetEventRepertoire } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { CreateRepertoireEvent, DeleteRepertoireEvent, UpdateRepertoireEventOrderNumbers } from 'src/app/state/repertoire-event/repertoire-event.actions';
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
  public repertoireMarchsOrder: RepertoireMarch[];  
  public repertoireMarchsStats: RepertoireMarch[]; 

  public numbersArray: number[] = [0,1, 2, 3, 4, 5, 6,7,8];
  
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
  public profile: string;  
  public existsRepertoire: boolean = true;
  public existsMarchOrder: boolean = true;

  public selectedSegment: string = 'selection'; // Valor inicial del segmento
  public viewSelection: boolean = true; // Mostrar la vista de selección
  public viewOrder: boolean = false; // Mostrar la vista  
  public viewStats: boolean = false; // Mostrar la vista de selección

  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;    
  public isUpdatingOrder:boolean = false;

  constructor(        
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,    
    private storage: StorageService
  ) { }

  convertDateFormat(dateString: string): string {
    // Divide la cadena en sus partes (año, mes, día)
    const [year, month, day] = dateString.split('-');
    
    // Retorna la fecha en el nuevo formato
    return `${day}-${month}-${year}`;
  }

  async ngOnInit() {
    console.log(this.event);
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
   
    this.profile = await this.storage.getItem('profile');        
    if(this.profile === 'ADMIN' || this.profile === 'SUPER_ADMIN'){
      this.selectedSegment = 'selection';
      this.viewSelection = true;
      this.viewOrder = false;      
      this.viewStats = false;   
      this.isUpdatingOrder = false;  
    }
    else{
      this.selectedSegment = 'order';
      this.viewSelection = false;
      this.viewOrder = true;    
      this.viewStats = false;           
      this.isUpdatingOrder = true;    // para que no se pueda modificar orden
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
            // si el profile es distinto de ADMIN o SUPER_ADMIN, tengo que filtrar solo las marchas que estan asociadas al evento            
            if(this.profile !== 'ADMIN' && this.profile !== 'SUPER_ADMIN'){
              this.eventRepertoire.repertoireMarchGroupByType.forEach(group => {
                group.marchs = group.marchs.filter(march => march.checked);
              });
              // si algun grupo de marchas no tiene ninguna marcha deberiamos eliminarlo
              this.eventRepertoire.repertoireMarchGroupByType = this.eventRepertoire.repertoireMarchGroupByType.filter(group => group.marchs.length > 0);
            }  
            
            this.repertoireMarchsOrder = [];
            this.repertoireMarchsStats = [];
            
            // si no hay repertorio actualizamos la variable existsRepertoire
            if(this.eventRepertoire.repertoireMarchGroupByType.length === 0){
              this.existsRepertoire = false;
              this.existsMarchOrder = false;
            }
            else{
              this.existsRepertoire = true;

              // ahora extraemos todas las marchas existentes y las metemos en un array y lo ordenamos por orden            
              this.eventRepertoire.repertoireMarchGroupByType.forEach(group => {
                group.marchs.forEach(march => {
                  if(march.checked){
                    march.type.image = group.type.image;
                    this.repertoireMarchsOrder.push(march);
                  }
                  march.type.image = group.type.image;                  
                  this.repertoireMarchsStats.push(march);
                });
              });

              if(this.repertoireMarchsOrder.length === 0){
                this.existsMarchOrder = false;
              }
              else{
                this.existsMarchOrder = true;
                // ordenamos por order de marcha y despues pòr orden de categoria
                this.repertoireMarchsOrder.sort((a, b) => {
                  const orderComparison = a.order - b.order;
                  
                  if (orderComparison !== 0) {
                    return orderComparison; // Si son diferentes, devuelve la comparación por order
                  }
                
                  // Si son iguales, ordena por category 
                  return a.category.order-b.category.order;
                });            
              }                               
            }
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
            if(this.viewStats){              
              totals.totalMarch= totals.totalMarch + march.numbers;                  
            }
            else{
              totals.totalMarch++;                   
            }            
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

  async filterRepertoire( showLoading:boolean=true){    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }       
    this.store.dispatch(new GetEventRepertoire({eventType: this.type, eventId: this.event.id}));        
  }

  async onSegmentChanged(event: any) {    
    if(this.viewSelection && event.detail.value==='selection'){
      return;
    }

    if(this.viewOrder && event.detail.value==='order'){
      return;
    }

    if(this.viewStats && event.detail.value==='stats'){
      return;
    }

    if(this.initSearchFinish){
      await this.loadingService.presentLoading('Loading...');
    }

    this.viewSelection = event.detail.value==='selection';
    this.viewOrder = event.detail.value==='order';
    this.viewStats = event.detail.value==='stats';

    if(!this.viewSelection && !this.viewOrder && !this.viewStats){
      this.viewSelection = true;
      this.viewOrder = false;
      this.viewStats = false;
    }

    if(this.initSearchFinish){
      this.filterRepertoire(false);
    }
  }

  async doReorderMarchs(event: any) {
    const fromIndex = event.detail.from;
    const toIndex = event.detail.to;

    // Reordenamos el array
    const movedItem = this.repertoireMarchsOrder.splice(fromIndex, 1)[0];
    this.repertoireMarchsOrder.splice(toIndex, 0, movedItem);

    // Completamos el reorder
    event.detail.complete();
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation(); 
    
    // ahora tenemos que actualizar en la bbdd los ordenes de todas las marchas
    // recorremos el array y vamos pasando el indice como order       
    this.updateMarchOrdersAsync();
  }

  private async updateMarchOrdersAsync() {

    this.isUpdatingOrder = true;

    try {
      // Mostrar el spinner al inicio
      await this.loadingService.presentLoading('Loading...');
             
      // Crear un array de Promises solo para las actualizaciones necesarias
      const updatePromises = this.repertoireMarchsOrder
      .map((march, index) => {
        const newOrder = index + 1;
        if (march.order !== newOrder) {
          // Solo actualizar si el orden ha cambiado
          march.order = newOrder; // Actualiza el orden localmente
          return this.updateEventRepertoireOrder(march, newOrder)
            .then(() => ({ success: true }))
            .catch((error) => ({ success: false, error }));
        } else {
          // Si el orden no ha cambiado, devolver una Promise resuelta
          return Promise.resolve({ success: true });
        }
      });
  
      // Esperar a que todas las Promises finalicen
      const results = await Promise.all(updatePromises);
  
      // Ocultar el spinner cuando todas las actualizaciones hayan terminado
      await this.loadingService.dismissLoading();
  
      // Verificar resultados
      const failedUpdates = results.filter((result) => !result.success);
  
      if (failedUpdates.length === 0) {
        this.toast.presentToast('Orden actualizado correctamente');
      } else {
        this.toast.presentToast(
          `Algunas marchas no se pudieron actualizar. Errores: ${failedUpdates.length}`
        );
      }
    } catch (error) {
      console.error('Error durante la actualización:', error);
      await this.loadingService.dismissLoading();
      this.toast.presentToast('Error inesperado durante la actualización');
    }

    this.isUpdatingOrder = false;
  }


  updateEventRepertoireOrder(march: RepertoireMarch, order: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let repertoireEvent = new RepertoireEvent(
        march.id,
        this.type,
        this.eventRepertoire.event.id,
        true,
        order,
        march.numbers
      );
  
      this.store.dispatch(new UpdateRepertoireEventOrderNumbers({ repertoireEvent }))
        .subscribe({
          next: async () => {
            const success = this.store.selectSnapshot(RepertoireEventState.success);
            if (success) {
              resolve(); // Llamada exitosa, resolvemos la Promise
            } else {
              const errorStatusCode = this.store.selectSnapshot(RepertoireEventState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireEventState.errorMessage);
  
              if (errorStatusCode === 403) {
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              } else {
                this.toast.presentToast(errorMessage);
              }
              reject(new Error('Error al actualizar la marcha'));
            }
          },
          error: (err) => {
            console.error('Error en la actualización:', err);
            reject(err); // Rechazamos la Promise en caso de error
          }
        });
    });
  }

  // En tu archivo .ts
  compareWithFn(o1: any, o2: any): boolean {
    console.log(o1, o2);
    return o1 === o2;
  }

  // Función que maneja el cambio en el ion-select
  onNumberChange(march: RepertoireMarch) {

    if(march.numbers===0){
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
      // actualizamos numbers
      march.checked = true;

      let repertoireEvent = new RepertoireEvent(
        march.id,
        this.type,
        this.eventRepertoire.event.id,
        true,
        march.order,
        march.numbers
      );
      
      this.store.dispatch(new UpdateRepertoireEventOrderNumbers({repertoireEvent:repertoireEvent}))        
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

}
