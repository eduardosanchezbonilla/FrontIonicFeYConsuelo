import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { InventoryState } from '../state/inventory/inventory.state';
import { Inventory } from '../models/inventory/inventory';
import { DEFAULT_INVENTORY_IMAGE} from '../constants/constants';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { CreateInventory, DeleteInventory, GetInventories, ResetInventory, UpdateInventory } from '../state/inventory/inventory.actions';
import { Musician } from '../models/musician/musician';
import { ModalInventoryComponent } from './components/modal-inventory/modal-inventory.component';
import { GetMusiciansWithInventoryAssociated } from '../state/musician-inventory/musician-inventory.actions';
import { MusicianInventoryState } from '../state/musician-inventory/musician-inventory.state';

@Component({
  selector: 'app-menu-inventory',
  templateUrl: './menu-inventory.page.html',
  styleUrls: ['./menu-inventory.page.scss'],
})
export class MenuInventoryPage implements OnDestroy {

  inventoriesSubscription: Subscription;
  @Select(InventoryState.inventorioes)
  inventories$: Observable<Inventory[]>;

  public inventories: Inventory[];  
  public defaultInventoryImage: string = DEFAULT_INVENTORY_IMAGE;  
  public previousExpandedInventories: string[] = [];
  public accordionValue: string[] = [];
  public isLoading: boolean = false;
  public profile: string;
  public initScreen = false;
  public initSearchFinish = false;

  constructor(
      private modalController:ModalController,
      private store:Store,
      private toast:ToastService,    
      private alertController: AlertController,
      private userService: UsersService,
      private loadingService: LoadingService,
      private storage: StorageService
  ) {  
  }

  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){         
    this.profile = await this.storage.getItem('profile');    
    this.accordionValue = [];
    this.getInventories();         
    this.filterInventories();    
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
    console.log("ngOnDestroy");       
    if (this.inventoriesSubscription) {      
      this.inventoriesSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetInventory({})).subscribe({ next: async () => { } })
    //this.store.dispatch(new ResetPartiture({})).subscribe({ next: async () => { } })        
  }


  /*******************************************************/
  /******************* INVENTORY *************************/
  /*******************************************************/
  async createInventory(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalInventoryComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){            
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateInventory({inventory: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(InventoryState.success);
            if(success){
              this.toast.presentToast("Elemento de inventario creado correctamente");            
              this.filterInventories(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(InventoryState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(InventoryState.errorMessage);        
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

  async updateInventory(event: Event, inventory: Inventory){  
    event.stopPropagation(); 
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal    
    const modal = await this.modalController.create({
      component: ModalInventoryComponent,
      componentProps: {
        inventory: inventory,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){          
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateInventory({id: data.id, inventory:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(InventoryState.success);
          if(success){
            this.toast.presentToast("Grupo de partituras modificado correctamente");
            this.filterInventories(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(InventoryState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(InventoryState.errorMessage);        
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

  async getInventories(){                
    this.inventoriesSubscription = this.inventories$     
      .subscribe({
        next: async ()=> {                       
          const finish = this.store.selectSnapshot(InventoryState.finish);          
          const errorStatusCode = this.store.selectSnapshot(InventoryState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(InventoryState.errorMessage);                         
          if(finish){            
            if(errorStatusCode==200){      
              this.inventories = this.store.selectSnapshot(InventoryState.inventorioes);
              if(!this.inventories){
                this.inventories = [];
              }             
            }
            else{              
              this.inventories = [];
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                             
            // cara vez que recagamos la lista de grupos de partituras, collapsamos todos los acordeones            
            this.accordionValue = [];                                     
            this.initSearchFinish = true;    
            this.dismissInitialLoading();  
          }          
        }
      })    
  }

  async filterInventories(showLoading:boolean=true){     
    if(showLoading){      
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetInventories({/*name: this.filter.name*/}));    
  }

  refreshInventories($event){          
    this.filterInventories();    
    $event.target.complete();
  }

  async confirmDeleteInventory(event: Event, inventory:Inventory) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el elemento de inventario?',
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
              this.deleteInventory(inventory);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteInventory(inventory:Inventory) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteInventory({id: inventory.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(InventoryState.success);
        if(success){
          this.toast.presentToast("Elemento de inventario eliminado correctamente");
          this.filterInventories(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(InventoryState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(InventoryState.errorMessage);        
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
  /******************** MUSICIANS  ***********************/
  /*******************************************************/
  async getMusiciansWithInventoryAssociated(inventoryId:number){

    await this.loadingService.presentLoading('Loading...');          
        
    this.store.dispatch(new GetMusiciansWithInventoryAssociated({inventoryId: inventoryId}))        
      .subscribe({
        next: async ()=> {            
          const success = this.store.selectSnapshot(MusicianInventoryState.success);
          if(success){            
            this.setInventoryById(inventoryId, this.store.selectSnapshot(MusicianInventoryState.musicians));
            await this.loadingService.dismissLoading();               
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(MusicianInventoryState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(MusicianInventoryState.errorMessage);        
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
  /********************** GESTION ACORDEONES *************************/
  /*******************************************************************/
  setInventoryById(inventoryId: number,musicians:Musician[]) {
    this.inventories.find(inventory => inventory.id === inventoryId)!.musicians = musicians; 
  }

  getInventoryById(inventoryId: number): Inventory {
    return this.inventories.find(inventory => inventory.id === inventoryId)!; 
  }

  accordionInventoryChange = (event: any) => {
    const currentExpandedInventories: string[] = event.detail.value; 
    const newlyOpenedInventories = currentExpandedInventories.filter(id => !this.previousExpandedInventories.includes(id));
    const newlyClosedInventories = this.previousExpandedInventories.filter(id => !currentExpandedInventories.includes(id));

    // Manejar los acordeones que se están abriendo
    newlyOpenedInventories.forEach(groupId => {
      this.onAccordionExpand(groupId);
    });

    // Manejar los acordeones que se están cerrando
    newlyClosedInventories.forEach(groupId => {
      this.onAccordionClose(groupId);
    });

    // Actualizar el estado previo
    this.previousExpandedInventories = [...currentExpandedInventories];
  };

  onAccordionExpand(inventoryId: string) {    
    // estamos abriendo un acordeon, solo consultaremos las partituras si aun no las tenemos

    // obtenemos el grupo de partituras
    let inventory = this.getInventoryById(parseInt(inventoryId));

    // si aun no tiene partituras, las obtenemos
    if(inventory && (inventory.musicians==null || inventory.musicians.length==0)){
      // obtenemos los musicos 
      this.getMusiciansWithInventoryAssociated(inventory.id);
    }    
  }
  
  onAccordionClose(inventoryId: string) {
    ;
  }

  trackByInventoryFn(index, inventory) {    
    return inventory.id || index; // Utiliza un identificador único de tu elemento
  }

  trackByMusicianFn(index, musician) {    
    return musician.id || index; // Utiliza un identificador único de tu elemento
  }

  collapseAll(){    
    this.accordionValue = [];
  }

}
