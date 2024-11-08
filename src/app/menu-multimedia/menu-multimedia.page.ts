import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalMultimediaVideoComponent } from './component/modal-multimedia-video/modal-multimedia-video.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-menu-multimedia',
  templateUrl: './menu-multimedia.page.html',
  styleUrls: ['./menu-multimedia.page.scss'],
})
export class MenuMultimediaPage implements OnInit {

  isVideoModalOpen = false;  
  selectedVideoLink: SafeResourceUrl | null = null;
  videos: any;

  constructor(
    private sanitizer: DomSanitizer,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.videos = [      
    { id: 'bqcGc6XG7vo', title: 'DE TU CONSUELO…NUESTRA FE-FE Y CONSUELO MARTOS 2024-LA PIEDAD BAILÉN-VIERNES SANTO' },
    { id: 'dmXXq_HU2X0', title: 'Spot Semana Santa de Fe y Consuelo 2018' },
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley' },
    { id: '3JZ_D3ELwOQ', title: 'Ed Sheeran - Shape of You' },
    { id: 'L_jWHffIx5E', title: 'Linkin Park - In the End' },
    { id: '9bZkp7q19f0', title: 'PSY - Gangnam Style' },
    { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Perfect' },
    { id: '2Vv-BfVoq4g', title: 'Ed Sheeran - Happier' },
    { id: 'oRdxUFDoQe0', title: 'Queen - Bohemian Rhapsody' },
    { id: 'fRh_vgS2dFE', title: 'Justin Bieber - Sorry' },
    { id: 'Zi_XLOBDo_Y', title: 'Michael Jackson - Billie Jean' },
    { id: 'y6Sxv-sUYtM', title: 'Pharrell Williams - Happy' },
    { id: 'eVTXPUF4Oz4', title: 'Eminem - Not Afraid' },
    { id: '7wtfhZwyrcc', title: 'Imagine Dragons - Believer' },
    { id: 'kXYiU_JCYtU', title: 'Linkin Park - Numb' },
    { id: 'Rb0UmrCXxVA', title: 'Camila Cabello - Havana ft. Young Thug' },
    { id: '2vjPBrBU-TM', title: 'Sia - Chandelier' },
    { id: '2-MBfn8XjIU', title: 'Maroon 5 - Girls Like You ft. Cardi B' },
    { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars' },
    ];
  }

  getThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  /*openModal(videoId: string) {
    this.selectedVideoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);    
    this.isVideoModalOpen = true;
  }*/

  async openModal(videoId: string) {
    console.log("estamos");
    const videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    const modal = await this.modalController.create({
      component: ModalMultimediaVideoComponent,
      componentProps: { videoLink }
    });
    await modal.present();
  }

  
  closeModal() {
    this.isVideoModalOpen = false;
    this.selectedVideoLink = null;
  }

}
