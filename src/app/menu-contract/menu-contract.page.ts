import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { ContractGroupState } from '../state/contract-group/contract-group.state';
import { ContractGroup } from '../models/contract-group/contract-group';
import { DEFAULT_CONTRACT_GROUP_IMAGE, DEFAULT_PARTITURE_GROUP_IMAGE } from '../constants/constants';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { FileManagerService } from '../services/filemanager/file-manager.service';
import { StorageService } from '../services/storage/storage.service';
import { CreateContractGroup, DeleteContractGroup, GetContractGroups, ResetContractGroup, UpdateContractGroup } from '../state/contract-group/contract-group.actions';
import { DeleteContract, DownloadContract, GetContracts, ResetContract, UploadContract } from '../state/contract/contract.actions';
import { Contract } from '../models/contract/contract';
import { ContractState } from '../state/contract/contract.state';
import { ModalContractGroupComponent } from './components/modal-contract-group/modal-contract-group.component';
import { ModalContractComponent } from './components/modal-contract/modal-contract.component';

@Component({
  selector: 'app-menu-contract',
  templateUrl: './menu-contract.page.html',
  styleUrls: ['./menu-contract.page.scss'],
})
export class MenuContractPage implements OnDestroy {

  contractGroupsSubscription: Subscription;
  @Select(ContractGroupState.contractGroups)
  contractGroups$: Observable<ContractGroup[]>;
    
  public contractGroups: ContractGroup[];
  public isSearching: boolean = false;
  public defaultContractGroupImage: string = DEFAULT_CONTRACT_GROUP_IMAGE;  
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
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){   
    this.flagLoading = false;      
    this.profile = await this.storage.getItem('profile');    
    this.accordionValue = [];        
    this.getContractGroups();         
    this.filterContractGroups();    
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
    if (this.contractGroupsSubscription) {      
      this.contractGroupsSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetContractGroup({})).subscribe({ next: async () => { } })
    this.store.dispatch(new ResetContract({})).subscribe({ next: async () => { } })        
  }

  /*******************************************************/
  /******************* CONTRACT GROUPS *******************/
  /*******************************************************/
  async createContractGroup(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalContractGroupComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){            
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateContractGroup({contractGroup: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(ContractGroupState.success);
            if(success){
              this.toast.presentToast("Group de contratos creado correctamente");            
              this.filterContractGroups(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(ContractGroupState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(ContractGroupState.errorMessage);        
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

  async updateContractGroup(event: Event, contractGroup: ContractGroup){  
    event.stopPropagation(); 
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal    
    const modal = await this.modalController.create({
      component: ModalContractGroupComponent,
      componentProps: {
        contractGroup: contractGroup,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){          
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateContractGroup({id: data.id, contractGroup:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(ContractGroupState.success);
          if(success){
            this.toast.presentToast("Grupo de contratos modificado correctamente");
            this.filterContractGroups(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(ContractGroupState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(ContractGroupState.errorMessage);        
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

  async getContractGroups(){                
    this.contractGroupsSubscription = this.contractGroups$     
      .subscribe({
        next: async ()=> {                       
          const finish = this.store.selectSnapshot(ContractGroupState.finish);          
          const errorStatusCode = this.store.selectSnapshot(ContractGroupState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(ContractGroupState.errorMessage);                         
          if(finish){
            if(errorStatusCode==200){                   
              this.contractGroups = this.store.selectSnapshot(ContractGroupState.contractGroups);
              if(!this.contractGroups){
                this.contractGroups = [];
              }             
            }
            else{              
              this.contractGroups = [];
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                                                     
            // cara vez que recagamos la lista de grupos de contratos, collapsamos todos los acordeones            
            this.isSearching = false;     
            this.initSearchFinish = true;    

            // si solo hay un grupo de contratos, lo expandimos
            /*if(this.contractGroups && this.contractGroups.length==1 && this.contractGroups[0].id){
              setTimeout(() => {  
                  this.accordionValue = [this.contractGroups[0].id.toString()];                  
                  this.flagLoading = true;
                }
              );
            }
            else{
              this.accordionValue = [];  
              this.dismissInitialLoading();  
            }  */
            this.dismissInitialLoading();            
          }          
        }
      })    
  }

  async filterContractGroups(showLoading:boolean=true){     
    if(showLoading){      
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetContractGroups({/*name: this.filter.name*/}));    
  }

  refreshContractGroups($event){    
    this.accordionValue = [];        
    this.filterContractGroups();    
    $event.target.complete();
  }
  
  async confirmDeleteContractGroup(event: Event, contractGroup:ContractGroup) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el grupo de contratos?',
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
              this.deleteContractGroup(contractGroup);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteContractGroup(contractGroup:ContractGroup) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteContractGroup({id: contractGroup.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(ContractGroupState.success);
        if(success){
          this.toast.presentToast("Grupo de contratos eliminado correctamente");
          this.filterContractGroups(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(ContractGroupState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(ContractGroupState.errorMessage);        
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
  /******************** CONTRACT  ************************/
  /*******************************************************/
  async getContracts(contractGroupId:number,contractGroupGoogleId: string){

    // sino hay googleId no podemos obtener las contratos
    if(!contractGroupGoogleId || contractGroupGoogleId.trim().length==0){
      let contract = new Contract("No existen contratos para este grupo",null,null);      
      this.setContractsGroupById(
          contractGroupId,
          [contract]
      );
    }
    else{           
      if(!this.flagLoading){
        await this.loadingService.presentLoading('Loading...');          
      }
      this.flagLoading=false;      
        
      this.store.dispatch(new GetContracts({contractGroupGoogleId: contractGroupGoogleId}))        
        .subscribe({
          next: async ()=> {            
            const success = this.store.selectSnapshot(ContractState.success);
            if(success){
              this.setContractsGroupById(contractGroupId, this.store.selectSnapshot(ContractState.contracts));
              await this.loadingService.dismissLoading();               
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(ContractState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(ContractState.errorMessage);        
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

  async downloadContract(contract:Contract){       
    // muestro este loading, porque el otro me movia el scroll       
    this.isLoading = true;
    const contractName = contract.name;    
    this.store.dispatch(new DownloadContract({contractGoogleId: contract.googleId}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(ContractState.success);
          if(success){            
            const contract = this.store.selectSnapshot(ContractState.contract);            
            this.fileManagerService.showFile(contractName, contract.content, contract.mimeType);            
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(ContractState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(ContractState.errorMessage);        
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

  async createContract(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalContractComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){         
      this.accordionValue = [];       
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new UploadContract({contract: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(ContractState.success);
            if(success){
              this.toast.presentToast("Contrato subido correctamente correctamente");            
              this.filterContractGroups(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(ContractState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(ContractState.errorMessage);        
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

  async confirmDeleteContract(event: Event, contract:Contract) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el contrato?',
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
              this.deleteContract(contract);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteContract(contract:Contract) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteContract({contractGoogleId: contract.googleId})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(ContractState.success);
        if(success){          
          this.toast.presentToast("Contratos eliminado correctamente");
          // ahora lo eliminamos del array correspondiente
          // recorremos todos los contractGroups, y dentro de cada uno buscamos en el array de contracts
          // y eliminamos el contrato
          this.contractGroups.forEach(contractGroup => {
            if(contractGroup.contracts && contractGroup.contracts.length>0){
              const index = contractGroup.contracts.findIndex(c => c.googleId==contract.googleId);
              if(index>=0){
                contractGroup.contracts.splice(index,1);
              }
            }
          });  
          await this.loadingService.dismissLoading();                  
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(ContractState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(ContractState.errorMessage);        
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


  /*******************************************************************/
  /********************** GESTION ACORDEONES *************************/
  /*******************************************************************/
  setContractsGroupById(groupId: number,contracts:Contract[]) {
    this.contractGroups.find(contractGroup => contractGroup.id === groupId)!.contracts = contracts; 
  }

  getContractGroupById(groupId: number): ContractGroup {
    return this.contractGroups.find(contractGroup => contractGroup.id === groupId)!; 
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
    // estamos abriendo un acordeon, solo consultaremos los contratos si aun no las tenemos

    // obtenemos el grupo de contratos
    let contractGroup = this.getContractGroupById(parseInt(groupId));

    // si aun no tiene contratos, las obtenemos
    if(contractGroup && (contractGroup.contracts==null || contractGroup.contracts.length==0)){
      this.getContracts(contractGroup.id,contractGroup.googleId);
    }    
  }
  
  onAccordionClose(groupId: string) {
    ;
  }

  trackByContractGroupFn(index, contractGroup) {    
    return contractGroup.id || index; // Utiliza un identificador único de tu elemento
  }

  trackByContractFn(index, contract) {    
    return contract.googleId || index; // Utiliza un identificador único de tu elemento
  }

  collapseAll(){    
    this.accordionValue = [];
  }
  
}
