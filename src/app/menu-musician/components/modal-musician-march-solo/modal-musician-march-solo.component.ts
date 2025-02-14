import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_MUSICIAN_IMAGE } from 'src/app/constants/constants';
import { MusicianMarchSoloResponse } from 'src/app/models/musician-march-solo/musician-march-solo-response';
import { Musician } from 'src/app/models/musician/musician';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetMusicianMarchSolo, ResetMusicianMarchSolo } from 'src/app/state/musician-march-solo/musician-march-solo.actions';
import { MusicianMarchSoloState } from 'src/app/state/musician-march-solo/musician-march-solo.state';

@Component({
  selector: 'app-modal-musician-march-solo',
  templateUrl: './modal-musician-march-solo.component.html',
  styleUrls: ['./modal-musician-march-solo.component.scss'],
})
export class ModalMusicianMarchSoloComponent implements OnInit {

  @Select(MusicianMarchSoloState.musicianMarchSolos)
  musicianMarchSolos$: Observable<MusicianMarchSoloResponse[]>;
  musicianMarchSolosSubscription: Subscription;
  public musicianMarchSolos: MusicianMarchSoloResponse[];

  @Input() musician: Musician;
  public showImage: string;

  public initScreen = false;
  public initSearchFinish = false;

  constructor(
      private store:Store,
      private modalController: ModalController,
      private toast:ToastService,
      private userService: UsersService,
      private loadingService: LoadingService,
      private alertController: AlertController
  ) { }
  

  async ngOnInit() {    
     if(this.musician.image){
       this.showImage = `data:image/jpeg;base64,${this.musician.image}`;      
     }
     else{
       this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;      
     }     
     this.store.dispatch(new GetMusicianMarchSolo({musicianId: this.musician.id}));
     this.getMusicianMarchSolos();     
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
    console.log("ngOnDestroy musician events");
    if (this.musicianMarchSolosSubscription) {      
      this.musicianMarchSolosSubscription.unsubscribe();  
    }         
    this.store.dispatch(new ResetMusicianMarchSolo({})).subscribe({ next: async () => { } })  
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getMusicianMarchSolos(){
    this.musicianMarchSolosSubscription = this.musicianMarchSolos$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(MusicianMarchSoloState.finish)                
        if(finish){   
          const errorStatusCode = this.store.selectSnapshot(MusicianMarchSoloState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(MusicianMarchSoloState.errorMessage);  
          if(errorStatusCode==200){
            this.musicianMarchSolos = this.store.selectSnapshot(MusicianMarchSoloState.musicianMarchSolos);                  
            this.initSearchFinish = true;    
            this.dismissInitialLoading();              
          }                  
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }
      }
    })
  }

}
