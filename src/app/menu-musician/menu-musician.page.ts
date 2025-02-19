import { Component, OnDestroy } from '@angular/core';
import { AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { CreateMusician,DeleteMusician,GetMusician,GetMusicianFromDni,GetMusiciansGroupByVoice,ResetMusician,UpdateMusician} from '../state/musician/musician.actions';
import { MusicianState } from '../state/musician/musician.state';
import { ToastService } from '../services/toast/toast.service';
import { Musician } from '../models/musician/musician';
import { Observable } from 'rxjs/internal/Observable';
import { ModalMusicianComponent } from './components/modal-musician/modal-musician.component';
import { MusicianGroupByVoice } from '../models/musician/musician-group-by-voice';
import { UsersService } from 'src/app/services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FilterMusicians } from '../models/musician/filter-musicians';
import { ModalVoiceComponent } from './components/modal-voice/modal-voice.component';
import { CreateVoice, DeleteVoice,  ResetVoice, UpdateVoice } from '../state/voice/voice.actions';
import { VoiceState } from '../state/voice/voice.state';
import { Voice } from '../models/voice/voice';
import { DEFAULT_VOICE_IMAGE, DEFAULT_MUSICIAN_IMAGE } from '../constants/constants';
import { ModalPartitureComponent } from './components/modal-partiture/modal-partiture.component';
import {  ModalMusicianInventoryComponent } from './components/modal-inventory/modal-musician-inventory.component';
import { StorageService } from '../services/storage/storage.service';
import { UserRequest } from '../models/user/user-request';
import { ModalMusicianEventComponent } from './components/modal-event/modal-musician-event.component';
import { CreateMusicianEvent, DeleteMusicianEvent } from '../state/musicien-event/musician-event.actions';
import { MusicianEventState } from '../state/musicien-event/musician-event.state';
import { MusicianEvent } from '../models/musician-event/musician-event';
import { ModalMusicianMarchSoloComponent } from './components/modal-musician-march-solo/modal-musician-march-solo.component';
import { VideoCategory } from '../models/video-category/video-category';
import { ModalViewCategoryImageComponent } from '../menu-multimedia/component/modal-view-category-image/modal-view-category-image.component';

@Component({
  selector: 'app-menu-musician',
  templateUrl: './menu-musician.page.html',
  styleUrls: ['./menu-musician.page.scss'],
})
export class MenuMusicianPage implements OnDestroy {

  musiciansGroupByVoiceSubscription: Subscription;
  @Select(MusicianState.musiciansGroupByVoice)
  musiciansGroupByVoice$: Observable<MusicianGroupByVoice[]>;

  public musiciansGroupByVoice: MusicianGroupByVoice[];
  public expandVoiceList: string[];
  public expandVoiceMap: Map<string, boolean> = new Map();
  public filter: FilterMusicians;
  public searchTextChanged = new Subject<string>();
  public isSearching: boolean = false;
  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;
  public defaultVoiceImage: string = DEFAULT_VOICE_IMAGE;    
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public totalMusicians: number = 0;
  public viewUnregistred: boolean = false;

  constructor(
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,    
    private alertController: AlertController,
    private userService: UsersService,
    private loadingService: LoadingService,
    private storage: StorageService
  ) {
    this.expandVoiceList = null;
    this.expandVoiceMap = null;
    this.filter = new FilterMusicians();
    this.filter.name = '';
    this.isSearching = false;
    this.searchTextChanged
      .pipe(debounceTime(300)) // 200 milisegundos de espera
      .subscribe(value => {
        this.searchMusicians(value);
      });      
  }

  logout(){
    this.userService.logout();
  }


  getToday(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes (0-11) + 1, con cero inicial
    const day = String(today.getDate()).padStart(2, '0'); // Día del mes, con cero inicial

    return `${year}-${month}-${day}`;
  }

  async ionViewWillEnter(){      
    this.profile = await this.storage.getItem('profile');             
    this.getMusiciansGroupByVoice();      
    this.filterMusicians();    
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
    console.log("ngOnDestroy musician");
    if (this.musiciansGroupByVoiceSubscription) {      
      this.musiciansGroupByVoiceSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetMusician({})).subscribe({ next: async () => { } })
    this.store.dispatch(new ResetVoice({})).subscribe({ next: async () => { } })    
  }

  
  /*******************************************************/
  /******************* MUSICIAN **************************/
  /*******************************************************/
  async createMusician(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalMusicianComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');    
      data.voiceId = data.voice.id;
      
      this.store.dispatch(new CreateMusician({musician: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(MusicianState.success);
            if(success){
              this.toast.presentToast("Músico creado correctamente");            
              // cuando insertamos siempre expandimos
              this.expandVoiceMap.set(data.voiceId+"", true);
              this.updateExpandVoiceList();            
              this.filterMusicians(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);        
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
  }

  async updateMusician(musician:Musician, musicianSliding: IonItemSliding){   
    // cerramos el sliding 
    musicianSliding.close();
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalMusicianComponent,
      componentProps: {
        musician,
        updating: true
      }
    });
    modal.present();    

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');    
      data.voiceId = data.voice.id;
      this.store.dispatch(new UpdateMusician({id: data.id, musician:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(MusicianState.success);
          if(success){
            this.toast.presentToast("Músico modificado correctamente");
            this.filterMusicians(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);        
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
      })
    }
  }

  async asignPartituresMusician(musician:Musician, musicianSliding: IonItemSliding){   
    // cerramos el sliding 
    musicianSliding.close();

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    let user = new UserRequest(
      musician.dni, 
      null,
      null,
      null,
      musician.dni,  
      musician.name,
      musician.surname,
      musician.direction,
      musician.municipality,
      musician.province,
      musician.email, 
      musician.image,    
      null,
      musician.phoneNumber
    );

    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalPartitureComponent,
      componentProps: {
        user
      }
    });
    modal.present();
  }

  async manageMusicianInventary(musician:Musician, musicianSliding: IonItemSliding){   
    // cerramos el sliding 
    musicianSliding.close();

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    // abrimos modal
    const modal = await this.modalController.create({
      component: ModalMusicianInventoryComponent,
      componentProps: {
        musician
      }
    });
    modal.present();
  }

  async getMusiciansGroupByVoice(){            
    this.musiciansGroupByVoiceSubscription = this.musiciansGroupByVoice$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(MusicianState.finish);          
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);               
          if(finish){             
            if(errorStatusCode==200){      
              this.musiciansGroupByVoice = this.store.selectSnapshot(MusicianState.musiciansGroupByVoice);
              if(!this.musiciansGroupByVoice){
                this.musiciansGroupByVoice = [];
              }

              // si estoy viendo musicos antiguos, debo eliminar los grupos que no tienen musicos
              if(this.viewUnregistred){
                this.musiciansGroupByVoice = this.musiciansGroupByVoice.filter(musicianGroupByVoice => musicianGroupByVoice.musicians && musicianGroupByVoice.musicians.length>0);
              }

              if(this.expandVoiceList===null){                              
                this.expandVoiceMap = new Map(); 
                this.musiciansGroupByVoice.map(musician => musician.voice.id+"").forEach(element => {
                  this.expandVoiceMap.set(element, true);
                });
                this.updateExpandVoiceList();              
              }
              else{                        
                this.updateExpandVoiceList();
              }
            }
            else{
              if(this.expandVoiceList===null){                             
                this.expandVoiceMap = new Map(); 
              }
              this.musiciansGroupByVoice = [];
              this.musiciansGroupByVoice.map(musician => musician.voice.id+"").forEach(element => {
                this.expandVoiceMap.set(element, false);
              });  
              this.updateExpandVoiceList();
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
            this.dismissInitialLoading();                 
          }   
          this.calculateTotalMusicians();      
        }
      })
  }

  calculateTotalMusicians(){    
    this.totalMusicians = 0;
    if(this.musiciansGroupByVoice){
      this.musiciansGroupByVoice.forEach(musicianGroupByVoice => {        
        if(musicianGroupByVoice.musicians){
          this.totalMusicians += musicianGroupByVoice.musicians.length;
        }        
      });
    }    
  }

  trackByVoiceFn(index, voice) {    
    return voice.id; // Utiliza un identificador único de tu elemento
  }

  trackByMusicianFn(index, musician) {    
    return musician.dni; // Utiliza un identificador único de tu elemento
  }

  async filterMusicians(showLoading:boolean=true){    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetMusiciansGroupByVoice({name: this.filter.name,unregistred:this.viewUnregistred}));    
  }

  async confirmDeleteMusician(musician:Musician, musicianSliding: IonItemSliding) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el músico?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              musicianSliding.close();
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteMusician(musician,musicianSliding);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteMusician(musician:Musician, musicianSliding: IonItemSliding) {
    // cerramos el sliding 
    musicianSliding.close();

    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteMusician({id: musician.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(MusicianState.success);
        if(success){
          this.toast.presentToast("Músico eliminado correctamente");
          this.filterMusicians(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);        
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
    })
  }

  expandAll(){    
    this.expandVoiceMap.forEach((value, key) => {
      this.expandVoiceMap.set(key, true);
    }); 
    this.updateExpandVoiceList();    
  }

  collapseAll(){    
    this.expandVoiceMap.forEach((value, key) => {
      this.expandVoiceMap.set(key, false);
    });
    this.updateExpandVoiceList();    
  }

  accordionGroupChange = (ev: any) => {
    this.expandVoiceMap.forEach((value, key) => {
      this.expandVoiceMap.set(key, false);
    });
    ev.detail.value.forEach(element => {
      this.expandVoiceMap.set(element, true);
    }); 
    this.updateExpandVoiceList();    
  };
  
  refreshMusicians($event){      
    this.filterMusicians();    
    $event.target.complete();
  }

  searchMusicians(searchText: string) {
    if(this.isSearching == false){
      this.isSearching = true;
      this.filterMusicians();    
    }
  }

  onSearchTextChanged(event: any) {
    this.searchTextChanged.next(event.detail.value);
  }

  updateExpandVoiceList(){
    this.expandVoiceList = Array.from(this.expandVoiceMap)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
  }

  /*******************************************************/
  /******************* VOICES  ***************************/
  /*******************************************************/
  async createVoice(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalVoiceComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateVoice({voice: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(VoiceState.success);
            if(success){
              this.toast.presentToast("Voz creada correctamente");            
              this.filterMusicians(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(VoiceState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(VoiceState.errorMessage);        
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
  }

  async updateVoice(event: Event, voice:Voice){  
    event.stopPropagation(); 

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    // abrimos modal
    const modal = await this.modalController.create({
      component: ModalVoiceComponent,
      componentProps: {
        voice,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateVoice({id: data.id, voice:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(VoiceState.success);
          if(success){
            this.toast.presentToast("Voz modificada correctamente");
            this.filterMusicians(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(VoiceState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(VoiceState.errorMessage);        
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
      })
    }
  }

  async confirmDeleteVoice(event: Event, voice:Voice) {
    event.stopPropagation(); // Detener la propagación del evento de clic

    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la voz?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteVoice(voice);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteVoice(voice:Voice) {    
    // eliminamos la voz
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteVoice({id: voice.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(VoiceState.success);
        if(success){
          this.toast.presentToast("Voz eliminada correctamente");
          this.filterMusicians(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(VoiceState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(VoiceState.errorMessage);        
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
    })
  }  

  /*******************************************************/
  /*********************** EVENT *************************/
  /*******************************************************/
  async manageMusicianEvent(musician:Musician, musicianSliding: IonItemSliding){   
    // cerramos el sliding 
    musicianSliding.close();

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    // abrimos modal
    const modal = await this.modalController.create({
      component: ModalMusicianEventComponent,
      componentProps: {
        musician
      }
    });
    modal.present();
  }

  updateMusicianRehearsal(musician:Musician){
        
    if(musician.assistLastRehearsal){
      // eliminamos
      musician.assistLastRehearsal = false;

      let musicianEvent = new MusicianEvent(
        musician.id,
        'REHEARSAL',
        musician.idLastRehearsal,
        musician.assistLastRehearsal,
        false
      ); 
      
      this.store.dispatch(new DeleteMusicianEvent({musicianEvent: musicianEvent}))
        .subscribe({
          next: async () => {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              this.toast.presentToast("Ensayo actualizado correctamente");              
            }
            else{
              musician.assistLastRehearsal = true;
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
    else{
      // asociamos
      musician.assistLastRehearsal = true;
      let musicianEvent = new MusicianEvent(
        musician.id,
        'REHEARSAL',
        musician.idLastRehearsal,
        musician.assistLastRehearsal,
        false
      ); 

      this.store.dispatch(new CreateMusicianEvent({musicianEvent: musicianEvent}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(MusicianEventState.success);
            if(success){
              this.toast.presentToast("Ensayo actualizado correctamente");                        
            }
            else{
              musician.assistLastRehearsal = false;
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
          }
        }
      )    
    }    
  }

  onViewUnregistred(event: any){    
    this.filterMusicians();           
  }

  async viewMusicianImage(musician: Musician){    
    if(!musician.image){
      this.toast.presentToast("No existe imagen para previsualizar");
    }
    else{
      await this.loadingService.presentLoading('Loading...');    
      this.store.dispatch(new GetMusician({id:musician.id}))
        .subscribe({
          next: async ()=> {
            const finish = this.store.selectSnapshot(MusicianState.finish);          
            const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);          
            
            if(finish){                        
              if(errorStatusCode==200){                                        
                let videoCategory = new VideoCategory();
                videoCategory.name = 'Foto músico';
                videoCategory.image = this.store.selectSnapshot(MusicianState.musician).image;
                
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

  /*******************************************************/
  /*********************** EVENT *************************/
  /*******************************************************/
  async showMusicianSolo(musician:Musician, musicianSliding: IonItemSliding){   
    // cerramos el sliding 
    musicianSliding.close();

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    // abrimos modal
    const modal = await this.modalController.create({
      component: ModalMusicianMarchSoloComponent,
      componentProps: {
        musician
      }
    });
    modal.present();
  }
  
}
