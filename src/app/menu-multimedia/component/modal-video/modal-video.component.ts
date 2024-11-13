import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { Video } from 'src/app/models/video/video';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { GetVideoCategories } from 'src/app/state/video-category/video-category.actions';
import { VideoCategoryState } from 'src/app/state/video-category/video-category.state';

@Component({
  selector: 'app-modal-video',
  templateUrl: './modal-video.component.html',
  styleUrls: ['./modal-video.component.scss'],
})
export class ModalVideoComponent implements OnInit, OnDestroy {

  @Select(VideoCategoryState.videoCategories)
  videoCategories$: Observable<VideoCategory[]>;
  videoCategoriesSubscription: Subscription;
  public videoCategories: VideoCategory[];

  @Input() video: Video;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  public initScreen = false;
  public initSearchFinish = false;

  thumbnailUrl: string | null = 'https://img.youtube.com/vi/notexists/0.jpg';
  defaultThumbnailUrl = 'notexits'; 
  
  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    if(!this.video){
      this.video = new Video();      
      this.showImage = null;
      this.video.order = 10;     
      this.thumbnailUrl = 'https://img.youtube.com/vi/notexists/0.jpg';
    }  
    else{
      let videoCategory  = new VideoCategory();
      videoCategory.id = this.video.videoCategoryId;
      this.video.videoCategory = videoCategory;
      this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.youtubeId}/0.jpg`;
    }  
    this.store.dispatch(new GetVideoCategories({}));
    this.getVideoCategories();        
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
    console.log("ngOnDestroy video");
    if (this.videoCategoriesSubscription) {      
      this.videoCategoriesSubscription.unsubscribe();  
    }        
  }

  compareWith(o1: VideoCategory, o2: VideoCategory){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  getVideoCategories(){
    this.videoCategoriesSubscription = this.videoCategories$.subscribe({
      next: async ()=> {
        this.videoCategories = this.store.selectSnapshot(VideoCategoryState.videoCategories);            
        this.initSearchFinish = true;    
        this.dismissInitialLoading();      
      }
    })
  }

  confirm(){
    this.modalController.dismiss(this.video, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  /*inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }*/

  
  closeModal(modal: IonModal) {
    modal.dismiss();
  }

  loadThumbnail(youtubeId: string) {
    if (youtubeId && youtubeId.length >= 5) {
      this.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
    } else {
      this.thumbnailUrl = `https://img.youtube.com/vi/noptexits/0.jpg`; // Muestra la imagen predeterminada
    }
  }

}
