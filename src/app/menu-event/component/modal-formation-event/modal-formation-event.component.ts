import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController, PopoverController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Formation, MusicianSlot, Row } from 'src/app/models/formation-event/formation-event-dto';
import { Musician } from 'src/app/models/musician/musician';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventState } from 'src/app/state/event/event.state';
import { EventMusicianAssistance } from 'src/app/models/event/event-musician-assistance';
import { GetEventMusicianFormation, ResetEventMusicianAssistance, UpdateEventFormation } from 'src/app/state/event/event.actions';
import { Event } from 'src/app/models/event/event';
import { MusicianSelectorComponent } from './musician-selector.component';
import { DEFAULT_EVENT_IMAGE, DEFAULT_FAKE_MUSICIAN_IMAGE, DEFAULT_MUSICIAN_IMAGE } from 'src/app/constants/constants';
import { UpdateEventFormationRequestDto } from 'src/app/models/formation-event/update-event-formation-request-dto';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CaptureService } from 'src/app/services/capture/capture.service';

@Component({
  selector: 'app-modal-formation-event',
  templateUrl: './modal-formation-event.component.html',
  styleUrls: ['./modal-formation-event.component.scss'],
})
export class ModalFormationEventComponent implements OnInit {

  @Input() event: Event;
  @Input() date: string;
  @Input() type: string;

  public initScreen = false;
  public initSearchFinish = false;
  public showImage: string;  
  public showTextEvent: string;
  public showDateTextEvent: string;
  public profile: string;  
  public isDraggingDisabled = false;

  public defaultRows = 10;
  public defaultMusiciansPerRow = 5;  

  formation: Formation = { rows: [] };
  allMusicians: Musician[] = [];
  availableMusicians: Musician[] = [];
  existsFormation = false;

  @Select(EventState.eventMusicianAssistance)
  eventMusicianAssistance$: Observable<EventMusicianAssistance>;
  eventMusicianAssistanceSubscription: Subscription;
  public eventMusicianAssistance: EventMusicianAssistance;  

  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;

  private fakeMusicianCounter = -1;

  public isCapturing = false;

  constructor(
      private store:Store,
      private modalController: ModalController,
      private loadingService: LoadingService,      
      private toast:ToastService,         
      private userService: UsersService,
      private popoverController: PopoverController,
      private storage: StorageService,
      private alertController: AlertController,      
      private captureService: CaptureService
    ) { }

    convertDateFormat(dateString: string): string {
      // Divide la cadena en sus partes (año, mes, día)
      const [year, month, day] = dateString.split('-');
      
      // Retorna la fecha en el nuevo formato
      return `${day}-${month}-${year}`;
    }

  async ngOnInit() {  
    this.existsFormation = true;
    this.profile = await this.storage.getItem('profile');       
    
    if(this.profile === 'SUPER_ADMIN' || this.profile === 'ADMIN'){
      this.isDraggingDisabled = false;
    }
    else{
      this.isDraggingDisabled = true;
    }
    
    this.store.dispatch(new ResetEventMusicianAssistance({})).subscribe({ next: async () => { } })                     
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

    this.store.dispatch(new GetEventMusicianFormation({eventType: this.type, eventId: this.event.id}));
    this.getEventMusicianAssistance();       
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish ){
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
    console.log("ngOnDestroy formation event");
    if (this.eventMusicianAssistanceSubscription) {      
      this.eventMusicianAssistanceSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetEventMusicianAssistance({})).subscribe({ next: async () => { } })    
  }  

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getEventMusicianAssistance(){
    this.eventMusicianAssistanceSubscription = this.eventMusicianAssistance$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(EventState.finish)               
        if(finish){              
          const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(EventState.errorMessage);             
          if(errorStatusCode==200){        
            this.eventMusicianAssistance = this.store.selectSnapshot(EventState.eventMusicianAssistance);                     
            this.initSearchFinish = true;    
            if(this.eventMusicianAssistance){
              this.allMusicians = this.eventMusicianAssistance.musiciansGroupByVoice
                                        .flatMap(musicianGroupByVoice => musicianGroupByVoice.musicians)
                                        .filter(musician => musician.assistLastRehearsal);
              this.availableMusicians = this.eventMusicianAssistance.musiciansGroupByVoice
                                        .flatMap(musicianGroupByVoice => musicianGroupByVoice.musicians)
                                        .filter(musician => musician.assistLastRehearsal);                                                                         
            }            
            this.dismissInitialLoading();    
          }
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          } 
          this.loadFormation();         
          // ahora meto en los array un musico ficticio
          this.insertFakeMusicianInArray();

        }
      }
    })
  }

  insertFakeMusicianInArray(){    
    
      // miramos cuantos musicos ficticios hay, para asi inicializar la variable fakeMusicianCounter = -1
      // mas bien, no cuantos hay, sino el menor id negativo que hay
      let minAll=null;
      let fakeMusicianIds = this.allMusicians.filter(musician => musician.id<0).map(musician => musician.id);
      if(fakeMusicianIds.length>0){
        this.fakeMusicianCounter = Math.min(...fakeMusicianIds);
        minAll=Math.min(...fakeMusicianIds);        
      }
      let minAvailable=null;
      let fakeAvailableMusician = this.availableMusicians.filter(musician => musician.id<0).map(musician => musician.id);
      if(fakeAvailableMusician.length>0){
        minAvailable=Math.min(...fakeAvailableMusician);
      }
      let addFake=false;
      if(minAll===null && minAvailable===null){
        this.fakeMusicianCounter = -1;
        addFake=true;
      }
      if(minAll===null && minAvailable!==null){        
        addFake=false;
      }
      if(minAll!==null && minAvailable===null){        
        this.fakeMusicianCounter = minAll -1;
        addFake=true;
      }
      if(minAll!==null && minAvailable!==null){        
        addFake=false;
      }
      
      if(addFake){        
         // ahora meto en los array un musico ficticio
         let fakeMusician = new Musician();
         fakeMusician.id = this.fakeMusicianCounter;
         fakeMusician.name = "Hueco";
         fakeMusician.surname = "";
         fakeMusician.image = DEFAULT_FAKE_MUSICIAN_IMAGE;
         // lo insertamos al principio de los arrays
         this.allMusicians.unshift(fakeMusician);
         this.availableMusicians.unshift(fakeMusician);
      }     

      // si hay varios en availableMusicians con id negativo, me tengo que quedar solo con uno, con el de mayor id negativo
      let fakeAvailableMusicianIds = this.availableMusicians.filter(musician => musician.id<0).map(musician => musician.id);
      if(fakeAvailableMusicianIds.length>1){
        let maxFakeAvailableMusicianId = Math.max(...fakeAvailableMusicianIds);
        this.availableMusicians = this.availableMusicians.filter(musician => musician.id>=0 || musician.id===maxFakeAvailableMusicianId);
      }
      
  }

  loadFormation() {
    // la formacion actual son los musician que tienen informado positionFormationX y positionFormationY
    let musiciansCurrentFormation = this.allMusicians.filter(musician => musician.formationPositionX>=0 && musician.formationPositionY>=0);
    
    // si esta vacio, ponemos filas vacias, sino cargamos la formacion
    if (musiciansCurrentFormation.length === 0) {
      this.existsFormation = false;
      this.addRow(1);
      for(let i=0; i<this.defaultRows; i++){
        this.addRow(this.defaultMusiciansPerRow);
      }
    } else {
      this.existsFormation = true;
      const maxX = Math.max(...musiciansCurrentFormation.map(musician => musician.formationPositionX));
      const maxY = Math.max(...musiciansCurrentFormation.map(musician => musician.formationPositionY));

      // tenemos que ordenar los musiciansCurrentFormation por y e x
      musiciansCurrentFormation = musiciansCurrentFormation.sort((a, b) => {
        if (a.formationPositionY === b.formationPositionY) {
          return a.formationPositionX - b.formationPositionX;
        }
        return a.formationPositionY - b.formationPositionY;
      });

      // ahora recorremos y vamos creando filas conforme la formationPositionY vaya cambiando, si entre medias hay filas vacias las dibujo con el maximo deX que exista
      for(let row=0; row<=maxY; row++){
        // dibujamos todos los musicos de esta fila
        let musiciansRow = musiciansCurrentFormation.filter(musician => musician.formationPositionY === row);        

        if(musiciansRow.length==0){
          this.addRow(maxX+1);
        }
        else{
          // cogemos el maximo de x de esta fila
          let maxXRow = Math.max(...musiciansRow.map(musician => musician.formationPositionX));
          this.addRow(maxXRow+1);
        }
      }

      // ahora colocamos a los musicos que tienen informada la posicion
      musiciansCurrentFormation.forEach(musician => {
        this.formation.rows[musician.formationPositionY].musicians[musician.formationPositionX].musician = musician;
      });
    }    
    this.updateAvailableMusicians();
  }

  addRow(musiciansCount: number) {
    let musicianSlotArray: MusicianSlot[] = [];
    for(let i=0; i<musiciansCount; i++){
      let musicianSlot = new MusicianSlot();
      musicianSlot.id = this.formation.rows.length*100 + i;
      musicianSlotArray.push(musicianSlot);      
    }
    const newRow: Row = {
      id: this.formation.rows.length,
      musicians: musicianSlotArray // Inicializar con un músico slot vacío
    };
    this.formation.rows.push(newRow);    
    this.updateAvailableMusicians();
  }

  addRowPosition(index, musiciansCount: number) {
    // este metodo debe hacer lo mismo que hace el addRow, pero metiendo la fila en la posicion que dice index+1
    let musicianSlotArray: MusicianSlot[] = [];
    for(let i=0; i<musiciansCount; i++){
      let musicianSlot = new MusicianSlot();
      musicianSlot.id = index*100 + i;
      musicianSlotArray.push(musicianSlot);      
    }
    const newRow: Row = {
      id: index,
      musicians: musicianSlotArray // Inicializar con un músico slot vacío
    };
    this.formation.rows.splice(index+1, 0, newRow);

    // actualizamos todos los id de row con el index que le corresponde
    this.formation.rows.forEach((row, index) => {
      row.id = index;
    });
  }

  addMusicianToRow(row: Row) {
    let musicianSlot = new MusicianSlot();
    musicianSlot.id = row.id*100 + row.musicians.length ;
    row.musicians.push(musicianSlot);    
  }

  async removeRow(rowId: number) {
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
            this.formation.rows = this.formation.rows.filter(row => row.id !== rowId);    
            this.updateAvailableMusicians();
          }
        }
      ]
    });
    alert.present();    
  }
  
  async removeMusicianFromRow(row: Row, slotId: number) {
    const slot = row.musicians.find(s => s.id === slotId);
    const alert = await this.alertController.create({
      header: 'Eliminar',      
      inputs: [
        {
          name: 'deleteMusician',
          type: 'radio',
          label: 'Músico',
          value: 'DELETE_MUSICIAN',
          checked: slot.musician !== undefined, 
          disabled: (!slot.musician), 
        },
        {
          name: 'deleteSlot',
          type: 'radio',
          label: 'Slot',
          value: 'DELETE_SLOT',
          checked: !slot.musician, 
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            ; 
          },
        },
        {
          text: 'OK',
          handler: (selectedType) => {      
            if('DELETE_MUSICIAN'===selectedType){ 
              const slot = row.musicians.find(s => s.id === slotId);
              if (slot && slot.musician) {
                // Desasigna el músico antes de eliminar el slot                
                slot.musician = undefined;
                this.updateAvailableMusicians();
              }              
              //row.musicians = row.musicians.filter(s => s.id !== slotId);    
            }
            if('DELETE_SLOT'===selectedType){ 
              const slot = row.musicians.find(s => s.id === slotId);
              if (slot && slot.musician) {
                // Desasigna el músico antes de eliminar el slot
                slot.musician = undefined;
                this.updateAvailableMusicians();
              }
              row.musicians = row.musicians.filter(s => s.id !== slotId);  
            }            
          },
        },
      ],
    });  
    await alert.present();      
  }
  
  async selectMusician(slot: MusicianSlot) {       
    if(this.availableMusicians && this.availableMusicians.length>0){    
      const popover = await this.popoverController.create({
        component: MusicianSelectorComponent,
        componentProps: {
          musicians: this.availableMusicians,
        },
        event: event, // Posición relativa al evento del clic
        translucent: true,
      });
    
      popover.onDidDismiss().then((data) => {
        if (data.data) {
          slot.musician = data.data;          
          this.updateAvailableMusicians();
        }
      });
    
      return await popover.present();
    }
    else{
      this.toast.presentToast("No quedan músicos disponibles para posicionar");   
    }
  }
      
  updateAvailableMusicians() {
    const assignedMusicianIds = this.formation.rows.flatMap(row => row.musicians)
      .filter(slot => slot.musician)
      .map(slot => slot.musician!.id);
    this.availableMusicians = this.allMusicians.filter(musician => !assignedMusicianIds.includes(musician.id));

    this.insertFakeMusicianInArray();
  }

  trackByRowId(index: number, row: Row): number {
    return row.id;
  }

  trackBySlotId(index: number, slot: MusicianSlot): number {    
    return slot.id;
  }
  
  async saveFormation(){
    let updateEventFormationRequestDto = new UpdateEventFormationRequestDto();
    updateEventFormationRequestDto.musicians = []

    // recoremos todas las filas y columnas, y guardamos la posicion de los musicos
    this.formation.rows.forEach(row => {
      row.musicians.forEach(musicianSlot => {
        if (musicianSlot.musician) {
          let musician = new Musician();
          musician.id = musicianSlot.musician.id;
          musician.formationPositionX = row.musicians.indexOf(musicianSlot);
          musician.formationPositionY = this.formation.rows.indexOf(row);
          updateEventFormationRequestDto.musicians.push(musician);          
        }
      });
    });

    await this.loadingService.presentLoading('Loading...');   

    this.store.dispatch(new UpdateEventFormation({eventType: this.type, eventId: this.event.id, updateEventFormationRequestDto: updateEventFormationRequestDto}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(EventState.success);
          if(success){
            this.toast.presentToast("Formacion actualizada correctamente");                   
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

  getConnectedDropLists(): string[] {
    return this.formation.rows.flatMap((row, rowIndex) =>
      row.musicians.map((_, colIndex) => `cdk-drop-list-${rowIndex}-${colIndex}`)
    );
  }

  swapMusicians(event: CdkDragDrop<any>) {
    // Obtener posiciones origen y destino
    const previousRow = event.previousContainer.data.row;
    const previousColumn = event.previousContainer.data.column;
    const currentRow = event.container.data.row;
    const currentColumn = event.container.data.column;

    // Realizar el intercambio
    const temp = this.formation.rows[previousRow].musicians[previousColumn];
    this.formation.rows[previousRow].musicians[previousColumn] = this.formation.rows[currentRow].musicians[currentColumn];
    this.formation.rows[currentRow].musicians[currentColumn] = temp;
  }
  
  @ViewChild(IonContent, { static: false }) content: IonContent;

  async downloadFormation() {
    try {
      await this.loadingService.presentLoading('Loading...');       
      this.isCapturing = true;
      await this.captureService.capture(this.content, 'capture', 'capturaFormation.png');      
    } catch (error) {     
      this.toast.presentToast('Error al capturar y compartir la imagen: ' + error);       
    } finally {
      this.isCapturing = false;
      await this.loadingService.dismissLoading();   
    }    
  }

}
