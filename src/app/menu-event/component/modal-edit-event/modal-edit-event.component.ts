import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSegment, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Event } from 'src/app/models/event/event';
import { Voice } from 'src/app/models/voice/voice';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { GetVoices } from 'src/app/state/voice/voice.actions';
import { VoiceState } from 'src/app/state/voice/voice.state';
import { DEFAULT_EVENT_IMAGE } from '../../../constants/constants';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModalViewCategoryImageComponent } from 'src/app/menu-multimedia/component/modal-view-category-image/modal-view-category-image.component';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { GetEvent } from 'src/app/state/event/event.actions';
import { EventState } from 'src/app/state/event/event.state';
import { CameraService } from 'src/app/services/camera/camera.service';
import { UsersService } from 'src/app/services/user/users.service';

@Component({
  selector: 'app-modal-edit-event',
  templateUrl: './modal-edit-event.component.html',
  styleUrls: ['./modal-edit-event.component.scss'],
})
export class ModalEditEventComponent implements OnInit {
    
  @Input() date: string;
  @Input() type: string;
  @Input() event: Event;
  @Input() updating: boolean;
  
  public initScreen = false;
  public initSearchFinish = false;
  public initImageReadonly = false;
  public selectedType: string = null;
  public profile: string; 

  public showImage: string;
  public selectedImage: string;
  public isReadonly:boolean = false;

  @Select(VoiceState.voices)
  voices$: Observable<Voice[]>;
  voicesSubscription: Subscription;
  public voices: Voice[];
  public selectedVoicesForMusicianView: Voice[]; 

  public imageLoaded = false;
  public loading: boolean = true; // Estado de carga de la imagen

  public originalImage: string;


  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private storage: StorageService,
    private toast:ToastService,   
    private cameraService: CameraService,
    private userService: UsersService,
  ) { }

  getTime(time: string){
    const [hours, minutes] = time.split(':').map(Number); 
    const today = new Date();
    today.setHours(hours, minutes, 0, 0); // Establece las horas y minutos

    return today.getFullYear() +
    '-' +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    today.getDate().toString().padStart(2, '0') +
    'T' +
    today.getHours().toString().padStart(2, '0') +
    ':' +
    today.getMinutes().toString().padStart(2, '0') +
    ':' +
    today.getSeconds().toString().padStart(2, '0');   
  }
  

  async ngOnInit() {  
       
    if(!this.event){
      this.showImage = null;
      this.event = new Event(null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null);      
      this.event.date = this.date ? this.date:new Date().toISOString();       
      this.event.endDate = this.date ? this.date:new Date().toISOString();       
      this.event.displacementBus = false;

      if(this.type==='REHEARSAL'){       
        this.event.startTime = '21:00';     
        this.event.endTime = '23:00'; 
        this.event.description = 'Ensayo General';
        this.event.repetitionPeriod = '';
        this.event.location = 'Local de ensayo de los Arrayanes';
        this.event.type = 'REHEARSAL';
      }
      if(this.type==='PERFORMANCE'){      
        this.event.startTime = '18:00';     
        this.event.endTime = '20:00'; 
        this.event.repetitionPeriod = '';
        this.event.performanceType = 'CONCIERTO';
        this.event.type = 'PERFORMANCE';
      }      
    }
    else{
      if(this.event.type==='PERFORMANCE'){
        if(this.event.image){
          this.showImage = `data:image/jpeg;base64,${this.event.image}`;
          this.selectedImage = this.event.image;
        }
        else{
          this.showImage = `data:image/jpeg;base64,${DEFAULT_EVENT_IMAGE}`;
          this.selectedImage = DEFAULT_EVENT_IMAGE;
        }      
      }      
    }
    
    //this.initSearchFinish = true;   
    //await this.loadingService.dismissLoading();    

    this.profile = await this.storage.getItem('profile');      

    if(this.profile==='SUPER_ADMIN' || this.profile==='ADMIN'){
      this.isReadonly = false;      
      this.initImageReadonly = true;
      this.originalImage = null;
    }
    else{
      this.isReadonly = true;
      this.initImageReadonly  = false;
    }
    
    this.store.dispatch(new GetVoices({}));
    this.getVoices();    

    // si es readonly, ademas voy a obtener la imagen original para poder motrarla
    if(this.isReadonly && this.event.image){
      this.getEvent(this.event);      
    }
    else{
      this.initImageReadonly  = true;
    }
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish && this.initImageReadonly){
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
    console.log("ngOnDestroy edit event");
    if (this.voicesSubscription) {      
      this.voicesSubscription.unsubscribe();  
    }     
  }  

  compareWith(o1: Voice, o2: Voice){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  async getEvent(event: Event){
    
    this.store.dispatch(new GetEvent({eventType:event.type,eventId: event.id}))
      .subscribe({
        next: async ()=> {          
          const success = this.store.selectSnapshot(EventState.success);
          const finish = this.store.selectSnapshot(EventState.finish);          
          const errorStatusCode = this.store.selectSnapshot(EventState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(EventState.errorMessage);               

          if(finish){                        
            if(errorStatusCode==200){                    
              this.originalImage = this.store.selectSnapshot(EventState.event).image;              
            }
            else{
              if(errorStatusCode==403){       
                this.cancel();     
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
                this.originalImage = null;
              }                   
            }                        
            this.initImageReadonly  = true; 
            this.dismissInitialLoading();                 
          }      
        }
      }
    )
  }

  getVoices(){
    this.voicesSubscription = this.voices$.subscribe({
      next: async ()=> {        
        
        const finish = this.store.selectSnapshot(VoiceState.finish);          
                      
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(VoiceState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(VoiceState.errorMessage);   
          if(errorStatusCode==200){         
            this.voices = this.store.selectSnapshot(VoiceState.voices).map(({ image, ...rest }) => rest);     
            
            if(!this.updating){
              if(this.type==='REHEARSAL'){       
                this.event.voiceList = this.voices .filter(
                  voice => !voice.name.toLowerCase().includes('banderin') && !voice.name.toLowerCase().includes('escolta')
                );
              }              
              else{
                this.event.voiceList = this.voices;
              }
            }

            // de todas las voices, seleccionamos las que estén en el evento
            this.selectedVoicesForMusicianView =  this.voices .filter(
              voice => voice.id === this.event.voiceList.find(voiceEvent => voiceEvent.id === voice.id)?.id
            );

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

  async selectImage() {    
    this.selectedImage =  await this.cameraService.getPhotoBase64(90);
    this.showImage = `data:image/jpeg;base64,${this.selectedImage}`;    
  }

  clearImage() {
    this.showImage = null;
    this.selectedImage = '';
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  formatDate(date: string): string {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato 2 dígitos
    const day = selectedDate.getDate().toString().padStart(2, '0'); // Día en formato 2 dígitos
    return `${year}-${month}-${day}`;
  }

  confirm(){    
    if(this.profile==='SUPER_ADMIN' || this.profile==='ADMIN'){
      this.event.image = this.selectedImage;    
      this.event.date = this.formatDate(this.event.date);
      this.event.endDate = this.event.endDate ? this.formatDate(this.event.endDate):null; 
      this.modalController.dismiss(this.event, 'confirm');
    }
    else{
      this.modalController.dismiss(null, 'cancel');
    }    
  }

  onImageLoad() {
    this.imageLoaded = true; // Oculta el loader cuando la imagen termina de cargarse
    this.loading = false;
    this.dismissInitialLoading();    
  }

  async openEventImage(event: any, objectEvent: Event){
    event.stopPropagation(); 

    if(this.isReadonly){

      if(!objectEvent.image){
        this.toast.presentToast("No existe imagen para previsualizar");
      }
      else{      
        let videoCategory = new VideoCategory();
        videoCategory.name = 'Cartel Actuación';
        videoCategory.image = this.originalImage;

        await this.loadingService.presentLoading('Loading...');    
        const modal = await this.modalController.create({
          component: ModalViewCategoryImageComponent,
          componentProps: { videoCategory, loadImage: false },
        });

        await modal.present();
      }    
    }
  }

}
