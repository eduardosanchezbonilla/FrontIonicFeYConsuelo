import { Component, Input, OnInit } from '@angular/core';
import { Voice } from '../../../models/voice/voice';
import { Store } from '@ngxs/store';
import { ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DEFAULT_VOICE_IMAGE } from '../../../constants/constants';
import { LoadingService } from 'src/app/services/loading/loading.service';

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
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService
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
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      correctOrientation: true,
      resultType: CameraResultType.Base64, 
      source: CameraSource.Prompt 
    });

    this.showImage = `data:image/jpeg;base64,${image.base64String}`;
    this.selectedImage = image.base64String;
  }

  clearImage() {
    this.showImage = null;
    this.selectedImage = '';
  }

}

