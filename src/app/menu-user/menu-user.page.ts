import { Component, OnDestroy } from '@angular/core';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { UsersState } from '../state/user/users.state';
import { AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { ToastService } from '../services/toast/toast.service';
import { UsersService } from '../services/user/users.service';
import { LoadingService } from '../services/loading/loading.service';
import { StorageService } from '../services/storage/storage.service';
import { UserGroupByRole } from '../models/user/user-group-by-role';
import { FilterUsers } from '../models/user/filter-users';
import { DEFAULT_ROLE_IMAGE, DEFAULT_USER_IMAGE } from '../constants/constants';
import { CreateUser, DeleteUser, GetUsersGroupByRole, ResetPasswordUser, ResetUser, UpdateUserDetail, UpdateUserRoles } from '../state/user/users.actions';
import { User } from '../models/user/user';
import { ModalUserComponent } from './components/modal-user/modal-user.component';
import { UserRequest } from '../models/user/user-request';
import { Role } from '../models/role/role';
import { ModalPartitureComponent } from '../menu-musician/components/modal-partiture/modal-partiture.component';
import { ModalResetPasswordComponent } from './components/modal-reset-password/modal-reset-password.component';

@Component({
  selector: 'app-menu-user',
  templateUrl: './menu-user.page.html',
  styleUrls: ['./menu-user.page.scss'],
})
export class MenuUserPage implements OnDestroy {

  usersGroupByRoleSubscription: Subscription;
  @Select(UsersState.usersGroupByRole)
  usersGroupByRole$: Observable<UserGroupByRole[]>;

  public usersGroupByRole: UserGroupByRole[];
  public expandRoleList: string[];
  public expandRoleMap: Map<string, boolean> = new Map();
  public filter: FilterUsers;
  public searchTextChanged = new Subject<string>();
  public isSearching: boolean = false;
  public defaultUserImage: string = DEFAULT_USER_IMAGE;
  public defaultRoleImage: string = DEFAULT_ROLE_IMAGE;    
  public profile: string;  
  public initScreen = false;
  public initSearchFinish = false;
  public updateDetail=false;
  public updateRoles=false;
  
 
  constructor(
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,    
    private alertController: AlertController,
    private userService: UsersService,
    private loadingService: LoadingService,
    private storage: StorageService
  ) {
    this.expandRoleList = null;
    this.expandRoleMap = null;
    this.filter = new FilterUsers();
    this.filter.filter = '';
    this.isSearching = false;
    this.searchTextChanged
      .pipe(debounceTime(300)) // 200 milisegundos de espera
      .subscribe(value => {
        this.searchUsers(value);
      });    
  }

  async ionViewWillEnter(){      
    this.profile = await this.storage.getItem('profile');         
    this.getUsersGroupByRole();      
    this.filterUsers();
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
    console.log("ngOnDestroy user");
    if (this.usersGroupByRoleSubscription) {      
      this.usersGroupByRoleSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetUser({})).subscribe({ next: async () => { } })    
  }

  
  /*******************************************************/
  /********************** USERS **************************/
  /*******************************************************/
  async createUser(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalUserComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      this.store.dispatch(new CreateUser({user: data}))        
        .subscribe({
          next: async ()=> {
            const success = this.store.selectSnapshot(UsersState.success);
            if(success){
              this.toast.presentToast("Usuario creado correctamente");            
              // cuando insertamos siempre expandimos
              this.expandRoleMap.set(data.roles[0]+"", true);
              this.updateExpandRoleList();            
              this.filterUsers(false);          
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
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
        }
      )      
    }
  }

  async updateUser(user:User, userSliding: IonItemSliding){   
    // cerramos el sliding 
    userSliding.close();
    
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // creamos el userRequest
    const userRole = new Role(user.roles[0], user.roles[0]);
    const userRequest = new UserRequest(
      user.username,
      '**********',
      user.roles,
      userRole,
      user.userDetail.dni,
      user.userDetail.name,
      user.userDetail.surname,
      user.userDetail.direction,
      user.userDetail.municipality,
      user.userDetail.province,
      user.userDetail.email,
      user.userDetail.image,
      user.userDetail.description,
    );

    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalUserComponent,
      componentProps: {
        user:userRequest,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    // tratamos el resultado de la modal
    this.updateDetail=false;
    this.updateRoles=false;
    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');         
      this.store.dispatch(new UpdateUserDetail({user:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(UsersState.success);
          if(success){
            this.updateDetail=true;
            this.endUpdateUser();            
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
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
      this.store.dispatch(new UpdateUserRoles({user:data})).subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(UsersState.success);
          if(success){
            this.updateRoles=true;
            this.endUpdateUser();            
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
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
  }

  endUpdateUser(){
    if(this.updateDetail && this.updateRoles){
      this.toast.presentToast("Usuario modificado correctamente");
      this.filterUsers(false);          
    }
  }

  async resetPassword(user:User, userSliding: IonItemSliding) {       
    // cerramos el sliding 
    userSliding.close();
      
    // mostramos spinner    
    await this.loadingService.presentLoading('Loading...');

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalResetPasswordComponent,
      componentProps: {}
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    console.log(data);

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      data.username = user.username;
      this.store.dispatch(new ResetPasswordUser({resetPassword:data})).subscribe({      
          next: async ()=> {
            const success = this.store.selectSnapshot(UsersState.success);
            console.log(success);
            if(success){
              this.toast.presentToast("Password reseteado correctamente");                 
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){    
                console.log("Ha caducado la sesion, debe logarse de nuevo");
                this.store.dispatch(new ResetUser({})).subscribe({ next: async () => { } })            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }                  
            }      
            await this.loadingService.dismissLoading();          
          }
        }
      )      
    }
  }

  async asignPartituresUser(user:User, userSliding: IonItemSliding){   
    // cerramos el sliding 
    userSliding.close();

    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    let name = '';

    if(user.userDetail.name!=null && user.userDetail.surname!=null){
      name = '(' + user.userDetail.name + ' ' + user.userDetail.surname + ')';
    }
    else if(user.userDetail.name!=null){
      name = '(' + user.userDetail.name + ')';
    }
    else if(user.userDetail.surname!=null){
      name = '(' + user.userDetail.surname + ')';
    }

    let userRequest = new UserRequest(
      user.username, 
      null,
      null,
      null,
      user.userDetail.dni,  
      user.username,
      name,
      user.userDetail.direction,
      user.userDetail.municipality,
      user.userDetail.province,
      user.userDetail.email, 
      user.userDetail.image==null?DEFAULT_USER_IMAGE:user.userDetail.image,    
      user.userDetail.description
    );
    
    // abrimos modal    
    const modal = await this.modalController.create({
      component: ModalPartitureComponent,
      componentProps: {
        user:userRequest
      }
    });
    modal.present();
  }

  async getUsersGroupByRole(){            
    this.usersGroupByRoleSubscription = this.usersGroupByRole$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(UsersState.finish);          
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);               
          if(finish){
            if(errorStatusCode==200){      
              this.usersGroupByRole = this.store.selectSnapshot(UsersState.usersGroupByRole);
              if(!this.usersGroupByRole){
                this.usersGroupByRole = [];
              }
              if(this.expandRoleList===null){                              
                this.expandRoleMap = new Map(); 
                this.usersGroupByRole.map(user => user.role+"").forEach(element => {
                  this.expandRoleMap.set(element, true);
                });
                this.updateExpandRoleList();              
              }
              else{                        
                this.updateExpandRoleList();
              }
            }
            else{
              if(this.expandRoleList===null){                             
                this.expandRoleMap = new Map(); 
              }
              this.usersGroupByRole = [];
              this.usersGroupByRole.map(user => user.role+"").forEach(element => {
                this.expandRoleMap.set(element, false);
              });  
              this.updateExpandRoleList();
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                        
            this.isSearching = false;  
            this.initSearchFinish = true;    
            this.dismissInitialLoading();                 
          }          
        }
      })
  }

  trackByRoleFn(index, role) {    
    return role; // Utiliza un identificador único de tu elemento
  }

  trackByUserFn(index, user) {    
    return user.username; // Utiliza un identificador único de tu elemento
  }

  async filterUsers(showLoading:boolean=true){
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }    
    this.store.dispatch(new GetUsersGroupByRole({filter: this.filter.filter}));    
  }

  async confirmDeleteUser(user:User, userSliding: IonItemSliding) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el usuario?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              userSliding.close();
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteUser(user,userSliding);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteUser(user:User, userSliding: IonItemSliding) {
    // cerramos el sliding 
    userSliding.close();

    // eliminamos el musico
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteUser({username: user.username})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(UsersState.success);
        if(success){
          this.toast.presentToast("Usuario eliminado correctamente");
          this.filterUsers(false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
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

  expandAll(){    
    this.expandRoleMap.forEach((value, key) => {
      this.expandRoleMap.set(key, true);
    }); 
    this.updateExpandRoleList();    
  }

  collapseAll(){    
    this.expandRoleMap.forEach((value, key) => {
      this.expandRoleMap.set(key, false);
    });
    this.updateExpandRoleList();    
  }

  accordionGroupChange = (ev: any) => {
    this.expandRoleMap.forEach((value, key) => {
      this.expandRoleMap.set(key, false);
    });
    ev.detail.value.forEach(element => {
      this.expandRoleMap.set(element, true);
    }); 
    this.updateExpandRoleList();    
  };
  
  refreshUsers($event){      
    this.filterUsers();    
    $event.target.complete();
  }

  searchUsers(searchText: string) {
    if(this.isSearching == false){
      this.isSearching = true;
      this.filterUsers();    
    }
  }

  onSearchTextChanged(event: any) {
    this.searchTextChanged.next(event.detail.value);
  }

  updateExpandRoleList(){
    this.expandRoleList = Array.from(this.expandRoleMap)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
  }

  /*showMap(origin?: string){
    console.log("///////////////////////////////////////////");
    console.log(origin);
    this.expandVoiceMap.forEach((value, key) => {
      console.log(`Clave: ${key}, Valor: ${value}`);
    });
    console.log("///////////////////////////////////////////");
  }*/

  
}
