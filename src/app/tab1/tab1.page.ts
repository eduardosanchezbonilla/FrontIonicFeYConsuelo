import { Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalItemComponent } from './components/modal-item.component';
import { Select, Store } from '@ngxs/store';
import { CreateItem, DeleteItem, GetItems, UpdateItem, UpdateStatusItem } from './state/items.actions';
import { ItemsState } from './state/items.state';
import { ToastService } from '../services/toast/toast.service';
import { Item } from './models/item';
import { Observable } from 'rxjs/internal/Observable';
import { User } from '../users/models/user';
import { CategoriesState } from '../tab2/state/categories.state';
import { Category } from '../tab2/models/category';
import { StorageService } from '../services/storage/storage.service';
import { GetCategories } from '../tab2/state/categories.actions';
import { cloneDeep } from 'lodash-es';
import { FilterItems } from './models/filter-items';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  @Select(CategoriesState.categories)
  categories$: Observable<Category[]>;

  @Select(ItemsState.items)
  items$: Observable<Item[]>;

  public categories: Category[];
  public items: Item[];
  public user: User;
  public filter: FilterItems;
  
  constructor(
    private modalController:ModalController,
    private store:Store,
    private toast:ToastService,
    private storage: StorageService,
    private alertController: AlertController
  ) {
    this.filter = new FilterItems();
    this.filter.description = '';

  }

  async ionViewWillEnter(){
    this.categories=[];
    this.items=[];
    this.user = JSON.parse(await this.storage.getItem('user'));
    this.store.dispatch(new GetCategories({user: this.user._id}));
    this.filterItems();
    this.getCategories();
    this.getItems();
  }

  getCategories(){
    this.categories$.subscribe({
      next: ()=> {
        this.categories = cloneDeep(this.store.selectSnapshot(CategoriesState.categories));
        this.categories.unshift({_id:null, name:'SIN CATEGORIA',user:null});
      }
    })
  }

  getItems(){
    this.items$.subscribe({
      next: ()=> {
        this.items = this.store.selectSnapshot(ItemsState.items);
      }
    })
  }

  filterItems(){
    this.store.dispatch(new GetItems({description: this.filter.description, user: this.user._id}));
  }

  async createItem(){
    const modal = await this.modalController.create({
      component: ModalItemComponent
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){
      console.log(data);
      this.store.dispatch(new CreateItem({item: data})).subscribe({
        next: ()=> {
          const success = this.store.selectSnapshot(ItemsState.success);
          if(success){
            this.toast.presentToast("Item creado");
            this.filterItems();          
          }
          else{
            this.toast.presentToast("Error al crear el item");
          }
        }
      })
    }
  }

  async updateItem(item:Item){
    const modal = await this.modalController.create({
      component: ModalItemComponent,
      componentProps: {
        item,
        updating: true
      }
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if(role=='confirm'){
      console.log(data);
      this.store.dispatch(new UpdateItem({id: data._id, newItem:data})).subscribe({
        next: ()=> {
          const success = this.store.selectSnapshot(ItemsState.success);
          if(success){
            this.toast.presentToast("Item actualizado");
            this.filterItems();          
          }
          else{
            this.toast.presentToast("Error al modificar el item");
          }
        }
      })
    }
  }

  changeStatus(item:Item){
    this.store.dispatch(new UpdateStatusItem({id: item._id})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(ItemsState.success);
        if(success){
          this.toast.presentToast("Status actualizado");          
          item.status=!item.status;    
        }
        else{
          this.toast.presentToast("Error al actualizar el status del item");
        }
      }
    })
  }

  async confirmDeleteItem(item:Item) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el item?',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteItem(item)
            }
          }
        ]
    });
    alert.present();
  }

  deleteItem(item:Item) {
    this.store.dispatch(new DeleteItem({id: item._id})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(ItemsState.success);
        if(success){
          this.toast.presentToast("Item eliminado");          
          this.filterItems();    
        }
        else{
          this.toast.presentToast("Error al eliminar el item");
        }
      }
    })
  }

  refreshItems($event){
    this.store.dispatch(new GetCategories({user: this.user._id}));
    this.filterItems();
    $event.target.complete();
  }

}
