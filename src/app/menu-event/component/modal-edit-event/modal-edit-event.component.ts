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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  public selectedType: string = null;

  public showImage: string;
  public selectedImage: string;

  @Select(VoiceState.voices)
  voices$: Observable<Voice[]>;
  voicesSubscription: Subscription;
  public voices: Voice[];


  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
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
    
    this.initSearchFinish = true;   
    await this.loadingService.dismissLoading();    

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
    console.log("ngOnDestroy edit event");
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
                        
        if(!this.updating){
          if(this.type==='REHEARSAL'){       
            this.event.voiceList = this.voices .filter(
              voice => !voice.name.toLowerCase().includes('antiguo') && !voice.name.toLowerCase().includes('banderin') && !voice.name.toLowerCase().includes('escolta')
            );
          }
          else if(this.type==='PERFORMANCE'){       
            this.event.voiceList = this.voices .filter(
              voice => !voice.name.toLowerCase().includes('antiguo')
            );
          }
          else{
            this.event.voiceList = this.voices;
          }
        }
        this.initSearchFinish = true;    
        this.dismissInitialLoading();      
      }
    })
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
    this.event.image = this.selectedImage;    
    this.event.date = this.formatDate(this.event.date);
    this.event.endDate = this.event.endDate ? this.formatDate(this.event.endDate):null; 
    this.modalController.dismiss(this.event, 'confirm');
  }

}
