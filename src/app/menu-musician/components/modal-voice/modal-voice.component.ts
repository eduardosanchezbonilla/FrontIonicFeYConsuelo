import { Component, Input, OnInit } from '@angular/core';
import { Voice } from '../../../models/voice/voice';
import { ModalController } from '@ionic/angular';
import { DEFAULT_VOICE_IMAGE } from '../../../constants/constants';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { CameraService } from 'src/app/services/camera/camera.service';

@Component({
  selector: 'app-modal-voice',
  templateUrl: './modal-voice.component.html',
  styleUrls: ['./modal-voice.component.scss'],
})
export class ModalVoiceComponent implements OnInit {
  
  @Input() voice: Voice;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;

  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService
  ) { }

  async ngOnInit() {
    if(!this.voice){
      this.voice = new Voice();      
      this.showImage = null;
    }
    else{
      if(this.voice.image){
        this.showImage = `data:image/jpeg;base64,${this.voice.image}`;
        this.selectedImage = this.voice.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_VOICE_IMAGE}`;
        this.selectedImage = DEFAULT_VOICE_IMAGE;
      }      
    }     
  }
  
  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){
    this.voice.image = this.selectedImage;
    this.modalController.dismiss(this.voice, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

  async selectImage() {    
    this.selectedImage =  await this.cameraService.getPhotoBase64(90);
    this.showImage = `data:image/jpeg;base64,${this.selectedImage}`;        
  }

  clearImage() {
    this.showImage = null;
    this.selectedImage = '';
  }

}

