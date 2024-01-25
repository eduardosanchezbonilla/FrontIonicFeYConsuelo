import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Item } from '../models/item';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class ItemsService {

  constructor(private storage:StorageService) { }

  async createItem(item:Item){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/items',
        params:{},
        data:item,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==201){
        const data = await response.data as Item;
        return data;
      }
      return null;
    })
  }

  async getItems(descripcion:string,user:string){
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/items',
        params:{'description':descripcion, 'user':user},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as Item[];
        return data;
      }
      return null;
    })
  }

  async updateItem(id:string, newItem:Item){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/items/'+ id,
        params:{},
        data:newItem,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as Item;
        return data;
      }
      return null;
    })
  }

  async updateStatusItem(id:string){
    const token = await this.storage.getItem('token');
    return Http.patch(
      {
        url:environment.host + '/items/'+ id,
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as Item;
        return data;
      }
      return null;
    })
  }

  async deleteItem(id:string){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/items/'+ id,
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as boolean;
        return data;
      }
      return null;
    })
  }

}
