import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULT_CATEGORY_VIDEO_IMAGE } from 'src/app/constants/constants';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-video-category',
  templateUrl: './modal-video-category.component.html',
  styleUrls: ['./modal-video-category.component.scss'],
})
export class ModalVideoCategoryComponent implements OnInit {

  @Input() videoCategory: VideoCategory;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;

  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService
  ) { }

  async ngOnInit() {
    if(!this.videoCategory){
      this.videoCategory = new VideoCategory();    
      this.videoCategory.isPublic = true;
      this.videoCategory.order = 10;
      this.videoCategory.date = new Date().toISOString();
      this.showImage = null;
    }
    else{
      if(this.videoCategory.image){
        this.showImage = `data:image/jpeg;base64,${this.videoCategory.image}`;
        this.selectedImage = this.videoCategory.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_CATEGORY_VIDEO_IMAGE}`;
        this.selectedImage = DEFAULT_CATEGORY_VIDEO_IMAGE;
      }      
    }     
  }
  
  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){
    this.videoCategory.image = this.selectedImage;
    this.modalController.dismiss(this.videoCategory, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  /*inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }*/

  async selectImage() {    
    this.selectedImage =  await this.cameraService.getPhotoBase64(90);
    this.showImage = `data:image/jpeg;base64,${this.selectedImage}`;    
  }

  clearImage() {
    this.showImage = null;
    this.selectedImage = '';
  }

}
