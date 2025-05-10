import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_SURVEY_IMAGE } from 'src/app/constants/constants';
import { ModalViewVideoComponent } from 'src/app/menu-multimedia/component/modal-view-video/modal-view-video.component';
import { Survey } from 'src/app/models/survey/survey-dto';
import { SurveyOption } from 'src/app/models/survey/survey-option-dto';
import { SurveyOptionVote } from 'src/app/models/survey/survey-option-vote-dto';
import { SurveyVote } from 'src/app/models/survey/survey-vote-dto';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { Video } from 'src/app/models/video/video';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetSurvey, ResetSurvey, VoteSurvey } from 'src/app/state/survey/survey.actions';
import { SurveyState } from 'src/app/state/survey/survey.state';

@Component({
  selector: 'app-modal-vote-survey',
  templateUrl: './modal-vote-survey.component.html',
  styleUrls: ['./modal-vote-survey.component.scss'],
})
export class ModalVoteSurveyComponent implements OnInit, OnDestroy {

  @Input() idSurvey: number;  

  @Select(SurveyState.survey)
  survey$: Observable<Survey>;
  surveySubscription: Subscription;
  public survey: Survey;
  public initSearchFinish = false;
  public defaultSurveyImage: string = DEFAULT_SURVEY_IMAGE;
  
  public initScreen = false;
  public selectedOption: number;

  ranks: { [optId: number]: number | null } = {};
  rankNumbers: number[] = [];

  
  constructor(
    private sanitizer: DomSanitizer,
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,    
    private userService: UsersService,
    private toast:ToastService,    
    private alertController: AlertController
  ) { }

  async ngOnInit() {    
    this.survey = null;
    this.store.dispatch(new GetSurvey({id: this.idSurvey}));
    this.getMusicianInventories();   
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
    console.log("ngOnDestroy vote survey");  
    this.survey=null;
    if (this.surveySubscription) {      
          this.surveySubscription.unsubscribe();  
        }     
        this.store.dispatch(new ResetSurvey({})).subscribe({ next: async () => { } })        
  }

  getMusicianInventories(){
    this.surveySubscription = this.survey$.subscribe({
      next: async ()=> {                        
        const finish = this.store.selectSnapshot(SurveyState.finish)                
        if(finish){   
          const errorStatusCode = this.store.selectSnapshot(SurveyState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(SurveyState.errorMessage);  
          if(errorStatusCode==200){
            this.survey = this.store.selectSnapshot(SurveyState.survey);    
            if(this.survey){
              if(!this.survey.image || this.survey.image==""){
                this.survey.image = DEFAULT_SURVEY_IMAGE;      
              } 

              // inizializamos los options
              this.inilitializeOptions();
                  
              this.initSearchFinish = true;    
              this.dismissInitialLoading();      
            }                
                    
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

  inilitializeOptions(){    
    if(this.survey.type === 'OPTIONS'){
      // asignamos a selectedOption del objeto survey.userOptionsVote, el que tenga puntuacion 1
      if(this.survey.userOptionsVote){
        this.survey.userOptionsVote.forEach((opt:SurveyOptionVote)=>{
          if(opt.score===1){
            this.selectedOption = opt.id;
          }
        })
      }      
    }
    else{
      const N = this.survey.options.length;
      this.rankNumbers = Array.from({ length: N }, (_, i) => i + 1);      
      this.survey.options.forEach(opt => {
        this.ranks[opt.id] = null;
        // si hay score asociado a la opción, lo asignamos
        if(this.survey.userOptionsVote){
          this.survey.userOptionsVote.forEach((opt:SurveyOptionVote)=>{
            if(opt.id===opt.id){
              this.ranks[opt.id] = opt.score;
            }
          })
        }
      });
    }
    
  }
  
  // Comprueba si el número ya está asignado a otra opción
  isRankDisabled(num: number, currentOptId: number): boolean {
    return Object.entries(this.ranks)
      .some(([optId, val]) => +optId !== currentOptId && val === num);
  }

  // Se llama al cambiar cualquiera, para refrescar la UI
  onRankChange() {
    // (puedes usar esto para lógica extra)
  }

  // Sólo habilita el botón si todas las opciones tienen valor
  allRanked(): boolean {
    return Object.values(this.ranks).every(v => v !== null);
  }

  async viewYouTube(option:SurveyOption, youtubeId: string) {    
      await this.loadingService.presentLoading('Loading...');    
      let video = new Video();    
      video.videoCategory = new VideoCategory();
      video.videoCategory.name = this.survey.name;      
      video.description = '';
      video.name = option.name;    
      const videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${youtubeId}`);
      const modal = await this.modalController.create({
        component: ModalViewVideoComponent,
        componentProps: { videoLink, video }
      });
      await modal.present();
    }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  confirm(){    
    // 1) Construir el array de puntuaciones
    const options = this.survey.options.map(opt => {
      if (this.survey.type === 'OPTIONS') {
        return new SurveyOptionVote(opt.id, opt.id === this.selectedOption ? 1 : 0);
      } else {
        return new SurveyOptionVote(opt.id, this.ranks[opt.id] ?? 0);
      }
    });
    
    const surveyVote = new SurveyVote(this.survey.id, options);        
    this.voteSurvey(surveyVote);
  }

  async voteSurvey(surveyVote: SurveyVote){   
      
    await this.loadingService.presentLoading('Loading...');        
    
    this.store.dispatch(new VoteSurvey({id:this.survey.id, surveyVote: surveyVote}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(SurveyState.success);
          if(success){
            this.toast.presentToast("Votación registrada correctamente");            
            this.modalController.dismiss(null, 'confirm');         
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


}
