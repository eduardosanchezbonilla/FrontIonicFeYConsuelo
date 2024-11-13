import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { Video } from 'src/app/models/video/video';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-view-video',
  templateUrl: './modal-view-video.component.html',
  styleUrls: ['./modal-view-video.component.scss'],
})
export class ModalViewVideoComponent {

  @Input() video: Video;
  @Input() videoLink: SafeResourceUrl;

  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }
  
  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  cancel() {
    this.modalController.dismiss();
  }
}