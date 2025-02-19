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
import { CreateUser, DeleteUser, GetUser, GetUsersGroupByRole, ResetPasswordUser, ResetUser, UpdateUserDetail, UpdateUserRoles } from '../state/user/users.actions';
import { User } from '../models/user/user';
import { ModalUserComponent } from './components/modal-user/modal-user.component';
import { UserRequest } from '../models/user/user-request';
import { Role } from '../models/role/role';
import { ModalPartitureComponent } from '../menu-musician/components/modal-partiture/modal-partiture.component';
import { ModalResetPasswordComponent } from './components/modal-reset-password/modal-reset-password.component';
import { GetMusicianFromDni, UpdateMusician } from '../state/musician/musician.actions';
import { MusicianState } from '../state/musician/musician.state';
import { Musician } from '../models/musician/musician';
import { VideoCategory } from '../models/video-category/video-category';
import { ModalViewCategoryImageComponent } from '../menu-multimedia/component/modal-view-category-image/modal-view-category-image.component';

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
  public totalUsers: number = 0;
  
 
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

  logout(){
    this.userService.logout();
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

  async updateUserOrMusician(user:User, userSliding: IonItemSliding){   
    // cerramos el sliding 
    userSliding.close();

    let musicianId=null;

    // miramos si el usuario es musico (a partir del username)
    await this.loadingService.presentLoading('Loading...');    
      this.store.dispatch(new GetMusicianFromDni({dni:user.username}))
        .subscribe({
          next: async ()=> {
            const finish = this.store.selectSnapshot(MusicianState.finish);          
            const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);          
            
            if(finish){                        
              if(errorStatusCode==200){     
                musicianId = this.store.selectSnapshot(MusicianState.musician).id;
                
                if(musicianId){                                    
                  this.doUpdateUserOrMusician(user, musicianId,this.store.selectSnapshot(MusicianState.musician),false);
                }
                else{                  
                  this.doUpdateUserOrMusician(user, musicianId,null,false);
                }        
              }
              else if(errorStatusCode==204){                
                this.doUpdateUserOrMusician(user, musicianId,null,false);
              }else{
                this.toast.presentToast("Error al obtener la informacion del usuario");
                this.dismissInitialLoading();                 
              }                                                
            }      
          }
        }
      )  
    
  }

  async doUpdateUserOrMusician(user:User, musicianId:number, musician: Musician, showLoading:boolean=true){   
    
    // mostramos spinner
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');   
    }

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
      user.userDetail.phoneNumber
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
    if(role=='confirm'){       
      if(musicianId){        
        this.updateUserMusician(data,musicianId, musician);
      }
      else{        
        this.updateUser(data);
      }
    }
  }

  async updateUser(data:UserRequest, showLoading:boolean=true){     
    
    // tratamos el resultado de la modal
    this.updateDetail=false;
    this.updateRoles=false;
    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');         
    }

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

  async updateUserMusician(data:UserRequest, musicianId:number,musician: Musician,){     
    
    // tratamos el resultado de la modal
    this.updateDetail=false;
    this.updateRoles=false;
    
    await this.loadingService.presentLoading('Loading...');  

    let changeDni = false;

    if(data.dni!==musician.dni){
      changeDni = true;
    }
    
    // actualizamos los datos del musician
    musician.dni = data.dni;
    musician.name = data.name;
    musician.surname = data.surname;
    musician.direction = data.direction;
    musician.municipality = data.municipality;
    musician.province = data.province;
    musician.email = data.email;
    musician.image = data.image;
    musician.voiceId = musician.voice.id;
    musician.phoneNumber = data.phoneNumber;

    if(changeDni){
      await this.loadingService.dismissLoading();  
      const alert = await this.alertController.create({
          header: '¡Aviso!',
          message: 'Ha cambiado el dni del usuario, por tanto se va a regenerar el password, que será la misma del DNI pero con la letra en minuscula. </br> ¿Desea continuar con la actualización?',
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
                this.doConfirmUpdateUserMusician(data,musicianId,musician,true);
              }
            }
          ]
      });
      alert.present();
    }
    else{
      this.doConfirmUpdateUserMusician(data,musicianId,musician,false);
    }        
  }

  async doConfirmUpdateUserMusician(data:UserRequest, musicianId:number,musician: Musician, showLoading:boolean=true){     
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');         
    }

    this.store.dispatch(new UpdateMusician({id: musicianId, musician:musician})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(MusicianState.success);
        if(success){
          this.updateDetail=true;

          data.username = musician.dni;
          this.updateUser(data,false);                    
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);        
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

    if(role=='confirm'){      
      await this.loadingService.presentLoading('Loading...');          
      
      data.username = user.username;
      this.store.dispatch(new ResetPasswordUser({resetPassword:data})).subscribe({      
          next: async ()=> {
            const success = this.store.selectSnapshot(UsersState.success);            
            if(success){
              this.toast.presentToast("Password reseteado correctamente");                 
            }
            else{
              const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
              const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){                    
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
      user.userDetail.description,
      user.userDetail.phoneNumber
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
          this.calculateTotalUsers();       
        }
      })
  }

  calculateTotalUsers(){    
    this.totalUsers = 0;
    if(this.usersGroupByRole){
      this.usersGroupByRole.forEach(usersGroupByRole => {        
        if(usersGroupByRole.users){
          this.totalUsers += usersGroupByRole.users.length;
        }        
      });
    }    
  }


  trackByRoleFn(index, role) {      
    return role.role; // Utiliza un identificador único de tu elemento
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

  dateFormat(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    
    const dia = ('0' + fecha.getDate()).slice(-2);
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2); // Los meses en JavaScript son 0-indexados
    const año = fecha.getFullYear();
    
    const horas = ('0' + fecha.getHours()).slice(-2);
    const minutos = ('0' + fecha.getMinutes()).slice(-2);
    
    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  }

  getUserLastAccess(userDetail: any): string {    
    const lastAccess = userDetail.lastAccessDate ? `(${this.dateFormat(userDetail.lastAccessDate)})` : '';
    if(lastAccess==''){
      return '';
    }    
    return `${lastAccess}`;
  }

  async viewUserImage(user: User){    
    if(!user.userDetail.image){
      this.toast.presentToast("No existe imagen para previsualizar");
    }
    else{
      await this.loadingService.presentLoading('Loading...');    
      this.store.dispatch(new GetUser({username:user.username}))
        .subscribe({
          next: async ()=> {
            const finish = this.store.selectSnapshot(UsersState.finish);          
            const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);          
            
            if(finish){                        
              if(errorStatusCode==200){                                        
                let videoCategory = new VideoCategory();
                videoCategory.name = 'Foto usuario';
                videoCategory.image = this.store.selectSnapshot(UsersState.user).image;
                
                const modal = await this.modalController.create({
                  component: ModalViewCategoryImageComponent,
                  componentProps: { videoCategory, loadImage: false },
                });

                await modal.present();       
              }
              else{
                this.dismissInitialLoading();                 
              }                                                
            }      
          }
        }
      )
    }      
  }

}
