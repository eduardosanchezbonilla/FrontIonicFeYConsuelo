import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE } from 'src/app/constants/constants';
import { RepertoireMarchType } from 'src/app/models/repertoire-march-type/repertoire-march-type';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-edit-repertoire-march-type',
  templateUrl: './modal-edit-repertoire-march-type.component.html',
  styleUrls: ['./modal-edit-repertoire-march-type.component.scss'],
})
export class ModalEditRepertoireMarchTypeComponent implements OnInit {

  @Input() repertoireMarchType: RepertoireMarchType;
  @Input() updating: boolean;  
  public showImage: string;
  public selectedImage: string;
  
  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    if(!this.repertoireMarchType){
      this.repertoireMarchType = new RepertoireMarchType();          
      this.repertoireMarchType.order = 10;
      this.showImage = null;
    }
    else{
      if(this.repertoireMarchType.image){
        this.showImage = `data:image/jpeg;base64,${this.repertoireMarchType.image}`;
        this.selectedImage = this.repertoireMarchType.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE}`;
        this.selectedImage = DEFAULT_REPERTOIRE_MARCH_TYPE_IMAGE;
      }      
    }     
  }
  
  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){
    this.repertoireMarchType.image = this.selectedImage;
    this.modalController.dismiss(this.repertoireMarchType, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
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
