import { Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ModalController } from '@ionic/angular';
import { DEFAULT_MUSICIAN_IMAGE } from '../../../constants/constants';
import { Musician } from 'src/app/models/musician/musician';
import { Observable, Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MusicianInventoryState } from 'src/app/state/musician-inventory/musician-inventory.state';
import { MusicianInventory } from 'src/app/models/musician-inventory/musician-inventory';
import { CreateMusicianInventory, DeleteMusicianInventory, GetMusicianInventories, ResetMusicianInventory } from 'src/app/state/musician-inventory/musician-inventory.actions';
import { DEFAULT_INVENTORY_IMAGE} from '../../../constants/constants';
import { UpdateMusician } from 'src/app/state/musician/musician.actions';
import { MusicianState } from 'src/app/state/musician/musician.state';

@Component({
  selector: 'app-modal-musician-inventory',
  templateUrl: './modal-musician-inventory.component.html',
  styleUrls: ['./modal-musician-inventory.component.scss'],
})
export class ModalMusicianInventoryComponent implements OnInit {

  @Select(MusicianInventoryState.musicianInventories)
  musicianInventories$: Observable<MusicianInventory[]>;
  musicianInventoriesSubscription: Subscription;
  public musicianInventories: MusicianInventory[];
  
  @Input() musician: Musician;
  public showImage: string;
  public selectedImage: string;
  public defaultInventoryImage: string = DEFAULT_INVENTORY_IMAGE;  
  public initScreen = false;
  public initSearchFinish = false;  

  constructor(
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    this.musicianInventories = [];
    if(this.musician.image){
      this.showImage = `data:image/jpeg;base64,${this.musician.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;      
    }       
    this.store.dispatch(new GetMusicianInventories({musicianId: this.musician.id}));
    this.getMusicianInventories();   
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
    if (this.musicianInventoriesSubscription) {      
      this.musicianInventoriesSubscription.unsubscribe();  
    }     
    this.store.dispatch(new ResetMusicianInventory({})).subscribe({ next: async () => { } })   
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

  getMusicianInventories(){
    this.musicianInventoriesSubscription = this.musicianInventories$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(MusicianInventoryState.finish)                
        if(finish){          
          this.musicianInventories = this.store.selectSnapshot(MusicianInventoryState.musicianInventories);                  
          this.initSearchFinish = true;    
          this.dismissInitialLoading();              
        }
      }
    })
  }

  associateDisassociateMusicianInventory(musicianId:number, musicianInventory:MusicianInventory){
    
    musicianInventory.musicianId = musicianId;
    if(musicianInventory.assigned){
      // desasociamos
      musicianInventory.assigned = false;
      this.store.dispatch(new DeleteMusicianInventory({musicianInventory})).subscribe({
        next: () => {
          const success = this.store.selectSnapshot(MusicianInventoryState.success);
            if(success){
              this.toast.presentToast("Elemento de inventario eliminado del musico");                          
            }
            else{
              musicianInventory.assigned = true;
              const errorStatusCode = this.store.selectSnapshot(MusicianInventoryState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(MusicianInventoryState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }                  
            }              
        }
      })
    }
    else{
      // asociamos
      musicianInventory.assigned = true;
      this.store.dispatch(new CreateMusicianInventory({musicianInventory})).subscribe({
        next: () => {
          const success = this.store.selectSnapshot(MusicianInventoryState.success);
            if(success){
              this.toast.presentToast("Elemento de inventario asociado al musico");                               
            }
            else{
              musicianInventory.assigned = false;
              const errorStatusCode = this.store.selectSnapshot(MusicianInventoryState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(MusicianInventoryState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }                
            }             
        }
      })
    }    
  }

  async saveObservations(){    
    await this.loadingService.presentLoading('Loading...');          
    this.musician.voiceId = this.musician.voice.id;
    this.store.dispatch(new UpdateMusician({id: this.musician.id, musician:this.musician})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(MusicianState.success);
        if(success){
          this.toast.presentToast("Observaciones actualizadas correctamente");         
          await this.loadingService.dismissLoading();      
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

