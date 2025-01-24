import { Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ModalController } from '@ionic/angular';
import { DEFAULT_MUSICIAN_IMAGE } from '../../../constants/constants';
import { UserPartitureGroupState } from 'src/app/state/user-partiture-group/user-partiture-group.state';
import { UserPartitureGroup } from 'src/app/models/user-partiture-group/user-partiture-group';
import { Observable, Subscription } from 'rxjs';
import { CreateUserPartitureGroup, DeleteUserPartitureGroup, GetUserPartitureGroups, ResetUserPartitureGroup } from 'src/app/state/user-partiture-group/user-partiture-group.actions';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { DEFAULT_PARTITURE_GROUP_IMAGE} from '../../../constants/constants';
import { UserRequest } from 'src/app/models/user/user-request';

@Component({
  selector: 'app-modal-partiture',
  templateUrl: './modal-partiture.component.html',
  styleUrls: ['./modal-partiture.component.scss'],
})
export class ModalPartitureComponent implements OnInit {

  @Select(UserPartitureGroupState.userPartitureGroups)
  userPartitureGroups$: Observable<UserPartitureGroup[]>;
  userPartitureGroupsSubscription: Subscription;
  public userPartitureGroups: UserPartitureGroup[];
  
  @Input() user: UserRequest;
  public showImage: string;
  public selectedImage: string;
  public initScreen = false;
  public initSearchFinish = false;

  public defaultPartitureGroupImage: string = DEFAULT_PARTITURE_GROUP_IMAGE;  

  constructor(
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {    
    this.userPartitureGroups = [];
    if(this.user.image){
      this.showImage = `data:image/jpeg;base64,${this.user.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;      
    }       
    this.store.dispatch(new GetUserPartitureGroups({username: this.user.username}));
    this.getUserPartitureGroups();   
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
    console.log("ngOnDestroy user partiture");
    if (this.userPartitureGroupsSubscription) {      
      this.userPartitureGroupsSubscription.unsubscribe();  
    }     
    this.store.dispatch(new ResetUserPartitureGroup({})).subscribe({ next: async () => { } })   
  }

  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

  getUserPartitureGroups(){
    this.userPartitureGroupsSubscription = this.userPartitureGroups$.subscribe({
      next: async ()=> {                
        const finish = this.store.selectSnapshot(UserPartitureGroupState.finish)        
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(UserPartitureGroupState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(UserPartitureGroupState.errorMessage);   
          if(errorStatusCode==200){
            this.userPartitureGroups = this.store.selectSnapshot(UserPartitureGroupState.userPartitureGroups);                  
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

  associateDisassociatePartitureGroupUser(username:string, userPartitureGroup:UserPartitureGroup){
    userPartitureGroup.username = username;
    if(userPartitureGroup.assigned){      
      // desasociamos
      userPartitureGroup.assigned = false;
      this.store.dispatch(new DeleteUserPartitureGroup({userPartitureGroup})).subscribe({
        next: () => {
          const success = this.store.selectSnapshot(UserPartitureGroupState.success);
            if(success){             
              this.toast.presentToast("Grupo de partituras eliminado del usuario");                          
            }
            else{              
              const errorStatusCode = this.store.selectSnapshot(UserPartitureGroupState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UserPartitureGroupState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){  
                this.cancel();              
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }    
              //await this.loadingService.dismissLoading();      
            }  
        }
      })
    }
    else{
      // asociamos
      userPartitureGroup.assigned = true;
      this.store.dispatch(new CreateUserPartitureGroup({userPartitureGroup})).subscribe({
        next: () => {
          const success = this.store.selectSnapshot(UserPartitureGroupState.success);
            if(success){              
              this.toast.presentToast("Grupo de partituras asociado del usuario");                          
            }
            else{              
              const errorStatusCode = this.store.selectSnapshot(UserPartitureGroupState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UserPartitureGroupState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.cancel();    
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }                
            }  
        }
      })
    }
    
  }

}

