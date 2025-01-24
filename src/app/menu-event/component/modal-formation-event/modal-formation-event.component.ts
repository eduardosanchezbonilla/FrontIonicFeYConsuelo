import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';

@Component({
  selector: 'app-modal-formation-event',
  templateUrl: './modal-formation-event.component.html',
  styleUrls: ['./modal-formation-event.component.scss'],
})
export class ModalFormationEventComponent implements OnInit {

  public initScreen = false;
  public initSearchFinish = false;

  constructor(
      private store:Store,
      private modalController: ModalController,
      private loadingService: LoadingService,
      private storage: StorageService,
      private toast:ToastService,   
      private cameraService: CameraService,
      private userService: UsersService,
    ) { }

  async ngOnInit() {               
    /*
    this.store.dispatch(new GetVoices({}));
    this.getVoices();    

    // si es readonly, ademas voy a obtener la imagen original para poder motrarla
    if(this.isReadonly && this.event.image){
      this.getEvent(this.event);      
    }
    else{
      this.initImageReadonly  = true;
    }*/
   this.dismissInitialLoading();
  }

  async dismissInitialLoading(){
    if(this.initScreen /*&& this.initSearchFinish && this.initImageReadonly*/){
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
    console.log("ngOnDestroy formation event");
    /*if (this.voicesSubscription) {      
      this.voicesSubscription.unsubscribe();  
    } */    
  }  

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }
}
