import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetVideoCategoryImage } from 'src/app/state/video-category/video-category.actions';
import { VideoCategoryState } from 'src/app/state/video-category/video-category.state';

@Component({
  selector: 'app-modal-view-category-image',
  templateUrl: './modal-view-category-image.component.html',
  styleUrls: ['./modal-view-category-image.component.scss'],
})
export class ModalViewCategoryImageComponent implements OnInit, OnDestroy {

  @Select(VideoCategoryState.videoCategory)
  videoCategoryImage$: Observable<VideoCategory>;
  videoCategoryImageSubscription: Subscription;
  public videoCategoryImage: VideoCategory;

  @Input() videoCategory: VideoCategory;  
  @Input() loadImage: Boolean;  
  public initScreen = false;
  public initSearchFinish = false;
  public imageLoaded = false;
  public loading: boolean = true; // Estado de carga de la imagen


  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private userService: UsersService,
    private toast:ToastService,
  ) {     
  }

  async ngOnInit() {    
    if(this.loadImage){
      this.store.dispatch(new GetVideoCategoryImage({id:this.videoCategory.id}));
      this.getVideoCategoryImage();        
    }
    else{
      this.videoCategoryImage = this.videoCategory;            
      this.initSearchFinish = true;    
      this.dismissInitialLoading();     
    }
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish && this.imageLoaded){
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
    if (this.videoCategoryImageSubscription) {      
      this.videoCategoryImageSubscription.unsubscribe();  
    }     
    if(this.videoCategoryImage){
      this.videoCategoryImage.name = '';   
      this.videoCategoryImage.image = '';   
    }
  }

  getVideoCategoryImage(){
    this.videoCategoryImageSubscription = this.videoCategoryImage$.subscribe({
      next: async ()=> {
        const finish = this.store.selectSnapshot(VideoCategoryState.finish);     
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(VideoCategoryState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(VideoCategoryState.errorMessage);  
          if(errorStatusCode==200){
            this.videoCategoryImage = this.store.selectSnapshot(VideoCategoryState.videoCategory);            
            this.initSearchFinish = true;    
            this.dismissInitialLoading();      
          }
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }             
        }                
      }
    })
  }

  onImageLoad() {
    this.imageLoaded = true; // Oculta el loader cuando la imagen termina de cargarse
    this.loading = false;
    this.dismissInitialLoading();    
  }

  confirm(){
    this.modalController.dismiss(null, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

}
