import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format.js';
import { defaults as defaultInteractions, DragAndDrop } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';


document.getElementById("searchButton").onclick = executeQuery;
document.getElementById("gridcode").addEventListener("keydown",function(e){
    if(e.keyCode == 13){
        executeQuery();
    }
});
var queryValue = 5;
var queryExtent;


var dragAndDropStyles = {
    'Point': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,255,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#fff',
                width: 1
            })
        })
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: '#00f',
            width: 3
        })
    }),
    'Polygon': new Style({
        stroke: new Stroke({
            color: '#000',
            width: 1
        })
    }),
    'MultiPoint': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,255,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#fff',
                width: 1
            })
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: '#00f',
            width: 3
        })
    }),
    'MultiPolygon': new Style({
        stroke: new Stroke({
            color: '#000',
            width: 1
        })
    })
};
var queryStyles = {
    'Point': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,0,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#fff',
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
            color: 'rgba(255,0,0,0.5)'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 1
        })
    }),
    'MultiPoint': new Style({
        image: new CircleStyle({
            fill: new Fill({
                color: 'rgba(255,0,0,0.5)'
            }),
            radius: 5,
            stroke: new Stroke({
                color: '#fff',
                width: 1
            })
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: '#f00',
            width: 3
        })
    }),
    'MultiPolygon': new Style({
        fill: new Fill({
            color: 'rgba(255,0,0,0.5)'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 1
        })
    })
};

var dndStyleFunction = function (feature, resolution) {
    var style = dragAndDropStyles[feature.getGeometry().getType()];
    style.setText(new Text({
        text: getLabel(feature, resolution)
    }));
    return style;
};
var queryStyleFunction = function (feature, resolution) {
    console.log("query style called!");
    if (queryValue) {
        var grid_code = feature.get("GRID_CODE");
        if (grid_code == queryValue) {
            queryExtent = feature["values_"].geometry["extent_"];
            return queryStyles[feature.getGeometry().getType()];
        }
    }
    return dragAndDropStyles[feature.getGeometry().getType()];

};

var getLabel = function (feature, resolution) {
    var text = String(feature.get("GRID_CODE"))
    return text;
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
    var layerName = event.file.name;
    var vectorSource = new VectorSource({
        features: event.features
    });

    map.addLayer(new VectorLayer({
        source: vectorSource,
        style: dndStyleFunction,
        title: layerName
    }));
    addOption(layerName);
    map.getView().fit(vectorSource.getExtent());
});

function addOption(layerName) {
    var query = document.getElementById("query");
    var option = document.createElement("option");
    option.value = layerName;
    option.innerText = layerName;
    query.appendChild(option);
}

function executeQuery() {

    var query = document.getElementById("query");
    queryValue = document.getElementById("gridcode").value;
    map.getLayers().forEach(function (layer) {
        if (layer.get('title') == query.value) {
            console.log("Query Executed!");
            layer.setStyle(queryStyleFunction);
            // console.log(layer);
            map.getView().fit(layer.getSource().getExtent());
        } else if (layer.type != "TILE") {
            layer.setStyle(dndStyleFunction);
        }
    });
    
}