import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertController, ModalController } from '@ionic/angular';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { VideoState } from '../state/video/video.state';
import { Select, Store } from '@ngxs/store';
import { VideoGroupByCategory } from '../models/video/video-group-by-category';
import { FilterVideos } from '../models/video/filter-videos';
import { DEFAULT_ANYO_IMAGE, DEFAULT_CATEGORY_VIDEO_IMAGE } from '../constants/constants';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { CreateVideo, DeleteVideo, GetVideosGroupByCategory, ResetVideo, UpdateVideo } from '../state/video/video.actions';
import { CreateVideoCategory, DeleteVideoCategory, GetVideoCategoriesGroupByYear, ResetVideoCategory, UpdateVideoCategory } from '../state/video-category/video-category.actions';
import { Video } from '../models/video/video';
import { ModalViewVideoComponent } from './component/modal-view-video/modal-view-video.component';
import { VideoCategory } from '../models/video-category/video-category';
import { ModalVideoCategoryComponent } from './component/modal-video-category/modal-video-category.component';
import { VideoCategoryState } from '../state/video-category/video-category.state';
import { ModalVideoComponent } from './component/modal-video/modal-video.component';
import { ModalViewCategoryImageComponent } from './component/modal-view-category-image/modal-view-category-image.component';
import { VideoCategoryGroupByYear } from '../models/video-category/video-category-group-by-year';
import { ModalViewCategoryVideosComponent } from './component/modal-view-category-videos/modal-view-category-videos.component';

@Component({
  selector: 'app-menu-multimedia',
  templateUrl: './menu-multimedia.page.html',
  styleUrls: ['./menu-multimedia.page.scss'],
})
export class MenuMultimediaPage  implements OnDestroy {

  isVideoModalOpen = false;  
  selectedVideoLink: SafeResourceUrl | null = null;

  videosGroupByCategorySubscription: Subscription;
  @Select(VideoState.videosGroupByCategory)
  videosGroupByCategory$: Observable<VideoGroupByCategory[]>;
  public videosGroupByCategory: VideoGroupByCategory[];

  videoCategoriesGroupByYearSubscription: Subscription;
  @Select(VideoCategoryState.videoCategoriesGroupByYear)
  videoCategoriesGroupByYear$: Observable<VideoCategoryGroupByYear[]>;
  public videoCategoriesGroupByYear: VideoCategoryGroupByYear[];  

  public expandVideoCategoryList: string[];
  public expandVideoCategoryMap: Map<string, boolean> = new Map();
  public filter: FilterVideos;
  public searchTextChanged = new Subject<string>();
  public isSearching: boolean = false;  
  public defaultVideoCategoryImage: string = DEFAULT_CATEGORY_VIDEO_IMAGE;    
  public defaultAnyoImage: string = DEFAULT_ANYO_IMAGE;
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public initSearchGroupYearFinish = false;
  public editMode = false;

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
    this.expandVideoCategoryList = null;
    this.expandVideoCategoryMap = null;
    this.filter = new FilterVideos();
    this.filter.name = '';
    this.isSearching = false;
    this.searchTextChanged
      .pipe(debounceTime(300)) // 200 milisegundos de espera
      .subscribe(value => {
        this.searchVideos(value);
      });      
  }

  onSlideChange(swiper: any) {
    if (swiper.detail[0].isEnd) {
      swiper.detail[0].activeIndex=-1;
    }
  }
  
  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  getAutoplayDelay(index: number): number {
    return 3000 + (index * 1000);
  }

  async ionViewWillEnter(){       
    this.profile = await this.storage.getItem('profile');         
    this.getVideosGroupByCategory();      
    this.filterVideos();    

    this.getVideoCategoriesGroupByYear();      
    this.filterVideoCategoriesGroupByYear(false);    
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish && this.initSearchGroupYearFinish){
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
    console.log("ngOnDestroy multimedia");
    if (this.videosGroupByCategorySubscription) {      
      this.videosGroupByCategorySubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    if (this.videosGroupByCategorySubscription) {      
      this.videosGroupByCategorySubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetVideo({})).subscribe({ next: async () => { } })
    this.store.dispatch(new ResetVideoCategory({})).subscribe({ next: async () => { } })    
  }

  /*******************************************************/
  /********************* VIDEOS **************************/
  /*******************************************************/
  async createVideo(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalVideoComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){     
      await this.loadingService.presentLoading('Loading...');    
      data.videoCategoryId = data.videoCategory.id;
      
      this.store.dispatch(new CreateVideo({video: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(VideoState.success);
            if(success){
              this.toast.presentToast("Video creado correctamente");            
              // cuando insertamos siempre expandimos
              this.expandVideoCategoryMap.set(data.voiceId+"", true);
              this.updateExpandVideoCategoryList();            
              this.filterVideos(false);  
              this.filterVideoCategoriesGroupByYear(false);            
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(VideoState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(VideoState.errorMessage);        
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

  async updateVideo(video:Video, event: Event) {
    event.stopPropagation();
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalVideoComponent,
      componentProps: {
        video,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');    
      data.videoCategoryId = data.videoCategory.id;
      this.store.dispatch(new UpdateVideo({id: data.id, video:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(VideoState.success);
          if(success){
            this.toast.presentToast("Músico modificado correctamente");
            this.filterVideos(false);  
            this.filterVideoCategoriesGroupByYear(false);               
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(VideoState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(VideoState.errorMessage);        
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

  async getVideosGroupByCategory(){            
    this.videosGroupByCategorySubscription = this.videosGroupByCategory$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(VideoState.finish);          
          const errorStatusCode = this.store.selectSnapshot(VideoState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(VideoState.errorMessage);               
          if(finish){             
            if(errorStatusCode==200){      
              this.videosGroupByCategory = this.store.selectSnapshot(VideoState.videosGroupByCategory);
              if(!this.videosGroupByCategory){
                this.videosGroupByCategory = [];
              }
              if(this.expandVideoCategoryList===null){                              
                this.expandVideoCategoryMap = new Map(); 
                this.videosGroupByCategory.map(video => video.category.id+"").forEach(element => {
                  //this.expandVideoCategoryMap.set(element, true);
                  this.expandVideoCategoryMap.set(element, false);                });
                this.updateExpandVideoCategoryList();              
              }
              else{                        
                this.updateExpandVideoCategoryList();
              }
            }
            else{
              if(this.expandVideoCategoryList===null){                             
                this.expandVideoCategoryMap = new Map(); 
              }
              this.videosGroupByCategory = [];
              this.videosGroupByCategory.map(video => video.category.id+"").forEach(element => {
                this.expandVideoCategoryMap.set(element, false);
              });  
              this.updateExpandVideoCategoryList();
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
        }
      })
  }

  async getVideoCategoriesGroupByYear(){            
    this.videoCategoriesGroupByYearSubscription = this.videoCategoriesGroupByYear$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(VideoCategoryState.finish);          
          const errorStatusCode = this.store.selectSnapshot(VideoCategoryState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(VideoCategoryState.errorMessage);               
          if(finish){             
            if(errorStatusCode==200){      
              this.videoCategoriesGroupByYear = this.store.selectSnapshot(VideoCategoryState.videoCategoriesGroupByYear);
              if(!this.videoCategoriesGroupByYear){
                this.videoCategoriesGroupByYear = [];
              }                 
            }
            else{
              this.videoCategoriesGroupByYear = [];              
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                                     
            this.initSearchGroupYearFinish = true;    
            this.dismissInitialLoading();                 
          }          
        }
      })
  }

  trackByVideoCategoryFn(index, videoCategory) {    
    return videoCategory.id; // Utiliza un identificador único de tu elemento
  }

  trackByVideoFn(index, video) {    
    return video.id; // Utiliza un identificador único de tu elemento
  }

  async filterVideos(showLoading:boolean=true){
    this.initSearchFinish=false;
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetVideosGroupByCategory({name: this.filter.name}));    
  }

  async filterVideoCategoriesGroupByYear(showLoading:boolean=true){
    this.initSearchGroupYearFinish=false;
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetVideoCategoriesGroupByYear({onlyPublic:true}));    
  }

  async confirmDeleteVideo(video:Video, event: Event) {
    event.stopPropagation(); // Evita la apertura del modal

    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el video?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
             
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteVideo(video);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteVideo(video:Video) {
    
    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteVideo({id: video.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(VideoState.success);
        if(success){
          this.toast.presentToast("Vídeo eliminado correctamente");
          this.filterVideos(false);         
          this.filterVideoCategoriesGroupByYear(false);        
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(VideoState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(VideoState.errorMessage);        
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
    this.expandVideoCategoryMap.forEach((value, key) => {
      this.expandVideoCategoryMap.set(key, true);
    }); 
    this.updateExpandVideoCategoryList();    
  }

  collapseAll(){    
    this.expandVideoCategoryMap.forEach((value, key) => {
      this.expandVideoCategoryMap.set(key, false);
    });
    this.updateExpandVideoCategoryList();    
  }

  accordionGroupChange = (ev: any) => {
    this.expandVideoCategoryMap.forEach((value, key) => {
      this.expandVideoCategoryMap.set(key, false);
    });
    ev.detail.value.forEach(element => {
      this.expandVideoCategoryMap.set(element, true);
    }); 
    this.updateExpandVideoCategoryList();    
  };
  
  refreshVideos($event){      
    this.filterVideos();    
    this.filterVideoCategoriesGroupByYear(false);
    $event.target.complete();
  }

  searchVideos(searchText: string) {
    if(this.isSearching == false){
      this.isSearching = true;
      this.filterVideos();    
      this.filterVideoCategoriesGroupByYear(false);
    }
  }

  onSearchTextChanged(event: any) {
    this.searchTextChanged.next(event.detail.value);
  }

  updateExpandVideoCategoryList(){
    this.expandVideoCategoryList = Array.from(this.expandVideoCategoryMap)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
  }

  getThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  async viewVideo(video: Video, videoId: string) {    
    await this.loadingService.presentLoading('Loading...');    
    video.videoCategory = this.videosGroupByCategory.find(videoGroupByCategory => videoGroupByCategory.category.id === video.videoCategoryId).category
    const videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    const modal = await this.modalController.create({
      component: ModalViewVideoComponent,
      componentProps: { videoLink, video }
    });
    await modal.present();
  }
  
  /*******************************************************/
  /******************* VIDEO CATEOGIRES  *****************/
  /*******************************************************/
  async createVideoCategory(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // abrimos la modal
    const modal = await this.modalController.create({
      component: ModalVideoCategoryComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateVideoCategory({videoCategory: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(VideoCategoryState.success);
            if(success){
              this.toast.presentToast("Categoria creada correctamente");            
              this.filterVideos(false);     
              this.filterVideoCategoriesGroupByYear(false);            
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(VideoCategoryState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(VideoCategoryState.errorMessage);        
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

  async updateVideoCategory(event: Event, videoCategory:VideoCategory){  
    event.stopPropagation(); 

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   
    
    // abrimos modal
    const modal = await this.modalController.create({
      component: ModalVideoCategoryComponent,
      componentProps: {
        videoCategory,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');        
      this.store.dispatch(new UpdateVideoCategory({id: data.id, videoCategory:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(VideoCategoryState.success);
          if(success){
            this.toast.presentToast("Categoría modificada correctamente");
            this.filterVideos(false);  
            this.filterVideoCategoriesGroupByYear(false);               
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(VideoCategoryState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(VideoCategoryState.errorMessage);        
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

  async confirmDeleteVideoCategory(event: Event, videoCategory:VideoCategory) {
    event.stopPropagation(); // Detener la propagación del evento de clic

    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la categoría?',
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
              this.deleteVideoCategory(videoCategory);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteVideoCategory(videoCategory:VideoCategory) {
    // eliminamos la voz
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteVideoCategory({id: videoCategory.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(VideoCategoryState.success);
        if(success){
          this.toast.presentToast("Categoría eliminada correctamente");
          this.filterVideos(false);  
          this.filterVideoCategoriesGroupByYear(false);               
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(VideoCategoryState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(VideoCategoryState.errorMessage);        
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

  async openCategoryImage(event: Event,videoCategory: VideoCategory){
    event.stopPropagation(); 

    if(!videoCategory.image){
      this.toast.presentToast("No existe imagen para previsualizar");
    }
    else{      
      await this.loadingService.presentLoading('Loading...');    
      const modal = await this.modalController.create({
        component: ModalViewCategoryImageComponent,
        componentProps: { videoCategory, loadImage: true },
      });

      await modal.present();
    }    
  }

  onEditMode(event: any){    
    console.log("editMode", this.editMode);   
  }

  async openVideoCategoryModal(videoCategory: VideoCategory) {
    // teniendo la categoria y videosGroupByCategory quiero coger todos los videos asociados a la categoria
    const videos = this.videosGroupByCategory.find(videoGroupByCategory => videoGroupByCategory.category.id === videoCategory.id).videos;

    if(!videos || videos.length==0){
      this.toast.presentToast("No hay videos asociados a esta galería");
    }
    else{
      await this.loadingService.presentLoading('Loading...');    
      const modal = await this.modalController.create({
        component: ModalViewCategoryVideosComponent,
        componentProps: { category: videoCategory, videos: videos },
      });

      await modal.present();
    }

  }

}
