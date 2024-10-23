import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Inventory } from 'src/app/models/inventory/inventory';
import { DEFAULT_INVENTORY_IMAGE} from '../../../constants/constants';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-modal-inventory',
  templateUrl: './modal-inventory.component.html',
  styleUrls: ['./modal-inventory.component.scss'],
})
export class ModalInventoryComponent implements OnInit {
  
  @Input() inventory: Inventory;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  
  constructor(    
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {        
    if(!this.inventory){
      this.inventory = new Inventory();      
      this.showImage = null;
    }
    else{
      if(this.inventory.image){
        this.showImage = `data:image/jpeg;base64,${this.inventory.image}`;
        this.selectedImage = this.inventory.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_INVENTORY_IMAGE}`;
        this.selectedImage = DEFAULT_INVENTORY_IMAGE;
      }      
    }     
  }

  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();          
  }

  confirm(){    
    this.inventory.image = this.selectedImage;
    this.modalController.dismiss(this.inventory, 'confirm');
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
