import { Component, OnDestroy } from '@angular/core';
import { AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { CreateMusician,DeleteMusician,GetMusiciansGroupByVoice,ResetMusician,UpdateMusician} from '../state/musician/musician.actions';
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

  constructor(
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,    
    private alertController: AlertController,
    private userService: UsersService,
    private loadingService: LoadingService
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

  async ionViewWillEnter(){           
    this.getMusiciansGroupByVoice();      
    this.filterMusicians();    
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
    
    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalPartitureComponent,
      componentProps: {
        musician
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
            await this.loadingService.dismissLoading();            
          }          
        }
      })
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
    this.store.dispatch(new GetMusiciansGroupByVoice({name: this.filter.name}));    
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

  /*showMap(origin?: string){
    console.log("///////////////////////////////////////////");
    console.log(origin);
    this.expandVoiceMap.forEach((value, key) => {
      console.log(`Clave: ${key}, Valor: ${value}`);
    });
    console.log("///////////////////////////////////////////");
  }*/

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
}
