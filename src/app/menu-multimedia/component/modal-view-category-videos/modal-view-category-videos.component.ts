import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonModal, ModalController } from '@ionic/angular';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { Video } from 'src/app/models/video/video';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ModalViewVideoComponent } from '../modal-view-video/modal-view-video.component';

@Component({
  selector: 'app-modal-view-category-videos',
  templateUrl: './modal-view-category-videos.component.html',
  styleUrls: ['./modal-view-category-videos.component.scss'],
})
export class ModalViewCategoryVideosComponent implements OnInit, OnDestroy {

  @Input() category: VideoCategory;  
  @Input() videos: Video[];  

  public initScreen = false;

  constructor(
      private sanitizer: DomSanitizer,      
      private modalController: ModalController,
      private loadingService: LoadingService
  ) {     
  }

  async ngOnInit() {    
    
  }

  async dismissInitialLoading(){
    if(this.initScreen){
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

  async viewVideo(video: Video, videoId: string) {    
    await this.loadingService.presentLoading('Loading...');   
    video.videoCategory = this.category; 
    const videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    const modal = await this.modalController.create({
      component: ModalViewVideoComponent,
      componentProps: { videoLink, video }
    });
    await modal.present();
  }

  trackByVideoFn(index, video) {    
    return video.id; // Utiliza un identificador único de tu elemento
  }
}
