import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import BingMaps from 'ol/source/BingMaps.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format.js';
import { defaults as defaultInteractions, DragAndDrop } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';
import Overlay from 'ol/Overlay.js';



var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});



document.getElementById("searchButton").onclick = executeQuery;
document.getElementById("gridcode").addEventListener("keydown", function (e) {
    if (e.keyCode == 13) {
        executeQuery();
    }
});
var queryValue;
var executed = false;


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
            radius: 10,
            stroke: new Stroke({
                color: '#fff',
                width: 1
            })
        })
    }),
    'LineString': new Style({
        stroke: new Stroke({
            color: '#f00',
            width: 5
        })
    }),
    'Polygon': new Style({
        fill: new Fill({
            color: 'rgba(255,0,0,0.2)'
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
            radius: 10,
            stroke: new Stroke({
                color: '#fff',
                width: 1
            })
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: '#f00',
            width: 5
        })
    }),
    'MultiPolygon': new Style({
        fill: new Fill({
            color: 'rgba(255,0,0,0.2)'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 1
        })
    })
};

var dndStyleFunction = function (feature, resolution) {
    var geometry = feature.getGeometry().getType();
    var style = dragAndDropStyles[geometry];
    if (geometry == "Polygon" || geometry == "MultiPolygon") {
        style.setText(new Text({
            text: getLabel(feature, resolution),
            fill: new Fill({
                color: '#000'
            }),
            font: '16px serif'
        }));
    }
    return style;
};
var queryStyleFunction = function (feature, resolution) {
    var geometry = feature.getGeometry().getType();
    var style = dragAndDropStyles[geometry];
    console.log("query style called!");
    if (queryValue) {
        var grid_code = feature.get("GRID_CODE");
        if (grid_code == queryValue) {
            console.log(feature.getGeometry().getExtent());
            if (executed == false) {
                map.getView().fit(feature.getGeometry().getExtent());
                var currentZoom = map.getView().getZoom()
                map.getView().setZoom(currentZoom - 1);
                executed = true;
            }
            style = queryStyles[feature.getGeometry().getType()];
        }
    }
    if (geometry == "Polygon" || geometry == "MultiPolygon") {
        style.setText(new Text({
            text: getLabel(feature, resolution),
            fill: new Fill({
                color: '#000'
            }),
            font: '16px serif'
        }));
    }

    return style;

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
    overlays: [overlay],
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
    var layer = new VectorLayer({
        source: vectorSource,
        style: dndStyleFunction,
        title: layerName
    });
    map.addLayer(layer);
    addLayer(layer);
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
    executed = false;
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



var LayerListUl = document.getElementById("layerlistul");
function addLayer(layer) {
    var title = layer.get('title');

    if (title.length > 20) {
        title = title.substr(0, 20) + "...";
        console.log(title);
    }
    var li = document.createElement("li");
    var div = document.createElement("div");
    div.setAttribute("class", "material-switch pull-right");

    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", title);
    input.setAttribute("name", title);
    input.checked = true;
    var label = document.createElement("label");
    label.setAttribute("for", title);
    label.setAttribute("class", "label-success");
    li.appendChild(document.createTextNode(title));
    div.appendChild(input);
    div.appendChild(label);

    li.appendChild(div);
    li.setAttribute("class", "list-group-item");
    LayerListUl.appendChild(li);

    input.addEventListener('change', function () {
        // layer.visible = this.checked;
        layer.set('visible', this.checked);
    });


};

map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return feature;
    });
    if (feature) {
        content.innerHTML = "";
        var gridCode = feature.get("GRID_CODE");
        console.log(feature.getKeys());
        var fieldNames = feature.getKeys();
        var table = document.createElement("table");
        table.innerHTML += "<table><tr><th>Field Name</th><th>Value</th></tr>";
        // content.innerHTML = "<table><tr><th>Field Name</th><th>Value</th></tr>"
        fieldNames.forEach(element => {
            if (element != "geometry") {
                var tr = document.createElement("tr");
                var tableField = document.createElement("td");
                tableField.innerHTML = element;
                var tableValue = document.createElement("td");
                tableValue.innerHTML = feature.get(element);
                tr.appendChild(tableField);
                tr.appendChild(tableValue)
                console.log(element)
                console.log(feature.get(element));
                table.appendChild(tr);
            }

        });
        // content.innerHTML += "</table>"
        content.appendChild(table);
        console.log(gridCode);
        var coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
    }

});





/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
