import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { DEFAULT_MUSICIAN_IMAGE } from '../constants/constants';
import { SuggestionBoxState } from '../state/suggestion-box/suggestion-box.state';
import { Observable, Subscription } from 'rxjs';
import { SuggestionBoxGroupByUserResponse } from '../models/suggestion-box/suggestion-box-group-by-user-response';
import { CreateSuggestionBox, GetSuggestionBoxGroupByUser, MarkReadUnread, ResetSuggestionBox } from '../state/suggestion-box/suggestion-box.actions';
import { SuggestionBoxResponse } from '../models/suggestion-box/suggestion-box-response';
import { SuggestionBoxRequest } from '../models/suggestion-box/suggestion-box-request';

@Component({
  selector: 'app-menu-suggestion-box',
  templateUrl: './menu-suggestion-box.page.html',
  styleUrls: ['./menu-suggestion-box.page.scss'],
})
export class MenuSuggestionBoxPage implements OnDestroy {

  public profile: string;  
  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;  

  @Select(SuggestionBoxState.suggestionBoxGroupByUser)
  suggestionBoxGroupByUser$: Observable<SuggestionBoxGroupByUserResponse[]>;
  suggestionBoxGroupByUserSubscription: Subscription;
  public suggestionBoxGroupByUser: SuggestionBoxGroupByUserResponse[];
  public initScreen = false;
  public initSearchFinish = false;
  public existsRequest = false;

  private filterAllNotifications: boolean = false;    

  public textSuggestionBox: string = '';
  public nameSuggestionBox: string = '';
  public invalidTextSuggestionBox: boolean = false;
  public disabledForm: boolean = true;

  constructor(        
        private store:Store,
        private toast:ToastService,            
        private userService: UsersService,
        private loadingService: LoadingService,             
        private storage: StorageService
    ) {
      
  }

  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){   
    this.profile = await this.storage.getItem('profile');    
    this.suggestionBoxGroupByUser = [];
    if(this.profile=='SUPER_ADMIN' || this.profile=='ADMIN'){
      this.filterSuggestionBox();
      this.getSuggestionBoxGroupByUser();   
    }
    else{
      this.initSearchFinish = true;   
      await this.loadingService.dismissLoading();         
    }
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
    if (this.suggestionBoxGroupByUserSubscription) {      
      this.suggestionBoxGroupByUserSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetSuggestionBox({})).subscribe({ next: async () => { } })      
  }

  async filterSuggestionBox(showLoading:boolean=true){    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetSuggestionBoxGroupByUser({all: this.filterAllNotifications}));    
  }

  getSuggestionBoxGroupByUser(){
    this.suggestionBoxGroupByUserSubscription = this.suggestionBoxGroupByUser$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(SuggestionBoxState.finish)        
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(SuggestionBoxState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(SuggestionBoxState.errorMessage);   
          if(errorStatusCode==200 || errorStatusCode==204){
            this.suggestionBoxGroupByUser = this.store.selectSnapshot(SuggestionBoxState.suggestionBoxGroupByUser);             
            if(this.suggestionBoxGroupByUser.length>0){
              this.existsRequest = true;
            }
            else{
              this.existsRequest = false;
            }
            this.initSearchFinish = true;    
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

  async refreshSuggestionBoxGroupByUser($event){              
    this.filterSuggestionBox();    
    $event.target.complete();
  }
  
  trackBySuggestionBoxFn(index, request) {    
    return request.id || index; 
  }
  
  async onReadedChanged(event: any) {    
    this.filterAllNotifications = event.detail.value==='all';    
    this.filterSuggestionBox();    
  }

  async markAsReadUnread(request: SuggestionBoxResponse) {
    this.markAsRead(request);
  }
  
  async markAsRead(request: SuggestionBoxResponse) {
    request.readed = !request.readed; 
    let suggestionBoxRequest: SuggestionBoxRequest = new SuggestionBoxRequest(
      request.id,    
      request.suggestion,
      request.readed
    );   
    
    // actualizamos en el server    
    await this.loadingService.presentLoading('Loading...');        
    this.store.dispatch(new MarkReadUnread({suggestionBoxRequest: suggestionBoxRequest})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(SuggestionBoxState.success);
        if(success){
          this.toast.presentToast("Mensaje marcado correctamente");
          //this.filterSuggestionBox();         
          await this.loadingService.dismissLoading();      
        }
        else{
          request.readed = !request.readed; 
          const errorStatusCode = this.store.selectSnapshot(SuggestionBoxState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(SuggestionBoxState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){                   
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            if(errorMessage!=='' && errorMessage!==null){
              this.toast.presentToast(errorMessage);
            }
          }    
          await this.loadingService.dismissLoading();      
        }          
      }
    })        
  }

  validTextSuggestionBox() {
    const validTextSuggestionBox = this.textSuggestionBox.trim().length >= 1 && this.textSuggestionBox.length <= 500;    
    this.invalidTextSuggestionBox = !validTextSuggestionBox;    
    this.disabledForm = !validTextSuggestionBox;
  }
    
  async createSuggestionBox(){   
    await this.loadingService.presentLoading('Loading...');       

     let suggestionBoxRequest: SuggestionBoxRequest = new SuggestionBoxRequest(
      null,    
      this.textSuggestionBox,
      false
    );   
          
          
    this.store.dispatch(new CreateSuggestionBox({suggestionBoxRequest: suggestionBoxRequest}))        
      .subscribe({
        next: async ()=> {
          this.textSuggestionBox='';
          const success = this.store.selectSnapshot(SuggestionBoxState.success);
          if(success){
            this.toast.presentToast("Mensaje enviado correctamente");                                        
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(SuggestionBoxState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(SuggestionBoxState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){            
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              if(errorMessage!=='' && errorMessage!==null){
                this.toast.presentToast(errorMessage);
              }
            }                  
          }      
          await this.loadingService.dismissLoading();          
        }
      }
    )
  }

}
