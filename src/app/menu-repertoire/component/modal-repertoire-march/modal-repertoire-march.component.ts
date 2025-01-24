import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { DEFAULT_REPERTOIRE_MARCH_IMAGE, DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { FilterRepertoireMarchs } from 'src/app/models/repertoire/filter-repertoire-marchs';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { RepertoireMarchGroupByType } from 'src/app/models/repertoire/repertoire-march-group-by-type';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { CreateRepertoireMarch, DeleteRepertoireMarch, GetCategoryRepertoireMarchsGroupByType, ResetRepertoireMarch, UpdateRepertoireMarch } from 'src/app/state/repertoire/repertoire-march.actions';
import { RepertoireMarchState } from 'src/app/state/repertoire/repertoire-march.state';
import { ModalEditRepertoireMarchComponent } from '../modal-edit-repertoire-march/modal-edit-repertoire-march.component';
import { Video } from 'src/app/models/video/video';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalViewVideoComponent } from 'src/app/menu-multimedia/component/modal-view-video/modal-view-video.component';

@Component({
  selector: 'app-modal-repertoire-march',
  templateUrl: './modal-repertoire-march.component.html',
  styleUrls: ['./modal-repertoire-march.component.scss'],
})
export class ModalRepertoireMarchComponent implements OnDestroy {

  @Input() categoryId: number;
  @Input() categoryName: string;

  repertoireMarchsGroupByTypeSubscription: Subscription;
  @Select(RepertoireMarchState.repertoireMarchsGroupByType)
  repertoireMarchsGroupByType$: Observable<RepertoireMarchGroupByType[]>;
  public repertoireMarchsGroupByType: RepertoireMarchGroupByType[];
  public expandTypeList: string[];
  public expandTypeMap: Map<string, boolean> = new Map();
  public filter: FilterRepertoireMarchs;
  public searchTextChanged = new Subject<string>();
  public isSearching: boolean = false;
  public defaultRepertoireMarchImage: string = DEFAULT_REPERTOIRE_MARCH_IMAGE;
  public defaultRepertoireMarchTypeImage: string = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;    
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public totalMarchs: number = 0;
  public showTotalMarchs: boolean = true;
  
  constructor(
    private sanitizer: DomSanitizer,
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,    
    private alertController: AlertController,
    private userService: UsersService,
    private loadingService: LoadingService,
    private storage: StorageService
  ) {
    this.expandTypeList = null;
    this.expandTypeMap = null;
    this.filter = new FilterRepertoireMarchs();
    this.filter.name = '';
    this.isSearching = false;
    this.searchTextChanged
      .pipe(debounceTime(300)) // 200 milisegundos de espera
      .subscribe(value => {
        this.searchRepertoireMarchsGroupByType(value);
      });      
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  async ionViewWillEnter(){          
    this.profile = await this.storage.getItem('profile');       
    
    if(this.profile==='SUPER_ADMIN' || this.profile==='ADMIN'){
      this.showTotalMarchs = true;
    }
    else{
      this.showTotalMarchs = false;
    }
    
    this.getRepertoireMarchsGroupByType();      
    this.filterRepertoireMarchsGroupByType(false);    
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
    this.repertoireMarchsGroupByType = [];
    if (this.repertoireMarchsGroupByTypeSubscription) {      
      this.repertoireMarchsGroupByTypeSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetRepertoireMarch({})).subscribe({ next: async () => { } });
  }

  
  /*****************************************************************/
  /******************* REPERTOIRE MARCHAS **************************/
  /*****************************************************************/
  async createRepertoireMarch(){

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalEditRepertoireMarchComponent,
      componentProps: {
        categoryId: this.categoryId
      }   
    });    
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');    
      data.typeId = data.type.id;
      
      this.store.dispatch(new CreateRepertoireMarch({repertoireMarch: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(RepertoireMarchState.success);
            if(success){
              this.toast.presentToast("Marcha creada correctamente");            
              // cuando insertamos siempre expandimos
              this.expandTypeMap.set(data.typeId+"", true);
              this.updateExpandTypeList();            
              this.filterRepertoireMarchsGroupByType(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(RepertoireMarchState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(RepertoireMarchState.errorMessage);        
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

  async updateRepertoireMarch(repertoireMarch:RepertoireMarch, repertoireMarchSliding: IonItemSliding){   
    // cupdates el sliding 
    repertoireMarchSliding.close();
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalEditRepertoireMarchComponent,
      componentProps: {
        repertoireMarch,
        updating: true,
        categoryId: this.categoryId
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');    
      data.typeId = data.type.id;
      this.store.dispatch(new UpdateRepertoireMarch({id: data.id, repertoireMarch:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(RepertoireMarchState.success);
          if(success){
            this.toast.presentToast("Marcha modificada correctamente");
            this.filterRepertoireMarchsGroupByType(false);          
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(RepertoireMarchState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(RepertoireMarchState.errorMessage);        
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

  async getRepertoireMarchsGroupByType(){            
    this.repertoireMarchsGroupByTypeSubscription = this.repertoireMarchsGroupByType$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(RepertoireMarchState.finish);          
          const errorStatusCode = this.store.selectSnapshot(RepertoireMarchState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(RepertoireMarchState.errorMessage);               
          if(finish){             
            if(errorStatusCode==200){      
              this.repertoireMarchsGroupByType = this.store.selectSnapshot(RepertoireMarchState.repertoireMarchsGroupByType);
              if(!this.repertoireMarchsGroupByType){
                this.repertoireMarchsGroupByType = [];
              }
              if(this.expandTypeList===null){                              
                this.expandTypeMap = new Map(); 
                this.repertoireMarchsGroupByType.map(repertoireMarchGroupByType => repertoireMarchGroupByType.type.id+"").forEach(element => {
                  this.expandTypeMap.set(element, true);
                });
                this.updateExpandTypeList();              
              }
              else{                        
                this.updateExpandTypeList();
              }
            }
            else{
              if(this.expandTypeList===null){                             
                this.expandTypeMap = new Map(); 
              }
              this.repertoireMarchsGroupByType = [];
              this.repertoireMarchsGroupByType.map(repertoireMarchGroupByType => repertoireMarchGroupByType.type.id+"").forEach(element => {
                this.expandTypeMap.set(element, false);
              });  
              this.updateExpandTypeList();
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){     
                this.cancel();       
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
          this.calculateTotalMarchs();                  
        }
      })
  }

  calculateTotalMarchs(){
    // en el array this.musiciansGroupByVoice te go que filtrar todas las voces que no contengan ANTIGUO, y sumar todos los musicos del array musicians
    this.totalMarchs = 0;
    if(this.repertoireMarchsGroupByType){
      this.repertoireMarchsGroupByType.forEach(repertoireMarchGroupByType => {
        // si la voz no contiene la palabra ANTIGUO        
        if(repertoireMarchGroupByType.marchs){
          this.totalMarchs += repertoireMarchGroupByType.marchs.length;
        }        
      });
    }    
  }

  trackByTypeFn(index, type) {    
    return type.id; // Utiliza un identificador único de tu elemento
  }

  trackByRepertoireMarchFn(index, repertoireMarch) {    
    return repertoireMarch.id; // Utiliza un identificador único de tu elemento
  }

  async filterRepertoireMarchsGroupByType(showLoading:boolean=true){    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetCategoryRepertoireMarchsGroupByType({categoryId:this.categoryId, name: this.filter.name}));    
  }

  async confirmDeleteRepertoireMarch(repertoireMarch:RepertoireMarch, repertoireMarchSliding: IonItemSliding) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la marcha?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              repertoireMarchSliding.close();
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteRepertoireMarch(repertoireMarch,repertoireMarchSliding);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteRepertoireMarch(repertoireMarch:RepertoireMarch, repertoireMarchSliding: IonItemSliding) {
    // cerramos el sliding 
    repertoireMarchSliding.close();

    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteRepertoireMarch({id: repertoireMarch.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(RepertoireMarchState.success);
        if(success){
          this.toast.presentToast("Marcha eliminada correctamente");
          this.filterRepertoireMarchsGroupByType(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(RepertoireMarchState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(RepertoireMarchState.errorMessage);        
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

  expandAll(){    
    this.expandTypeMap.forEach((value, key) => {
      this.expandTypeMap.set(key, true);
    }); 
    this.updateExpandTypeList();    
  }

  collapseAll(){    
    this.expandTypeMap.forEach((value, key) => {
      this.expandTypeMap.set(key, false);
    });
    this.updateExpandTypeList();    
  }

  accordionGroupChange = (ev: any) => {
    this.expandTypeMap.forEach((value, key) => {
      this.expandTypeMap.set(key, false);
    });
    ev.detail.value.forEach(element => {
      this.expandTypeMap.set(element, true);
    }); 
    this.updateExpandTypeList();    
  };
  
  refreshRepertoireMarchsGroupByType($event){      
    this.filterRepertoireMarchsGroupByType();    
    $event.target.complete();
  }

  searchRepertoireMarchsGroupByType(searchText: string) {
    if(this.isSearching == false){
      this.isSearching = true;
      this.filterRepertoireMarchsGroupByType();    
    }
  }

  onSearchTextChanged(event: any) {
    this.searchTextChanged.next(event.detail.value);
  }

  updateExpandTypeList(){
    this.expandTypeList = Array.from(this.expandTypeMap)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
  }

  async viewVideo(march: RepertoireMarch, youtubeId: string) {    
    await this.loadingService.presentLoading('Loading...');    
    let video = new Video();    
    video.videoCategory = new VideoCategory();
    video.videoCategory.name = march.category.name;
    video.videoCategory.id = march.category.id;
    console
    video.description = march.description;
    video.name = march.name;    
    const videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${youtubeId}`);
    const modal = await this.modalController.create({
      component: ModalViewVideoComponent,
      componentProps: { videoLink, video }
    });
    await modal.present();
  }
    
  
}


