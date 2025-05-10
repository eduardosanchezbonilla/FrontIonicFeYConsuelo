import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonModal, ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { DEFAULT_SURVEY_IMAGE } from 'src/app/constants/constants';
import { Survey } from 'src/app/models/survey/survey-dto';
import { SurveyOption } from 'src/app/models/survey/survey-option-dto';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { CreateSurvey, UpdateSurvey } from 'src/app/state/survey/survey.actions';
import { SurveyState } from 'src/app/state/survey/survey.state';

@Component({
  selector: 'app-modal-survey',
  templateUrl: './modal-survey.component.html',
  styleUrls: ['./modal-survey.component.scss'],
})
export class ModalSurveyComponent implements OnInit, OnDestroy {

  @Input() survey: Survey;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  public initScreen = false;

  
  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService,
    private userService: UsersService,
    private toast:ToastService,    
    private alertController: AlertController
  ) { }

  async ngOnInit() {    
    if(!this.survey){
      this.survey = new Survey(null, null, null, null, null, null, null, null, null, null, null,null);      
      this.survey.options = [];
      this.showImage = null;     
    }
    else{
      if(this.survey.image){
        this.showImage = `data:image/jpeg;base64,${this.survey.image}`;
        this.selectedImage = this.survey.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_SURVEY_IMAGE}`;
        this.selectedImage = DEFAULT_SURVEY_IMAGE;
      }                        
    }    
  }

  async dismissInitialLoading(){
    if(this.initScreen){
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
    console.log("ngOnDestroy survey");       
  }

  removeOption(i: number) {
    this.survey.options.splice(i, 1);
  }

  // Abrir alert para añadir o editar
  async openOptionAlert(index?: number) {
    const isEdit = index !== undefined;
    const opt: SurveyOption = isEdit
      ? { ...this.survey.options[index!] }
      : new SurveyOption(null,'',null, '',1);

    const alert = await this.alertController.create({
      header: isEdit ? 'Editar opción' : 'Nueva opción',
      inputs: [
        {
          name: 'text',
          type: 'text',
          placeholder: 'Texto de la opción',
          value: opt.name
        },
        {
          name: 'youtubeId',
          type: 'url',
          placeholder: 'Id url youtube',
          value: opt.youtubeId
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: isEdit ? 'Guardar' : 'Añadir',
          handler: data => {
            const txt = data.text?.trim();
            if (!txt) {
              // no cerrar si no hay texto
              return false;
            }            
            const newOpt= new SurveyOption(null,txt,null,null,1);
            if (data.youtubeId?.trim()) {
              newOpt.youtubeId = data.youtubeId.trim();
            }
            if (isEdit) {
              this.survey.options[index!] = newOpt;
            } else {
              this.survey.options.push(newOpt);
            }
            return true;  
          }
        }
      ]
    });

    await alert.present();
  }

  async doReorder(event: any) {
    const fromIndex = event.detail.from;
    const toIndex = event.detail.to;

    // Reordenamos el array
    const movedItem = this.survey.options.splice(fromIndex, 1)[0];
    this.survey.options.splice(toIndex, 0, movedItem);

    // Completamos el reorder
    event.detail.complete();
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation(); 
    
    // ahora tenemos que actualizar en la bbdd los ordenes de todas las marchas
    // recorremos el array y vamos pasando el indice como order       
    //this.updateMarchOrdersAsync();
  }

  confirm(){
    // tenemos que comprobar que al menos hayan introducido una opcion
    if(this.survey.options.length === 0){
      this.toast.presentToast('Debes añadir al menos una opción');
      return;
    }

    // ahora tenemos que actualizas los orders de las opciones, a cada order le asignamos el indice
    this.survey.options.forEach((option, index) => {
      option.order = index + 1;
    });

    // segun el valor de updating, estaremos insertando o actualizando
    if(!this.updating){
      // insertamos
      this.createSurvey();
    }
    else{
      // modificamos
      this.updateSurvey();
    }    
  }

  async createSurvey(){
    await this.loadingService.presentLoading('Loading...');      
    
    this.survey.image = this.selectedImage;
    
    this.store.dispatch(new CreateSurvey({survey: this.survey}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(SurveyState.success);
          if(success){
            this.toast.presentToast("Encuesta creada correctamente");            
            this.modalController.dismiss(this.survey, 'confirm');         
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(SurveyState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(SurveyState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion           
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);              
              await this.loadingService.dismissLoading();           
            }           
          }          
        }
      }
    )  
  }

  async updateSurvey(){   
    
    await this.loadingService.presentLoading('Loading...');        

    this.survey.image = this.selectedImage;
    
    this.store.dispatch(new UpdateSurvey({id:this.survey.id, survey: this.survey}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(SurveyState.success);
          if(success){
            this.toast.presentToast("Encuesta modificada correctamente");            
            this.modalController.dismiss(this.survey, 'confirm');         
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(SurveyState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(SurveyState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion           
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);              
              await this.loadingService.dismissLoading();           
            }           
          }          
        }
      }
    )  
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

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

}
