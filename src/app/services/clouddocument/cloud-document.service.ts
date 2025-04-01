import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { CloudDocument } from 'src/app/models/clouddocument/cloud-document';

@Injectable()
export class CloudDocumentService {

  constructor(private storage:StorageService    
  ) { }

  
  async downloadCloudDocument(documentGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {        
        url:environment.host + '/cloud-document/'+ documentGoogleId + "/download",
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
        return await response.data as CloudDocument;        
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al descargar el documento'
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

  async getCloudDocuments(folderGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/cloud-document/'+ folderGoogleId,
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
        const data = await response.data as CloudDocument[];
        return data;
      }
      else{           
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de documentos'
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

  async uploadCloudDocument(cloudDocument:CloudDocument){    
    const token = await this.storage.getItem('token');  
    return Http.post(
      {
        url:environment.host + '/cloud-document/upload',
        params:{},
        data:cloudDocument,
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
        return await response.data as CloudDocument;        
      }
      else{              
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al subir el documento'
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

  async deleteCloudDocument(documentGoogleId:string){
    const token = await this.storage.getItem('token');  
    return Http.del(
      {        
        url:environment.host + '/cloud-document/'+ documentGoogleId,
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
          message: response.data?.message || 'Error al eliminar el documento'
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

