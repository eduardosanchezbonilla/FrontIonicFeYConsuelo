import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Contract } from 'src/app/models/contract/contract';
import { ToastService } from '../toast/toast.service';

@Injectable()
export class ContractService {

  constructor(private storage:StorageService,
    private toast:ToastService,
  ) { }

  
  async downloadContract(contractGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {        
        url:environment.host + '/contract/'+ contractGoogleId + "/download",
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {     
      const newToken = response.headers['Authorization'] || response.headers['authorization'];      
      if(newToken){        
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }     
      if(response.status==200 || response.status==204){
        return await response.data as Contract;        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al descargar el contrato'
        });
      }    
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async getContracts(contractGroupGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/contract/'+ contractGroupGoogleId,
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {           
      const newToken = response.headers['Authorization'] || response.headers['authorization'];          
      if(newToken){        
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }     
      if(response.status==200 || response.status==204){
        const data = await response.data as Contract[];
        return data;
      }
      else{           
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de contratos'
        });
      }    
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async uploadContract(contract:Contract){    
    const token = await this.storage.getItem('token');  
    return Http.post(
      {
        url:environment.host + '/contract',
        params:{},
        data:contract,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {          
      const newToken = response.headers['Authorization'] || response.headers['authorization'];      
      if(newToken){        
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }     
      if(response.status==200 || response.status==204){
        return await response.data as Contract;        
      }
      else{              
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al subir el contrato'
        });
      }    
    })
    .catch((error) => {              
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }

  async deleteContract(contractGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.del(
      {        
        url:environment.host + '/contract/'+ contractGoogleId,
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {     
      const newToken = response.headers['Authorization'] || response.headers['authorization'];      
      if(newToken){        
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }    
      if(response.status==200){
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al eliminar el contrato'
        });
      }    
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }


  
}

