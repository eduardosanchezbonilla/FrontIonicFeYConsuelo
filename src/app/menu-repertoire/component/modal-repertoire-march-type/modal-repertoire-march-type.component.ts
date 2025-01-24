import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { RepertoireMarchType } from 'src/app/models/repertoire-march-type/repertoire-march-type';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { CreateRepertoireMarchType, DeleteRepertoireMarchType, GetRepertoireMarchTypes, ResetRepertoireMarchType, UpdateRepertoireMarchType } from 'src/app/state/repertoire-march-type/repertoire-march-type.actions';
import { RepertoireMarchTypeState, RepertoireMarchTypeStateModel } from 'src/app/state/repertoire-march-type/repertoire-march-type.state';
import { ModalEditRepertoireMarchTypeComponent } from '../modal-edit-repertoire-march-type/modal-edit-repertoire-march-type.component';

@Component({
  selector: 'app-modal-repertoire-march-type',
  templateUrl: './modal-repertoire-march-type.component.html',
  styleUrls: ['./modal-repertoire-march-type.component.scss'],
})
export class ModalRepertoireMarchTypeComponent  implements OnDestroy {

  repertoireMarchTypesSubscription: Subscription;
  @Select(RepertoireMarchTypeState.repertoireMarchTypes)
  repertoireMarchTypes$: Observable<RepertoireMarchType[]>;

  public repertoireMarchTypes: RepertoireMarchType[];  
  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;  
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

  async ionViewWillEnter(){         
    this.profile = await this.storage.getItem('profile');    
    this.getRepertoireMarchTypes();         
    this.filterRepertoireMarchTypes(false);    
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
    if (this.repertoireMarchTypesSubscription) {      
      this.repertoireMarchTypesSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetRepertoireMarchType({})).subscribe({ next: async () => { } })    
  }


  /****************************************************************/
  /******************* REPERTOIRE MARCH TYPE **********************/
  /****************************************************************/
  async createRepertoireMarchType(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalEditRepertoireMarchTypeComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){            
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateRepertoireMarchType({repertoireMarchType: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(RepertoireMarchTypeState.success);
            if(success){
              this.toast.presentToast("Tipo de marcha creada correctamente");            
              this.filterRepertoireMarchTypes(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(RepertoireMarchTypeState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireMarchTypeState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){    
                this.cancel();        
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

  async updateRepertoireMarchType(event: Event, repertoireMarchType: RepertoireMarchType){  
    event.stopPropagation(); 
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal    
    const modal = await this.modalController.create({
      component: ModalEditRepertoireMarchTypeComponent,
      componentProps: {
        repertoireMarchType: repertoireMarchType,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){          
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateRepertoireMarchType({id: data.id, repertoireMarchType:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(RepertoireMarchTypeState.success);
          if(success){
            this.toast.presentToast("Tipo de marcha modificada correctamente");
            this.filterRepertoireMarchTypes(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(RepertoireMarchTypeState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(RepertoireMarchTypeState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){     
              this.cancel();       
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

  async getRepertoireMarchTypes(){      
    this.repertoireMarchTypesSubscription = this.repertoireMarchTypes$     
      .subscribe({
        next: async ()=> {                       
          const finish = this.store.selectSnapshot(RepertoireMarchTypeState.finish);          
          const errorStatusCode = this.store.selectSnapshot(RepertoireMarchTypeState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(RepertoireMarchTypeState.errorMessage);                         
          if(finish){            
            if(errorStatusCode==200){      
              this.repertoireMarchTypes = this.store.selectSnapshot(RepertoireMarchTypeState.repertoireMarchTypes);
              if(!this.repertoireMarchTypes){
                this.repertoireMarchTypes = [];
              }             
            }
            else{              
              this.repertoireMarchTypes = [];
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){   
                this.cancel();         
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                                                     
            this.initSearchFinish = true;    
            this.dismissInitialLoading();  
          }          
        }
      })    
  }

  async filterRepertoireMarchTypes(showLoading:boolean=true){     
    if(showLoading){      
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetRepertoireMarchTypes({/*name: this.filter.name*/}));    
  }

  refreshRepertoireMarchTypes($event){          
    this.filterRepertoireMarchTypes();    
    $event.target.complete();
  }

  async confirmDeleteRepertoireMarchType(event: Event, repertoireMarchType:RepertoireMarchType) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el tipo de marcha de repertorio?',
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
              this.deleteRepertoireMarchType(repertoireMarchType);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteRepertoireMarchType(repertoireMarchType:RepertoireMarchType) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteRepertoireMarchType({id: repertoireMarchType.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(RepertoireMarchTypeState.success);
        if(success){
          this.toast.presentToast("Elemento de inventario eliminado correctamente");
          this.filterRepertoireMarchTypes(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(RepertoireMarchTypeState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(RepertoireMarchTypeState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){   
            this.cancel();         
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

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }
  
}
