import 'leaflet-draw';

declare module 'leaflet' {
  namespace Control {
    interface DrawOptions {
      position?: string;
      draw?: any;
      edit?: any;
    }

    class Draw extends Control {
      constructor(options?: DrawOptions);
    }
  }

  namespace DrawEvents {
    interface Created {
      layer: L.Layer;
      layerType: string;
    }
    interface Edited {
      layers: L.LayerGroup;
      layer: L.Layer;
      layerType: string;      
    }
  }

  const Draw: {
    Event: {
      CREATED: string;
      EDITED: string;     
    };
  };
}