import * as React from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import getArea from "@turf/area";

import {
  point as makePoint,
  polygon,
  featureCollection,
  FeatureCollection,
  Polygon,
  lineString,
  MultiPolygon,
  Point,
  LineString,
} from "@turf/helpers";
import lineToPolygon from "@turf/line-to-polygon";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { nanoid } from "nanoid";
function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  }
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
const geocoderApi = {
  forwardGeocode: async (config: any) => {
    const features = [];
    try {
      const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
      const response = await fetch(request);
      const geojson = await response.json();
      for (const feature of geojson.features) {
        const center = [
          feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
        ];
        const point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: center,
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ["place"],
          center,
        };
        features.push(point);
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    return {
      features,
    };
  },
};
//@ts-expect-error
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import { Layer, Source, useMap, useControl } from "react-map-gl";
import maplibregl from "maplibre-gl";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  type SxProps,
  TextField,
  type Theme,
} from "@mui/material";
import convex from "@turf/convex";

type ApiResponseType = {
  elements: Array<{
    type: "node" | "way" | "relation";
    id: number;
    lon?: number;
    lat?: number;
    bounds: { minlat: number; minlon: number; maxlat: number; maxlon: number };
    nodes: Array<number>;
    geometry: Array<{ lat: number; lon: number }>;
    tags: Record<string, string>;
  }>;
};

const MainMap: React.FC<{ sx?: SxProps<Theme> }> = () => {
  const [bounds, setBounds] = React.useState<Array<[number, number]>>([]);
  return (
    <Map
      initialViewState={{
        longitude: 11.6115435,
        latitude: 48.1818197,
        zoom: 14,
      }}
      reuseMaps
      antialias
      styleDiffing
      preserveDrawingBuffer
      onLoad={(e) => {
        const bounds = e.target.getBounds().toArray();
        setBounds(bounds);
      }}
      onMoveEnd={(e) => {
        const bounds = e.target.getBounds().toArray();
        setBounds(bounds);
      }}
      scrollZoom={false}
      attributionControl={false}
      style={{ height: "90vh", width: "100%" }}
      mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    >
      <FindGeoJson bounds={bounds} />

      <GeoControl />
      <NavigationControl position='top-left' />
    </Map>
  );
};

export default MainMap;

function isAPolygon(geometry: Array<{ lat: number; lon: number }>) {
  if (!geometry) return false;
  return (
    geometry.length > 2 &&
    geometry[0].lat === geometry[geometry.length - 1].lat &&
    geometry[0].lon === geometry[geometry.length - 1].lon
  );
}

const FindGeoJson: React.FC<{ bounds: Array<[number, number]> }> = ({
  bounds,
}) => {
  const [data, setData] = React.useState<ApiResponseType>({ elements: [] });

  const [geojsonFC, setGeojsonFC] = React.useState<FeatureCollection<
    Polygon | MultiPolygon | Point | LineString,
    { name: string; isDisabled: boolean }
  > | null>(null);

  const [deckLayers, setDeckLayers] = React.useState<Array<any>>([]);
  React.useEffect(() => {
    if (!data.elements.length) {
      setDeckLayers([]);
      return;
    }
    const features = data.elements
      .filter((x) => {
        if (x.type === "node" && !x.lat && !x.lon) return false;
        return x.type !== "relation";
      })
      .map((element) => {
        switch (element.type) {
          case "node": {
            const point = makePoint(
              [element.lon!!, element.lat!!],
              {
                name: element.tags?.name ?? element.tags?.loc_name ?? "",
                isDisabled: false,
              },
              { id: nanoid() }
            );
            return point;
          }
          case "way": {
            const nodes = element.geometry.map(({ lat, lon }) => {
              return [lon, lat];
            });
            if (isAPolygon(element.geometry)) {
              const poly = polygon(
                [nodes],
                {
                  name: element.tags?.name ?? element.tags?.loc_name ?? "",
                  isDisabled: false,
                },
                { id: nanoid() }
              );
              return poly;
            }
            const line = lineString(
              nodes,
              {
                name: element.tags?.name ?? element.tags?.loc_name ?? "",
                isDisabled: false,
              },
              { id: nanoid() }
            );
            return line;
          }
          default:
            return null;
        }
      })
      .filter((x) => x !== null);
    //@ts-expect-error
    const geojsonData = featureCollection(features);

    setGeojsonFC(convex(geojsonData, { concavity: 1.2 }) as any);
  }, [data]);
  const toggleFeature = React.useCallback((id: string) => {
    setGeojsonFC((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        features: prev.features.filter((x) => x.id !== id),
      };
    });
  }, []);

  React.useEffect(() => {
    if (!geojsonFC) {
      setDeckLayers([]);
      return;
    }
    const layer = new GeoJsonLayer({
      id: "geojson-layer",
      data: geojsonFC,
      pickable: true,
      stroked: true,
      autoHighlight: true,
      filled: true,
      extruded: false,
      lineWidthScale: 5,
      lineWidthMaxPixels: 2,
      getFillColor: [255, 0, 0, 100],
      getLineColor: [255, 0, 0, 255],
      // onClick: (obj) => {
      //   const { layer, ...rest } = obj;

      //   toggleFeature(rest?.object.id);
      // },
    });
    setDeckLayers([layer]);
  }, [geojsonFC]);

  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [zipCode, setZip] = React.useState<string>("");
  const fetchData = React.useCallback(() => {
    if (!zipCode) {
      setErrorMsg("Please enter a zip code");
      return;
    }
    const zip = `\"${zipCode}\"`;
    const [sw, ne] = bounds;
    setLoading(true);
    //     const other = `[out:json];
    // ( way(51.477,-0.001,51.478,0.001)[name="Blackheath Avenue"];
    //   node(w);
    //   relation(51.477,-0.001,51.478,0.001); );
    // convert item ::=::,::geom=geom(),_osm_type=type();
    // out geom;`;

    //     const contentA = `
    //     [bbox:${sw[1]},${sw[0]},${ne[1]},${ne[0]}]
    //     [out:json]
    //     [timeout:90]
    //     ;
    //     (
    //         way
    //             (
    //                 ${sw[1]},${sw[0]},${ne[1]},${ne[0]}
    //              );
    //     );
    //     out geom;
    // `;
    const content = `[out:json][timeout:30];rel["postal_code"=${zip}]->.searchArea;(way(r.searchArea);node["addr:postcode"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]});way["addr:postcode"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]});relation["addr:postcode"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]});node["postal_code"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]});way["postal_code"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]});relation["postal_code"=${zip}](${sw[1]},${sw[0]},${ne[1]},${ne[0]}););out geom;`;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",

      body: "data=" + encodeURIComponent(content),
    })
      .then((res) => {
        return res.json();
      })
      .then((newData: ApiResponseType) => {
        setData(newData as ApiResponseType);
      })
      .catch((e) => {
        setErrorMsg(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bounds, zipCode]);

  return (
    <React.Fragment>
      <DeckGLOverlay
        interleaved
        layers={deckLayers}
        getTooltip={({ object }) => {
          return object?.properties?.name;
        }}
      />

      <Card
        style={{
          position: "absolute",
          zIndex: 1000,
          bottom: 10,
          right: 10,
          // backgroundColor: "#333",
          // color: "#fff",
          // padding: "5px 5px",
          // borderRadius: 10,
          height: 300,
          width: 250,
        }}
      >
        <CardContent>
          <Box my={1}>
            <TextField
              size='small'
              type='text'
              label='PLZ...'
              autoComplete='off'
              value={zipCode}
              onChange={(e) => setZip(e.target.value)}
            />
          </Box>
          {errorMsg?.length ? <Alert color='error'>{errorMsg}</Alert> : null}
          <div>{JSON.stringify(bounds, null, 2)}</div>
        </CardContent>
        <CardActions>
          <Button
            disabled={loading}
            variant='contained'
            size='small'
            onClick={fetchData}
          >
            Fetch
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

const GeoControl: React.FC = () => {
  const { current: map } = useMap();
  const [geoControl] = React.useState(
    new MaplibreGeocoder(geocoderApi, {
      maplibregl,
      showResultsWhileTyping: true,
      //   showResultMarkers: false,
      zoom: 12,
      collapsed: true,
    })
  );
  React.useEffect(() => {
    if (map) {
      map.addControl(geoControl);
    }
    return () => {
      if (map) {
        map.removeControl(geoControl);
      }
    };
  }, [map, geoControl]);
  return null;
};
// [timeout:10][out:json];is_in(45.86544,13.43339)->.a;way(pivot.a);out tags bb;out ids geom(45.86468,13.42784,45.86738,13.43468);relation(pivot.a);out tags bb;
