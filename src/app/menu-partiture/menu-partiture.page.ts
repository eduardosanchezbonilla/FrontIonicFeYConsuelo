import { Component, OnDestroy } from '@angular/core';
import { AlertController,  ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { Observable, Subscription } from 'rxjs';
import { PartitureGroupState } from '../state/partiture-group/partiture-group.state';
import { PartitureGroup } from '../models/partiture-group/partiture-group';
import { CreatePartitureGroup, DeletePartitureGroup, GetPartitureGroups, ResetPartitureGroup, UpdatePartitureGroup } from '../state/partiture-group/partiture-group.actions';
import { DEFAULT_PARTITURE_GROUP_IMAGE} from '../constants/constants';
import { ModalPartitureGroupComponent } from './components/modal-partiture-group/modal-partiture-group.component';
import { Partiture } from '../models/partiture/partiture';
import { DownloadPartiture, GetPartitures, ResetPartiture } from '../state/partiture/partiture.actions';
import { PartitureState } from '../state/partiture/partiture.state';
import { FileManagerService } from '../services/filemanager/file-manager.service';
import { StorageService } from '../services/storage/storage.service';
import { ModalRequestPartitureComponent } from './components/modal-request-partiture/modal-request-partiture.component';
import { CreateUserPartitureRequest } from '../state/user-partiture-request/user-partiture-request.actions';
import { UserPartitureRequestState, UserPartitureRequestStateModel } from '../state/user-partiture-request/user-partiture-request.state';

@Component({
  selector: 'app-menu-partiture',
  templateUrl: './menu-partiture.page.html',
  styleUrls: ['./menu-partiture.page.scss'],
})
export class MenuPartiturePage implements OnDestroy {

  partitureGroupsSubscription: Subscription;
  @Select(PartitureGroupState.partitureGroups)
  partitureGroups$: Observable<PartitureGroup[]>;
    
  public partitureGroups: PartitureGroup[];
  public isSearching: boolean = false;
  public defaultPartitureGroupImage: string = DEFAULT_PARTITURE_GROUP_IMAGE;  
  public previousExpandedGroups: string[] = [];
  public accordionValue: string[] = [];
  public isLoading: boolean = false;
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public flagLoading = false;
  
  constructor(
      private modalController:ModalController,
      private store:Store,
      private toast:ToastService,    
      private alertController: AlertController,
      private userService: UsersService,
      private loadingService: LoadingService,     
      private fileManagerService: FileManagerService,
      private storage: StorageService
  ) {
      this.isSearching = false;   
  }

  logout(){
    this.userService.logout();
  }

  async ionViewWillEnter(){   
    this.flagLoading = false;      
    this.profile = await this.storage.getItem('profile');    
    this.accordionValue = [];
    this.getPartitureGroups();         
    this.filterPartitureGroups();    
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
    if (this.partitureGroupsSubscription) {      
      this.partitureGroupsSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetPartitureGroup({})).subscribe({ next: async () => { } })
    this.store.dispatch(new ResetPartiture({})).subscribe({ next: async () => { } })        
  }


  /*******************************************************/
  /******************* PARTITURE GROUPS ******************/
  /*******************************************************/
  async createPartitureGroup(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalPartitureGroupComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){            
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreatePartitureGroup({partitureGroup: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(PartitureGroupState.success);
            if(success){
              this.toast.presentToast("Group de partituras creado correctamente");            
              this.filterPartitureGroups(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(PartitureGroupState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(PartitureGroupState.errorMessage);        
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

  async updatePartitureGroup(event: Event, partitureGroup: PartitureGroup){  
    event.stopPropagation(); 
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal    
    const modal = await this.modalController.create({
      component: ModalPartitureGroupComponent,
      componentProps: {
        partitureGroup: partitureGroup,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){          
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdatePartitureGroup({id: data.id, partitureGroup:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(PartitureGroupState.success);
          if(success){
            this.toast.presentToast("Grupo de partituras modificado correctamente");
            this.filterPartitureGroups(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(PartitureGroupState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(PartitureGroupState.errorMessage);        
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

  async getPartitureGroups(){                
    this.partitureGroupsSubscription = this.partitureGroups$     
      .subscribe({
        next: async ()=> {                       
          const finish = this.store.selectSnapshot(PartitureGroupState.finish);          
          const errorStatusCode = this.store.selectSnapshot(PartitureGroupState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(PartitureGroupState.errorMessage);                         
          if(finish){
            if(errorStatusCode==200){                   
              this.partitureGroups = this.store.selectSnapshot(PartitureGroupState.partitureGroups);
              if(!this.partitureGroups){
                this.partitureGroups = [];
              }             
            }
            else{              
              this.partitureGroups = [];
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                                                     
            // cara vez que recagamos la lista de grupos de partituras, collapsamos todos los acordeones            
            this.isSearching = false;     
            this.initSearchFinish = true;    

            // si solo hay un grupo de partituras, lo expandimos
            if(this.partitureGroups && this.partitureGroups.length==1 && this.partitureGroups[0].id){
              setTimeout(() => {  
                  this.accordionValue = [this.partitureGroups[0].id.toString()];                  
                  this.flagLoading = true;
                }
              );
            }
            else{
              this.accordionValue = [];  
              this.dismissInitialLoading();  
            }            
          }          
        }
      })    
  }

  async filterPartitureGroups(showLoading:boolean=true){     
    if(showLoading){      
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetPartitureGroups({/*name: this.filter.name*/}));    
  }

  refreshPartitureGroups($event){    
    this.accordionValue = [];        
    this.filterPartitureGroups();    
    $event.target.complete();
  }
  
  async confirmDeletePartitureGroup(event: Event, partitureGroup:PartitureGroup) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el grupo de partituras?',
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
              this.deletePartitureGroup(partitureGroup);
            }
          }
        ]
    });
    alert.present();
  }

  async deletePartitureGroup(partitureGroup:PartitureGroup) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeletePartitureGroup({id: partitureGroup.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(PartitureGroupState.success);
        if(success){
          this.toast.presentToast("Grupo de partituras eliminado correctamente");
          this.filterPartitureGroups(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(PartitureGroupState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(PartitureGroupState.errorMessage);        
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

  async requestPartitureGroup(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalRequestPartitureComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){            
      await this.loadingService.presentLoading('Loading...');             
      
      this.store.dispatch(new CreateUserPartitureRequest({userPartitureRequest: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(UserPartitureRequestState.success);
            if(success){
              this.toast.presentToast("Petición de partituras registrada correctamente");                                        
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(UserPartitureRequestState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UserPartitureRequestState.errorMessage);        
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
      )    
    }
  }

  /*******************************************************/
  /******************** PARTITURE  ***********************/
  /*******************************************************/
  async getPartitures(partitureGroupId:number,partitureGroupGoogleId: string){

    // sino hay googleId no podemos obtener las partituras
    if(!partitureGroupGoogleId || partitureGroupGoogleId.trim().length==0){
      let partiture = new Partiture("No existen partituras para este grupo",null,null);      
      this.setPartituresGroupById(
          partitureGroupId,
          [partiture]
      );
    }
    else{           
      if(!this.flagLoading){
        await this.loadingService.presentLoading('Loading...');          
      }
      this.flagLoading=false;
        
      this.store.dispatch(new GetPartitures({partitureGroupGoogleId: partitureGroupGoogleId}))        
        .subscribe({
          next: async ()=> {            
            const success = this.store.selectSnapshot(PartitureState.success);
            if(success){
              this.setPartituresGroupById(partitureGroupId, this.store.selectSnapshot(PartitureState.partitures));
              await this.loadingService.dismissLoading();               
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(PartitureState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(PartitureState.errorMessage);        
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

  async downloadPartiture(partiture:Partiture){       
    // muestro este loading, porque el otro me movia el scroll       
    this.isLoading = true;
    const partitureName = partiture.name;    
    this.store.dispatch(new DownloadPartiture({partitureGoogleId: partiture.googleId}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(PartitureState.success);
          if(success){            
            const partiture = this.store.selectSnapshot(PartitureState.partiture);            
            this.fileManagerService.showFile(partitureName, partiture.content);            
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(PartitureState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(PartitureState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }              
          }    
          this.isLoading = false;         
        },
        error: async () => {
          this.isLoading = false;                   
        }
      }
    )
  }


  /*******************************************************************/
  /********************** GESTION ACORDEONES *************************/
  /*******************************************************************/
  setPartituresGroupById(groupId: number,partitures:Partiture[]) {
    this.partitureGroups.find(partitureGroup => partitureGroup.id === groupId)!.partitures = partitures; 
  }

  getPartitureGroupById(groupId: number): PartitureGroup {
    return this.partitureGroups.find(partitureGroup => partitureGroup.id === groupId)!; 
  }

  accordionGroupChange = (event: any) => {
    const currentExpandedGroups: string[] = event.detail.value; 
    const newlyOpenedGroups = currentExpandedGroups.filter(id => !this.previousExpandedGroups.includes(id));
    const newlyClosedGroups = this.previousExpandedGroups.filter(id => !currentExpandedGroups.includes(id));

    // Manejar los acordeones que se están abriendo
    newlyOpenedGroups.forEach(groupId => {
      this.onAccordionExpand(groupId);
    });

    // Manejar los acordeones que se están cerrando
    newlyClosedGroups.forEach(groupId => {
      this.onAccordionClose(groupId);
    });

    // Actualizar el estado previo
    this.previousExpandedGroups = [...currentExpandedGroups];
  };

  onAccordionExpand(groupId: string) {    
    // estamos abriendo un acordeon, solo consultaremos las partituras si aun no las tenemos

    // obtenemos el grupo de partituras
    let partitureGroup = this.getPartitureGroupById(parseInt(groupId));

    // si aun no tiene partituras, las obtenemos
    if(partitureGroup && (partitureGroup.partitures==null || partitureGroup.partitures.length==0)){
      this.getPartitures(partitureGroup.id,partitureGroup.googleId);
    }    
  }
  
  onAccordionClose(groupId: string) {
    ;
  }

  trackByPartitureGroupFn(index, partitureGroup) {    
    return partitureGroup.id || index; // Utiliza un identificador único de tu elemento
  }

  trackByPartitureFn(index, partiture) {    
    return partiture.googleId || index; // Utiliza un identificador único de tu elemento
  }

  collapseAll(){    
    this.accordionValue = [];
  }
  
}
