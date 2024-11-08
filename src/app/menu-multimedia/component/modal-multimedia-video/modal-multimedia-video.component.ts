import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-multimedia-video',
  templateUrl: './modal-multimedia-video.component.html',
  styleUrls: ['./modal-multimedia-video.component.scss'],
})
export class ModalMultimediaVideoComponent {
  @Input() videoLink: SafeResourceUrl;

  constructor(private modalController: ModalController) {}

  cancel() {
    this.modalController.dismiss();
  }
}