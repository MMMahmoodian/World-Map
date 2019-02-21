import 'ol/ol.css';
import {Map, View} from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format.js';
import { defaults as defaultInteractions, DragAndDrop } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';

var layerList = [];
var dragAndDropStyles = {
    'Point': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,255,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#ff0',
                width: 1
            })
        })
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: '#f00',
            width: 3
        })
    }),
    'Polygon': new Style({
        fill: new Fill({
            color: 'rgba(0,255,255,0.5)'
        }),
        stroke: new Stroke({
            color: '#0ff',
            width: 1
        })
    }),
    'MultiPoint': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,0,255,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#f0f',
                width: 1
            })
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: '#0f0',
            width: 3
        })
    }),
    'MultiPolygon': new Style({
        fill: new Fill({
            color: 'rgba(0,0,255,0.5)'
        }),
        stroke: new Stroke({
            color: '#00f',
            width: 1
        })
    })
};

var dndStyleFunction = function (feature, resolution) {
    var featureStyleFunction = feature.getStyleFunction();
    if (featureStyleFunction) {
        return featureStyleFunction.call(feature, resolution);
    } else {
        return dragAndDropStyles[feature.getGeometry().getType()];
    }
};

var dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [
        GPX,
        GeoJSON,
        IGC,
        KML,
        TopoJSON
    ]
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
        title: "basemap",
        source: new BingMaps({ key: "AuZoV8yCqZQq3raQl6Wb-EHw1ssB4cgvs3sczPfg0fqrelVtOvGze1FwJvJ9Ooy0", imagerySet: 'Aerial' })
    })
  ],
  interactions: defaultInteractions().extend([dragAndDropInteraction]),
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

dragAndDropInteraction.on('addfeatures', function (event) {
    // console.log(event.file.name);
    var layerName = event.file.name;
    var vectorSource = new VectorSource({
        features: event.features
    });

    map.addLayer(new VectorLayer({
        source: vectorSource,
        style: dndStyleFunction,
        title: layerName
    }));
    layerList.push(layerName);
    console.log(layerList);
    addOption(layerName);
    map.getView().fit(vectorSource.getExtent());
});

function addOption(layerName){
    var query = document.getElementById("query");
    var option = document.createElement("option");
    option.value = layerName;
    option.innerText = layerName;
    query.appendChild(option);
}