import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RepertoireCategoryState } from '../state/repertoire-category/repertoire-category.state';
import { Select, Store } from '@ngxs/store';
import { DEFAULT_REPERTOIRE_CATEGORY_IMAGE } from '../constants/constants';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { CreateRepertoireCategory, DeleteRepertoireCategory, GetRepertoireCategories, ResetRepertoireCategory, UpdateRepertoireCategory } from '../state/repertoire-category/repertoire-category.actions';
import { RepertoireCategory } from '../models/repertoire-category/repertoire-category';
import { ModalRepertoireCategoryComponent } from './component/modal-repertoire-category/modal-repertoire-category.component';
import { ModalRepertoireMarchTypeComponent } from './component/modal-repertoire-march-type/modal-repertoire-march-type.component';
import { ModalEditRepertoireMarchComponent } from './component/modal-edit-repertoire-march/modal-edit-repertoire-march.component';
import { CreateRepertoireMarch } from '../state/repertoire/repertoire-march.actions';
import { RepertoireMarchState } from '../state/repertoire/repertoire-march.state';
import { ModalRepertoireMarchComponent } from './component/modal-repertoire-march/modal-repertoire-march.component';

@Component({
  selector: 'app-menu-repertoire',
  templateUrl: './menu-repertoire.page.html',
  styleUrls: ['./menu-repertoire.page.scss'],
})
export class MenuRepertoirePage implements OnDestroy {

  repertoireCategoriesSubscription: Subscription;
  @Select(RepertoireCategoryState.repertoireCategories)
  repertoireCategories$: Observable<RepertoireCategory[]>;
  public repertoireCategories: RepertoireCategory[];  
  public defaultRepertoireCategoryImage: string = DEFAULT_REPERTOIRE_CATEGORY_IMAGE;
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
    this.getRepertoireCategories();         
    this.filterRepertoireCategories();    
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
    console.log("ngOnDestroy repertoire category");       
    if (this.repertoireCategoriesSubscription) {      
      this.repertoireCategoriesSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetRepertoireCategory({})).subscribe({ next: async () => { } })  
  }

  /*******************************************************/
  /******************* REPERTOIRE CATEGORY ***************/
  /*******************************************************/
  async getRepertoireCategories(){                
    this.repertoireCategoriesSubscription = this.repertoireCategories$     
      .subscribe({
        next: async ()=> {                       
          const finish = this.store.selectSnapshot(RepertoireCategoryState.finish);          
          const errorStatusCode = this.store.selectSnapshot(RepertoireCategoryState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(RepertoireCategoryState.errorMessage);                         
          if(finish){            
            if(errorStatusCode==200){      
              this.repertoireCategories = this.store.selectSnapshot(RepertoireCategoryState.repertoireCategories);
              if(!this.repertoireCategories){
                this.repertoireCategories = [];
              }             
            }
            else{              
              this.repertoireCategories = [];
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                             
            // cara vez que recagamos la lista de grupos de partituras, collapsamos todos los acordeones            
            this.initSearchFinish = true;    
            this.dismissInitialLoading();  
          }          
        }
      })    
  }

  async filterRepertoireCategories(showLoading:boolean=true){     
    if(showLoading){      
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetRepertoireCategories({/*name: this.filter.name*/}));    
  }

  refreshRepertoireCategories($event){          
    this.filterRepertoireCategories();    
    $event.target.complete();
  }

  trackByRepertoireCategoryFn(index, repertoireCategory) {      
    return repertoireCategory.id;
  }

  async createRepertoireCategory(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalRepertoireCategoryComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateRepertoireCategory({repertoireCategory: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(RepertoireCategoryState.success);
            if(success){
              this.toast.presentToast("Categoria creada correctamente");            
              this.filterRepertoireCategories(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(RepertoireCategoryState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireCategoryState.errorMessage);        
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

  async updateRepertoireCategory(event: Event, repertoireCategory: RepertoireCategory){  
    event.stopPropagation(); 
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal    
    const modal = await this.modalController.create({
      component: ModalRepertoireCategoryComponent,
      componentProps: {
        repertoireCategory: repertoireCategory,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){          
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateRepertoireCategory({id: data.id, repertoireCategory:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(RepertoireCategoryState.success);
          if(success){
            this.toast.presentToast("Categoria modificada correctamente");
            this.filterRepertoireCategories(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(RepertoireCategoryState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(RepertoireCategoryState.errorMessage);        
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

  async confirmDeleteRepertoireCategory(event: Event, repertoireCategory:RepertoireCategory) {
    event.stopPropagation(); // Detener la propagación del evento de clic
   
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la categoria?',
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
              this.deleteRepertoireCategory(repertoireCategory);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteRepertoireCategory(repertoireCategory:RepertoireCategory) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteRepertoireCategory({id: repertoireCategory.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(RepertoireCategoryState.success);
        if(success){
          this.toast.presentToast("Categoria eliminada correctamente");
          this.filterRepertoireCategories(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(RepertoireCategoryState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(RepertoireCategoryState.errorMessage);        
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
    
  async openModalRepertoireCategory(event: Event, repertoireCategory: RepertoireCategory){
    event.stopPropagation(); 

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalRepertoireMarchComponent,
      componentProps: {
        categoryId: repertoireCategory.id,
        categoryName: repertoireCategory.name
      }
    });
    modal.present();

  }


  /****************************************************************/
  /******************* REPERTOIRE MARCH TYPES *********************/
  /****************************************************************/
  async openModalRepertoireMarchTypes(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalRepertoireMarchTypeComponent,
    });
    modal.present();

  }


  /**********************************************************/
  /******************* REPERTOIRE MARCH *********************/
  /**********************************************************/
  async createRepertoireMarch(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalEditRepertoireMarchComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateRepertoireMarch({repertoireMarch: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(RepertoireMarchState.success);
            if(success){
              this.toast.presentToast("Marcha creada correctamente");    
              await this.loadingService.dismissLoading();                            
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(RepertoireMarchState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireMarchState.errorMessage);        
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

}
