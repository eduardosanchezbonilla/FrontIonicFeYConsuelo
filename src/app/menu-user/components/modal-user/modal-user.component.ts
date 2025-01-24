import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_USER_IMAGE } from 'src/app/constants/constants';
import { Role } from 'src/app/models/role/role';
import { User } from 'src/app/models/user/user';
import { UserRequest } from 'src/app/models/user/user-request';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetAllRoles, ResetUser } from 'src/app/state/user/users.actions';
import { UsersState } from 'src/app/state/user/users.state';

@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.component.html',
  styleUrls: ['./modal-user.component.scss'],
})
export class ModalUserComponent  implements OnInit, OnDestroy {

  @Select(UsersState.roles)
  roles$: Observable<Role[]>;
  rolesSubscription: Subscription;
  public roles: Role[];

  @Input() user: UserRequest;  
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;
  public initScreen = false;
  public initSearchFinish = false;
  
  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService,
    private userService: UsersService,
    private toast:ToastService,    
  ) { }

  async ngOnInit() {    
    if(!this.user){
      this.user = new UserRequest(null,null,null,null,null,null,);      
      this.showImage = null;      
    }
    else{
      if(this.user.image){
        this.showImage = `data:image/jpeg;base64,${this.user.image}`;
        this.selectedImage = this.user.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_USER_IMAGE}`;
        this.selectedImage = DEFAULT_USER_IMAGE;
      }            
    }
    this.store.dispatch(new GetAllRoles({}));
    this.getAllRoles();      
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
    if (this.rolesSubscription) {      
      this.rolesSubscription.unsubscribe();  
    }       
    this.store.dispatch(new ResetUser({})).subscribe({ next: async () => { } })     
  }

  compareWith(o1: Role, o2: Role){
    return o1 && o2 ? o1.role == o2.role : o1===o2;
  }

  getAllRoles(){
    this.rolesSubscription = this.roles$.subscribe({
      next: async ()=> {

        const finish = this.store.selectSnapshot(UsersState.finish);          
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);
          if(errorStatusCode==200){
            this.roles = this.store.selectSnapshot(UsersState.roles);            
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

  confirm(){
    this.user.image = this.selectedImage;
    this.user.roles = [];
    this.user.roles.push(this.user.role.role);    
    this.modalController.dismiss(this.user, 'confirm');
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
