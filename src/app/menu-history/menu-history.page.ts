import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/user/users.service';

@Component({
  selector: 'app-menu-history',
  templateUrl: './menu-history.page.html',
  styleUrls: ['./menu-history.page.scss'],
})
export class MenuHistoryPage implements OnInit {

  historia = [
    {
      fecha: '1991-1995',
      descripcion: 'Nace Fe y Consuelo en el seno de la Cofradía Marteña de la noche del Jueves Santo, acogiendo el estilo militar en su repertorio para dar música a su Cristo.',
      imagen: 'assets/images/history/H1.jpg',
      widthImage: '400px',

    },
    {
      fecha: '1994-1998',
      descripcion: 'Se produce un cambio musical que marcará el devenir de Fe y Consuelo, acogiendo el estilo de la Policía Armada con Las Cigarreras como banda madre. Estos años permitieron a la banda continuar creciendo hasta comenzar a llevar su música a distintas hermandades de la geografía andaluza.',
      imagen: 'assets/images/history/H2.jpg',
      widthImage: '100%',
    },
    {
      fecha: '1999-2002',
      descripcion: 'En estos años, Fe y Consuelo comenzó a ampliar su estructura musical y social, escribiendo paso a paso la historia que se extiende hasta el día de hoy. Con ello, llegó la creación en 2002 de la Escuela de Música, que formaría la cantera y daría tintes de juventud en sus filas.',
      imagen: 'assets/images/history/H3.jpg',
      widthImage: '100%',
    },
    {
      fecha: '2003-2007',
      descripcion: 'Llegan los años en los que comienza a crecer nuestra banda. Con ello, nacen nuevos proyectos en el seno de la formación, tales como el Certamen “Ciudad de Martos”, la creación de un nuevo uniforme y la adquisición de una nueva sede. Del mismo modo, Fe yConsuelo continúa creciendo musicalmente, participando en actos cofrades por toda la geografía nacional.',
      imagen: 'assets/images/history/H4.jpg',
      widthImage: '100%',
    },
    {
      fecha: '2008-2012',
      descripcion: 'En el año 2008, se da un paso hacia adelante en la formación, adquiriendo un local de ensayo propio para continuar trabajando en el engrandecimiento de la misma que permitiría trabajar a la banda en pleno crecimiento. En esta etapa de la formación, se cumple su XX Aniversario, celebrando una inolvidable Gala en el teatro de nuestra ciudad para dicha efeméride que, además, trajo consigo el estreno de la marcha que siempre será el himno de nuestra banda: “XX AÑOS JUNTO A TI”',
      imagen: 'assets/images/history/H5.jpg',
      widthImage: '100%',
    },
    {
      fecha: '2013-2017',
      descripcion: 'Años de crecimiento, de estrenos, de asentamiento musical que permitieron a la formación hacerse hueco en el mundo de la música cofrade, alcanzando contratos en distintas capitales, además del estreno del uniforme actual en el año 2016. Cabe destacar la participación de la banda en la Magna de Jaén en 2013 y en la Magna de Cabra en 2015.',
      imagen: 'assets/images/history/H6.jpg',
      widthImage: '400px',
    },
    {
      fecha: '2018-2021',
      descripcion: 'Etapa de consolidación de la banda, siendo elegida en 2018 la mejor banda de la provincia de Jaén por Diario Jaén. Del mismo modo, la formación aumenta en estos años la calidad de su Semana Santa firmando en lugares como Cádiz, Córdoba, Jaén y Granada. Se produce el estreno del nuevo y actual Banderín, además del crecimiento en número de componentes a pesar de vivir la pandemia del Coronavirus que tanto afectó al mundo.',
      imagen: 'assets/images/history/H7.jpg',
      widthImage: '100%',
    },
    {
      fecha: '2022-Actualidad',
      descripcion: 'Llegamos a esta última época musical y actual, en la que la formación continúa engrandeciendo el repertorio propio, forjando vínculos con hermandades de renombre en Jerez de la Frontera, Jaén y Granada. Día a día trabajamos para crecer social y musicalmente, con la ilusión como bandera y con el sacrificio que requiere la música cofrade.',
      imagen: 'assets/images/history/H8.jpg',
      widthImage: '100%',
    },
  ];

  uniformes = [
    {
      nombre: 'Primer Uniforme',
      descripcion: 'El traje de estatutos de la Cofradía en 1991, perfectamente integrado en el cortejo.',
      imagen: 'assets/images/history/H9.png',
      widthImage: '50%',
    },
    {
      nombre: 'Segundo Uniforme',
      descripcion: 'Chaqueta y pantalón negro con escudo, con la creación de un nuevo banderín.',
      imagen: 'assets/images/history/H10.jpg',
      widthImage: '100%',
    },
    {
      nombre: 'Tercer Uniforme',
      descripcion: 'Guerrera y pantalón negro, fajín rojo y gorra, utilizado desde 2001 hasta 2016.',
      imagen: 'assets/images/history/H11.jpg',
      widthImage: '100%',
    },
    {
      nombre: 'Uniforme Actual',
      descripcion: 'Chaqueta y pantalón negro, cinturón rojo y corbata negra, acompañado del banderín actual.',
      imagen: 'assets/images/history/H12.jpg',
      widthImage: '100%',
    },
  ];

  direccionMusical = [
    { nombre: 'Juan Antonio Martos Martínez', periodo: '1991-2008' },
    { nombre: 'Manuel Castillo Gómez', periodo: '2002-2008' },
    { nombre: 'Eduardo Sánchez Bonilla', periodo: '2008-Actualidad' },
    { nombre: 'Francisco Cámara Liébana', periodo: '2016-Actualidad' },
    { nombre: 'Asesores Musicales', periodo: 'Antonio González Ríos, Francisco Javier González Ríos' },
  ];

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000, // Cambia la imagen cada 3 segundos
      disableOnInteraction: false, // El autoplay continúa incluso si el usuario interactúa
    },
    loop: true, // Repite las imágenes en bucle
  };

  constructor(
    private userService: UsersService
  ) { }

  ngOnInit() {
  }

  logout(){    
    this.userService.logout();
  }

}
