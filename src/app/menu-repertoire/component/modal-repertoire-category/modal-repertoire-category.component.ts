import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULT_REPERTOIRE_CATEGORY_IMAGE } from 'src/app/constants/constants';
import { RepertoireCategory } from 'src/app/models/repertoire-category/repertoire-category';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-repertoire-category',
  templateUrl: './modal-repertoire-category.component.html',
  styleUrls: ['./modal-repertoire-category.component.scss'],
})
export class ModalRepertoireCategoryComponent implements OnInit {

  @Input() repertoireCategory: RepertoireCategory;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  
  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService
  ) { }

  async ngOnInit() {
    if(!this.repertoireCategory){
      this.repertoireCategory = new RepertoireCategory();          
      this.repertoireCategory.order = 10;
      this.repertoireCategory.current = false;
      this.showImage = null;
    }
    else{
      if(this.repertoireCategory.image){
        this.showImage = `data:image/jpeg;base64,${this.repertoireCategory.image}`;
        this.selectedImage = this.repertoireCategory.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_REPERTOIRE_CATEGORY_IMAGE}`;
        this.selectedImage = DEFAULT_REPERTOIRE_CATEGORY_IMAGE;
      }      
    }     
  }
  
  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){
    this.repertoireCategory.image = this.selectedImage;
    this.modalController.dismiss(this.repertoireCategory, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
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
