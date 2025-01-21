
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tabs-guest',
  templateUrl: './tabs-guest.page.html',
  styleUrls: ['./tabs-guest.page.scss'],
})
export class TabsGuestPage  implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;

  ngOnInit() {
    setTimeout(() => {
      this.checkOverflow();
    }, 100); // Esperamos a que el DOM esté completamente cargado

    window.addEventListener('resize', () => this.checkOverflow());
  }

  checkOverflow() {
    const element = this.scrollContainer.nativeElement;
    const tolerance = 2; // Tolerancia de 2 píxeles
  
    // Comprobar si hay overflow y actualizar las flechas
    this.showLeftArrow = element.scrollLeft > tolerance;
    this.showRightArrow = element.scrollWidth > element.clientWidth &&
                          element.scrollLeft < element.scrollWidth - element.clientWidth - tolerance;
  }
  

  onScroll() {
    const element = this.scrollContainer.nativeElement;
    const tolerance = 2; // Tolerancia de 2 píxeles
  
    this.showLeftArrow = element.scrollLeft > tolerance;
    this.showRightArrow = element.scrollLeft < element.scrollWidth - element.clientWidth - tolerance;
  }

  scrollLeft() {
    const element = this.scrollContainer.nativeElement;
    element.scrollBy({ left: -100, behavior: 'smooth' });
    this.onScroll(); // Actualizar flechas después del scroll
  }

  scrollRight() {
    const element = this.scrollContainer.nativeElement;
    element.scrollBy({ left: 100, behavior: 'smooth' });
    this.onScroll(); // Actualizar flechas después del scroll
  }
}