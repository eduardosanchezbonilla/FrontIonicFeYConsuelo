import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, PopoverController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE } from 'src/app/constants/constants';
import { CrossheadEvent } from 'src/app/models/crosshead-event/crosshead-event';
import { Event } from 'src/app/models/event/event';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetEventCrosshead, GetEventRepertoire, ResetEventRepertoire, UpdateEventCrosshead } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { MarchSelectorComponent } from './march-selector.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Share } from '@capacitor/share';
import { CaptureService } from 'src/app/services/capture/capture.service';

@Component({
  selector: 'app-modal-crosshead-event',
  templateUrl: './modal-crosshead-event.component.html',
  styleUrls: ['./modal-crosshead-event.component.scss'],
})
export class ModalCrossheadEventComponent implements OnInit {

  @Select(EventState.eventRepertoire)
  eventRepertoire$: Observable<EventRepertoire>;
  eventRepertoireSubscription: Subscription;
  public eventRepertoire: EventRepertoire;  
  marchs: RepertoireMarch[] = [];

  @Select(EventState.crossheadEvent)
  crossheadEvent$: Observable<CrossheadEvent>;
  crossheadEventSubscription: Subscription;
  public crossheadEvent: CrossheadEvent;  

  @Input() event: Event;
  @Input() date: string;
  @Input() type: string;

  public initScreen = false;
  public initSearchFinish = false;  
  public initSearchCrossheadFinish = false;
  public showImage: string;  
  public showTextEvent: string;
  public showDateTextEvent: string;

  public totalMarch: number = 0;    
  public profile: string;  

  public editMode = false;

  public loadFinish = false;
  public existstCrosshead = false;


  constructor(        
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,    
    private storage: StorageService,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private captureService: CaptureService
    ) { }

  convertDateFormat(dateString: string): string {
    // Divide la cadena en sus partes (año, mes, día)
    const [year, month, day] = dateString.split('-');
    
    // Retorna la fecha en el nuevo formato
    return `${day}-${month}-${year}`;
  }

  async ngOnInit() {   
    
    this.initScreen = false;
    this.initSearchFinish = false;  
    this.initSearchCrossheadFinish = false;
    this.editMode = false;
    this.loadFinish = false;
    this.existstCrosshead = false;

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
      this.showTextEvent = this.event.title.trim();
      if(this.event.municipality){
        this.showTextEvent = this.showTextEvent + " (" + this.event.municipality.trim() + ")";
      }
      this.showDateTextEvent = this.convertDateFormat(this.event.date) + " (" + this.event.startTime + " - " + this.event.endTime + ")";
    }   
    
    this.profile = await this.storage.getItem('profile');    
    
    /*if(this.profile === 'ADMIN' || this.profile === 'SUPER_ADMIN'){
      this.editMode = true;
    }
    else{
      this.editMode = false;
    }*/
    
    if(this.profile === 'ADMIN' || this.profile === 'SUPER_ADMIN'){
      this.store.dispatch(new GetEventRepertoire({eventType: this.type, eventId: this.event.id}));    
      this.getEventRepertoire();   
    }
    else{
      this.initSearchFinish = true;  
    }

    this.store.dispatch(new GetEventCrosshead({eventType: this.type, eventId: this.event.id}));    
    this.getCrossheadEvent();   
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish && this.initSearchCrossheadFinish){
      this.loadFinish    = true;
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
    if (this.crossheadEventSubscription) {      
      this.crossheadEventSubscription.unsubscribe();  
    }      
    this.eventRepertoire = null;    
    this.store.dispatch(new ResetEventRepertoire({})).subscribe({ next: async () => { } })        
    this.crossheadEvent = null;    
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getEventRepertoire(){
    this.eventRepertoireSubscription = this.eventRepertoire$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(EventState.finish)        
        const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode)        
        const errorMessage = this.store.selectSnapshot(EventState.errorMessage)        
        if(finish){       
          this.initSearchFinish = true;  
          if(errorStatusCode==200){          
            this.eventRepertoire = this.store.selectSnapshot(EventState.eventRepertoire);            
            
            // ahora extraemos todas las marchas existentes y las metemos en un array y lo ordenamos por orden            
            this.marchs = [];

            if(this.eventRepertoire && this.eventRepertoire.repertoireMarchGroupByType){
              this.eventRepertoire.repertoireMarchGroupByType.forEach(group => {
                group.marchs.forEach(march => {                  
                  march.type.image = group.type.image;                  
                  this.marchs.push(march);
                });
              });
            }                          
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

  checkIsCrosshead(){
    if(!this.crossheadEvent.streets ||
      this.crossheadEvent.streets.length == 0 ||
      this.crossheadEvent.streets.length == 1 && (!this.crossheadEvent.streets[0].street || this.crossheadEvent.streets[0].street == '')
    ) {              
      this.existstCrosshead = false;
    }
    else{
      this.existstCrosshead = true;
    }
  }

  getCrossheadEvent(){
    this.crossheadEventSubscription = this.crossheadEvent$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(EventState.finish)        
        const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode)        
        const errorMessage = this.store.selectSnapshot(EventState.errorMessage)                
        if(finish){       
          this.initSearchCrossheadFinish = true;            
          if(errorStatusCode==200){          
            this.crossheadEvent = this.store.selectSnapshot(EventState.crossheadEvent);                  
            
            if(!this.crossheadEvent.streets) {              
              this.crossheadEvent.streets = [];
            }
            else{
              //this.existstCrosshead = true;
              // actualizamos el campo isAnnotations de cada street
              this.crossheadEvent.streets.forEach(street => {
                if(street.annotations && street.annotations.length > 0){
                  street.annotationsView = street.annotations.replaceAll('\n','<br/>' );
                  street.isAnnotations = true;
                }
                else{
                  street.isAnnotations = false;
                }
              });
            }            
        
            if(this.crossheadEvent.streets.length == 0){
              this.addStreet();
            }                          
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
          this.checkIsCrosshead();
          this.dismissInitialLoading();              
        }
      }
    })
  }

  async confirm(){
    // recorremos todos los calles y marchas, para ir actualizando el orden, acorde a la posicion en el array
    // tambien actualizamos las anotaciones, limpiando si el check no esta marcado
    this.crossheadEvent.streets.forEach((street, index) => {      
      street.streetOrder = index + 1;
      if(!street.isAnnotations){
        street.annotations = '';
      }
      if(street.marchs && street.marchs.length > 0){
        street.marchs.forEach((march, idx) => {
          march.marchOrder = idx + 1;
        });
      }      
    });
    
    await this.loadingService.presentLoading('Loading...');   

    this.checkIsCrosshead();
        
    this.store.dispatch(new UpdateEventCrosshead({eventType: this.type, eventId: this.event.id, crossheadEvent: this.crossheadEvent}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Cruceta actualizada correctamente");                   
            await this.loadingService.dismissLoading();      
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(EventState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();      
              this.cancel();         
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              await this.loadingService.dismissLoading();      
              this.toast.presentToast(errorMessage);
            }                
          }          
        }
      }
    )  
  }

  // Añadir un solo
  addStreet() {
    this.crossheadEvent.streets.push({
      id: null,
      //street: 'Calle '+ (this.crossheadEvent.streets.length + 1),
      street: '',
      streetOrder: this.crossheadEvent.streets.length + 1,      
      annotations: '',
      annotationsView: '',
      isAnnotations: false,
      marchs: [],      
    });
  }

  // Eliminar solo
  async removeStreet(index: number) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la calle?',
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
              this.crossheadEvent.streets.splice(index, 1);              
            }
          }
        ]
    });
    alert.present();      
  }

  // Abre un modal o popover para seleccionar músicos (simplificado)
  async openSelectMarchsModal(streetIndex: number) {
    const popover = await this.popoverController.create({
      component: MarchSelectorComponent,
      componentProps: {
        marchs: this.marchs,
      },
      event: event, // Posición relativa al evento del clic
      translucent: true,
    });

    popover.onDidDismiss().then((data) => {      
      if (data.data) {        
        const selectedMarch = { marchId: data.data.id, marchName: data.data.name};                  
        this.addSelectedMarch(streetIndex, selectedMarch);
      }
    });

    return await popover.present();
  }

  addSelectedMarch(streetIndex: number, march: any) {
    const street = this.crossheadEvent.streets[streetIndex];
    if(!street.marchs){
      street.marchs = [];
    }
    street.marchs.push({
      id: null,
      marchId: march.marchId,
      marchName: march.marchName,
      marchOrder: street.marchs.length + 1,
      annotations: ''
    });
  }

  // Eliminar solista principal
  async removeMarch(streetIndex: number, marchIndex: number) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la marcha?',
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
              const street = this.crossheadEvent.streets[streetIndex];
              street.marchs.splice(marchIndex, 1);
              this.updateMarchrOrders(streetIndex);
            }
          }
        ]
    });
    alert.present();          
  }

  updateMarchrOrders(streetIndex: number) {
    const street = this.crossheadEvent.streets[streetIndex];
    street.marchs.forEach((march, index) => {
      march.marchOrder = index + 1;
    });
  }

  reorderMarchs(event: any, streetIndex: number) {
    const street = this.crossheadEvent.streets[streetIndex];
    const itemToMove = street.marchs.splice(event.detail.from, 1)[0];
    street.marchs.splice(event.detail.to, 0, itemToMove);
    // Actualizamos el orden según la posición en la lista
    street.marchs.forEach((march, idx) => {
      march.marchOrder = idx + 1;
    });
    event.detail.complete();
  }

  drop(event: CdkDragDrop<any[]>) {
    const newOrder = [...this.crossheadEvent.streets]; // Clonar el array
    moveItemInArray(newOrder, event.previousIndex, event.currentIndex);
    this.crossheadEvent.streets = newOrder; // Asignar el nuevo array  
  }

  trackByStreet(index: number, item: any): number {
    return item.order; // O cualquier propiedad única de la calle
  }

  onEditMode(event: any){    
    this.crossheadEvent.streets.forEach((street, index) => {      
      if(street.annotations && street.annotations.length > 0){
        street.annotationsView = street.annotations.replaceAll('\n','<br/>' );       
      }
      if(!street.isAnnotations){
        street.annotations = '';
      }      
    });       
  }

  onAnnotationsClick(event: any){    
    ;       
  }

  subrayar(texto: string): string {
    // Separar en caracteres y añadir el combining low line tras cada uno
    return texto
      .split('')
      .map(char => char + '\u0332')           
      .join('');
  }

  async shareWhatsApp() {
    try {
      if(this.existstCrosshead && this.crossheadEvent && this.crossheadEvent.streets){
        let message = '*'+this.showTextEvent.trim()+'*';
        message = message + '\n\n';
        this.crossheadEvent.streets.forEach(street => {
          message = message + '*'+street.street.trim()+'*' + '\n';
          if(street.isAnnotations){
            message = message + '_' + this.subrayar('Anotaciones') + '_'+ ': ' + '\n';            
            message = message  + street.annotations + '\n';
          }          
          if(street.marchs && street.marchs.length>0){
            message = message + '_' + this.subrayar('Marchas') + '_'+ ': ' + '\n';            
            street.marchs.forEach(march => {
              message = message + '• ' + march.marchName + '\n';
            });
          }
          message = message + '\n';
        });
        await Share.share({
          title: 'Cruceta Actuación',
          text: message,
          dialogTitle: 'Compartir Cruceta' // Título en el diálogo de compartir
        });
      }
      else{
        this.toast.presentToast("No hay datos para compartir");
      }
    } catch (error) {
      this.toast.presentToast("Error al compartir: " + error);
    }
  }

  @ViewChild(IonContent, { static: false }) content: IonContent;
  public isCapturing = false;
  
  async downloadCrosshead() {
    try {
      this.editMode = false;
      this.isCapturing = true;   
      await this.loadingService.presentLoading('Loading...');                
      await this.captureService.capture(this.content, 'capture', 'capturaCrosshead.png',100,75);      
    } catch (error) {     
      this.toast.presentToast('Error al capturar y compartir la imagen: ' + error);       
    } finally {
      this.isCapturing = false;
      await this.loadingService.dismissLoading();   
    }    
  }
}
