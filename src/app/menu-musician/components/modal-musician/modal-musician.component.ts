import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Musician } from '../../../models/musician/musician';
import { Select, Store } from '@ngxs/store';
import { IonModal, ModalController } from '@ionic/angular';
import { Voice } from '../../../models/voice/voice';
import { Observable, Subscription } from 'rxjs';
import { GetVoices } from '../../../state/voice/voice.actions';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VoiceState } from '../../../state/voice/voice.state';
import { DEFAULT_MUSICIAN_IMAGE } from '../../../constants/constants';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-musician',
  templateUrl: './modal-musician.component.html',
  styleUrls: ['./modal-musician.component.scss'],
})
export class ModalMusicianComponent implements OnInit, OnDestroy {

  @Select(VoiceState.voices)
  voices$: Observable<Voice[]>;
  voicesSubscription: Subscription;
  public voices: Voice[];

  @Input() musician: Musician;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  public initScreen = false;
  public initSearchFinish = false;
  
  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {
    if(!this.musician){
      this.musician = new Musician();      
      this.showImage = null;
      this.musician.registrationDate = new Date().toISOString();
      this.musician.birthDate = new Date().toISOString();
    }
    else{
      if(this.musician.image){
        this.showImage = `data:image/jpeg;base64,${this.musician.image}`;
        this.selectedImage = this.musician.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;
        this.selectedImage = DEFAULT_MUSICIAN_IMAGE;
      }            
    }
    this.store.dispatch(new GetVoices({}));
    this.getVoices();        
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
    console.log("ngOnDestroy musician");
    if (this.voicesSubscription) {      
      this.voicesSubscription.unsubscribe();  
    }        
  }

  compareWith(o1: Voice, o2: Voice){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  getVoices(){
    this.voicesSubscription = this.voices$.subscribe({
      next: async ()=> {
        this.voices = this.store.selectSnapshot(VoiceState.voices).map(({ image, ...rest }) => rest);            
        this.initSearchFinish = true;    
        this.dismissInitialLoading();      
      }
    })
  }

  confirm(){
    this.musician.image = this.selectedImage;
    this.modalController.dismiss(this.musician, 'confirm');
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
      //width: 200,
      //height: 200,      
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

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

}