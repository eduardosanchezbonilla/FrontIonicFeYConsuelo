import { Component } from '@angular/core';
import { Category } from './models/category';
import { User } from '../users/models/user';
import { Select, Store } from '@ngxs/store';
import { StorageService } from '../services/storage/storage.service';
import { CreateCategory, DeleteCategory, GetCategories, UpdateCategory } from './state/categories.actions';
import { CategoriesState } from './state/categories.state';
import { ToastService } from '../services/toast/toast.service';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { UpdateCategoryDto } from './models/update-category-dto';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  @Select(CategoriesState.categories)
  categories$: Observable<Category[]>;

  public category: Category;
  public categories: Category[];
  public user: User;
  
  constructor(private store: Store,
    private storage: StorageService,
    private toast: ToastService,
    private alertController: AlertController) {}

  async ionViewWillEnter(){
    this.categories=[];
    this.user = JSON.parse(await this.storage.getItem('user'));
    this.category=new Category();
    this.category.user=this.user;
    this.store.dispatch(new GetCategories({user: this.user._id}));
    this.getCategories();
  }

  createCategory(){
    this.store.dispatch(new CreateCategory({category: this.category})).subscribe({
      next: ()=> {
        const success = this.store.selectSnapshot(CategoriesState.success);
        if(success){
          this.toast.presentToast("Categoria creada");
          this.category=new Category();
          this.category.user=this.user;
          this.store.dispatch(new GetCategories({user: this.user._id}));
        }
        else{
          this.toast.presentToast("Error al crear la categoria");
        }
      }
    })
  }

  getCategories(){
    this.categories$.subscribe({
      next: ()=> {
        this.categories = this.store.selectSnapshot(CategoriesState.categories);
      }
    })
  }

  async presentAlertUpdateCategory(category:Category){
    let alert = await this.alertController.create({
      header: 'Categoria ' + category.name,
      inputs: [
        {
          name: 'newName',
          placeholder: 'Nuevo nombre de la categoria'
        }
      ],
      buttons:[
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: data => {
            if(data.newName){
              const updateCategoruDto = new UpdateCategoryDto();
              updateCategoruDto.newName = data.newName;
              updateCategoruDto.originalName = category.name;
              updateCategoruDto.user = this.user;
              this.updateCategory(updateCategoruDto);
            }
          }
        }
      ]
    })
    alert.present();
  }

  updateCategory(updateCategoryDto:UpdateCategoryDto){
    this.store.dispatch(new UpdateCategory({updateCategoruDto: updateCategoryDto})).subscribe({
      next: ()=> {
        const success = this.store.selectSnapshot(CategoriesState.success);
        if(success){
          this.toast.presentToast("Categoria modificada correctamente");      
          this.store.dispatch(new GetCategories({user: this.user._id}));    
        }
        else{
          this.toast.presentToast("Error al actualizar la categoria");
        }
      }
    })
  }

  async confirmDeleteCategory(category:Category) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar la categoria?',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteCategory(category)
            }
          }
        ]
    });
    alert.present();
  }

  deleteCategory(category:Category) {
    this.store.dispatch(new DeleteCategory({id: category._id})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(CategoriesState.success);
        if(success){
          this.toast.presentToast("Categoria eliminada");          
          this.store.dispatch(new GetCategories({user: this.user._id}));    
        }
        else{
          this.toast.presentToast("Error al eliminar la categoria");
        }
      }
    })
  }

  refreshCategories($event){
    this.store.dispatch(new GetCategories({user: this.user._id}));    
    $event.target.complete();
  }

}
