import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { SurveyState } from '../state/survey/survey.state';
import { Observable, Subscription } from 'rxjs';
import { Survey } from '../models/survey/survey-dto';
import { DeleteSurvey, GetSurveys, ResetSurvey } from '../state/survey/survey.actions';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalSurveyComponent } from './components/modal-survey/modal-survey.component';
import { DEFAULT_SURVEY_IMAGE } from '../constants/constants';
import { ModalVoteSurveyComponent } from './components/modal-vote-survey/modal-vote-survey.component';

@Component({
  selector: 'app-menu-survey',
  templateUrl: './menu-survey.page.html',
  styleUrls: ['./menu-survey.page.scss'],
})
export class MenuSurveyPage implements OnDestroy {

  public profile: string;  
  @Select(SurveyState.surveys)
  surveys$: Observable<Survey[]>;
  surveysSubscription: Subscription;
  public surveys: Survey[];
  public initScreen = false;
  public initSearchFinish = false;
  public defaultSurveyImage: string = DEFAULT_SURVEY_IMAGE;
  
  constructor(        
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,            
    private userService: UsersService,
    private loadingService: LoadingService,             
    private storage: StorageService,
    private alertController: AlertController,
  ) {
      
  }

  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){   
    this.profile = await this.storage.getItem('profile');    
    this.filterSurveys();
    this.getSurveys();     
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
    console.log("ngOnDestroy");                      
    if (this.surveysSubscription) {      
      this.surveysSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetSurvey({})).subscribe({ next: async () => { } })      
  }

  async filterSurveys(showLoading:boolean=true){    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetSurveys({}));    
  }

  getSurveys(){
    this.surveysSubscription = this.surveys$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(SurveyState.finish)        
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(SurveyState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(SurveyState.errorMessage);   
          if(errorStatusCode==200 || errorStatusCode==204){
            this.surveys = this.store.selectSnapshot(SurveyState.surveys);                          
            this.initSearchFinish = true;    
            // debemos recorrer la lista de encuestas y ver si hay alguna encuesta que no tiene imagen le asignamos la imagen por defecto
            this.surveys.forEach((survey:Survey)=>{
              if(survey.image==null || survey.image==''){
                survey.image = this.defaultSurveyImage;                
              }
            })
            // si el profile no es ADMIN, entonces debelos eliminar las que no sean publicas
            if(/*this.profile!=='ADMIN' &&*/ this.profile!=='SUPER_ADMIN'){
              this.surveys = this.surveys.filter((survey:Survey)=>{                
                return survey.isPublic;
              })
            }
            this.dismissInitialLoading();   
          }
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();                         
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              if(errorMessage!=='' && errorMessage!==null){
                this.toast.presentToast(errorMessage);
              }
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }
      }
    })
  }    

  async createSurvey(){    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalSurveyComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){  
      this.filterSurveys(false);          
    }
  }

  async updateSurvey(survey:Survey){    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalSurveyComponent,
      componentProps: {
        survey: survey,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){  
      this.filterSurveys(false);          
    }
  }

  async confirmDeleteSurvey(survey:Survey) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la encuesta?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteSurvey(survey);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteSurvey(survey:Survey) {
    
    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteSurvey({id: survey.id})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(SurveyState.success);
        if(success){
          this.toast.presentToast("Encuesta eliminada correctamente");
          this.filterSurveys(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(SurveyState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(SurveyState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){            
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            this.toast.presentToast(errorMessage);
          }    
          await this.loadingService.dismissLoading();      
        }          
      }
    })
  }

  async voteSurvey(survey:Survey){    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalVoteSurveyComponent,
      componentProps: {
        idSurvey: survey.id
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){  
      this.filterSurveys(false);          
    }
  }

}
