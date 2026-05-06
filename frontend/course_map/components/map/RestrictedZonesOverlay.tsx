"use client";

import { Source, Layer } from "react-map-gl";
import { useMapStore } from "@/hooks/use-map-store";

// Define your restricted parking zones here
const RESTRICTED_ZONES = [
  {
    id: "preferred-permit-parking-1",
    name: "Preferred Permit Parking",
    // Latitude/Longitude provided by user (converted to [lng, lat] for Mapbox)
    coordinates: [
      [-87.47515926134743, 41.58725679355043],
      [-87.47508377918547, 41.58725194857965],
      [-87.47507975587203, 41.58738084338986],
      [-87.47463048587014, 41.58737683110391],
      [-87.47463048586937, 41.5881622313323],
      [-87.47497850248276, 41.58816122827297],
      [-87.47497716137829, 41.58793453646707],
      [-87.47482226380899, 41.587808651954596],
      [-87.47482628712245, 41.58763311537509],
      [-87.47516129646588, 41.58763020570436],
      [-87.47515926134743, 41.58725679355043], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-2",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47459469936483, 41.586060175799595],
      [-87.47452563248395, 41.58607722836084],
      [-87.47453007061623, 41.586781715903854],
      [-87.4743121411377, 41.586782718984594],
      [-87.47431388691221, 41.587523046467155],
      [-87.47445470288294, 41.587620344110356],
      [-87.47459753051041, 41.587624356381156],
      [-87.47459469936483, 41.586060175799595], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-3",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47600169351136, 41.58594474654244],
      [-87.47597822418292, 41.585559055838516],
      [-87.4755396830169, 41.585559055838516],
      [-87.4755349891512, 41.58590111194899],
      [-87.47559198609174, 41.58594574963619],
      [-87.47600169351136, 41.58594474654244], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-4",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47237963838819, 41.58720767093023],
      [-87.47194847329683, 41.58720967707848],
      [-87.47195048495355, 41.587164538727706],
      [-87.47237360341802, 41.58716303411548],
      [-87.47237963838819, 41.58720767093023], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-5",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47197474736564, 41.587408338788734],
      [-87.47162807185671, 41.58741385567914],
      [-87.4716099669462, 41.58768167506431],
      [-87.47197742957458, 41.587682678131074],
      [-87.47197474736564, 41.587408338788734], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-6",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47586493607344, 41.58362207914862],
      [-87.47563511435776, 41.5836171676099],
      [-87.47563511435776, 41.583221787516656],
      [-87.47586493607344, 41.5832248572472],
      [-87.47586493607344, 41.58362207914862], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-7",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47564706308457, 41.582665140903984],
      [-87.47565335264355, 41.58200795414653],
      [-87.47587989119185, 41.58201593559569],
      [-87.47586694729144, 41.582546282413915],
      [-87.47564706308457, 41.582665140903984], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-8",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47487017544887, 41.582118262988146],
      [-87.47480386570062, 41.582116759956605],
      [-87.47480969456286, 41.58263470852427],
      [-87.47487299023166, 41.58263245399496],
      [-87.47487017544887, 41.582118262988146], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-9",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47471992190643, 41.582932580229944],
      [-87.47458849366707, 41.582933081800206],
      [-87.47458782311483, 41.5830815464311],
      [-87.4747212630109, 41.5830815464311],
      [-87.47471992190643, 41.582932580229944], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-10",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47450132187544, 41.58308305113862],
      [-87.47449931021725, 41.5828834263236],
      [-87.4732480597209, 41.58288894360038],
      [-87.47325074192977, 41.583211452703296],
      [-87.47349817570692, 41.5830820480004],
      [-87.47450132187544, 41.58308305113862], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-11",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.4754073922085, 41.58082040651468],
      [-87.47540672165628, 41.580774762110174],
      [-87.47460809393652, 41.58077325734905],
      [-87.47460876448876, 41.5808178985812],
      [-87.4754073922085, 41.58082040651468], // Close loop
    ],
  },
  {
    id: "preferred-permit-parking-12",
    name: "Preferred Permit Parking",
    coordinates: [
      [-87.47410727285809, 41.58567797301283],
      [-87.47402010106667, 41.58565189246198],
      [-87.4740187599622, 41.58568198540434],
      [-87.47409520291774, 41.585681483855424],
      [-87.47410727285809, 41.58567797301283], // Close loop
    ],
  },
];

const PERIMETER_ZONES = [
  {
    id: "campus-perimeter-1",
    name: "Campus Perimeter",
    coordinates: [
      [-87.47623735804027, 41.58850235009015],
      [-87.47621523224083, 41.58471953765655],
      [-87.47610442320654, 41.583726111986145],
      [-87.47609050962687, 41.58208696165548],
      [-87.4761879046843, 41.58145730872104],
      [-87.47622268863006, 41.58105141346526],
      [-87.47548526890971, 41.581056617266384],
      [-87.47550613927262, 41.57756997649282],
      [-87.47341910230254, 41.57758038464962],
      [-87.47336344798403, 41.5795787208505],
      [-87.47126249745999, 41.57957351693025],
      [-87.47125084245287, 41.57980494463461],
      [-87.4682802931859, 41.579872595328176],
      [-87.46830812034331, 41.58118396390033],
      [-87.47316395967451, 41.58123079801044],
      [-87.473108305357, 41.58470683413397],
      [-87.47132041036407, 41.584706834156236],
      [-87.47129482373661, 41.588485139978246],
      [-87.47623735804027, 41.58850235009015],
    ],
  },
];

const CONSTRUCTION_ZONES = [
  {
    id: "construction-zone-1",
    name: "Construction",
    coordinates: [
      [-87.47587873210026, 41.58197755921748],
      [-87.47495068779787, 41.58198558446015],
      [-87.47495068779787, 41.58137165051621],
      [-87.47588007320473, 41.58137165051621],
      [-87.47587873210026, 41.58197755921748],
    ],
  },
];

const OPEN_PARKING_ZONES = [
  {
    id: "open-parking-1",
    name: "Open Parking",
    coordinates: [
      [-87.47451429807559, 41.585820914309465],
      [-87.47453076635612, 41.5867825577249],
      [-87.47431149577311, 41.58678205618453],
      [-87.47431084100981, 41.587547211250175],
      [-87.47387766426175, 41.58754570664686],
      [-87.47372477834905, 41.58774030171981],
      [-87.47366576975178, 41.587738295588046],
      [-87.47366093321654, 41.58673433722047],
      [-87.47372262402276, 41.5865196774219],
      [-87.4737154687856, 41.58584313195087],
      [-87.47387640132398, 41.585823571588534],
      [-87.47451429807559, 41.585820914309465],
    ],
  },
  {
    id: "open-parking-2",
    name: "Open Parking",
    coordinates: [
      [-87.47360446738386, 41.58576590851815],
      [-87.47360927424266, 41.58655143332397],
      [-87.47314659319174, 41.586545414818026],
      [-87.47224831516526, 41.58636882850014],
      [-87.47225209179105, 41.58576868713473],
      [-87.4726946562716, 41.58576266855404],
      [-87.47269733984093, 41.58535063566952],
      [-87.47328345516286, 41.58535962654877],
      [-87.47327809074523, 41.585758358705405],
      [-87.47360446738386, 41.58576590851815],
    ],
  },
  {
    id: "open-parking-3",
    name: "Open Parking",
    coordinates: [
      [-87.471554960085, 41.58644521571715],
      [-87.4720062417436, 41.586440200287015],
      [-87.47200385747813, 41.585766971184135],
      [-87.47154654084936, 41.58577549750404],
      [-87.471554960085, 41.58644521571715],
    ],
  },
  {
    id: "open-parking-4",
    name: "Open Parking",
    coordinates: [
      [-87.47222830662582, 41.586602614810715],
      [-87.47182597528085, 41.58662719035285],
      [-87.47155574272749, 41.586628193436],
      [-87.47154546413388, 41.58714097509705],
      [-87.47223009797459, 41.587139470485454],
      [-87.47222830662582, 41.586602614810715],
    ],
  },
  {
    id: "open-parking-5",
    name: "Open Parking",
    coordinates: [
      [-87.47409402378214, 41.581373319858045],
      [-87.47349812890512, 41.58136288247431],
      [-87.47350141207248, 41.58189948460413],
      [-87.47410141090873, 41.581895186893135],
      [-87.47409402378214, 41.581373319858045],
    ],
  },
  {
    id: "open-parking-6",
    name: "Open Parking",
    coordinates: [
      [-87.47480599847587, 41.58205031028636],
      [-87.47481183339079, 41.58293206896404],
      [-87.47449993249094, 41.582931455015164],
      [-87.47450239486646, 41.58288479488309],
      [-87.47324986651273, 41.58288909252819],
      [-87.47324070305358, 41.58197056033736],
      [-87.47354357524317, 41.5820528306597],
      [-87.47480599847587, 41.58205031028636],
    ],
  },
  {
    id: "open-parking-7",
    name: "Open Parking",
    coordinates: [
      [-87.47540590257624, 41.57963903751696],
      [-87.47474742027498, 41.57963301836636],
      [-87.4747299096952, 41.58069752955476],
      [-87.47540582635473, 41.580694520028864],
      [-87.47540590257624, 41.57963903751696],
    ],
  },
  {
    id: "open-parking-8",
    name: "Open Parking",
    coordinates: [
      [-87.47336109369499, 41.57958187261139],
      [-87.47125418965035, 41.579571158000995],
      [-87.47124967363348, 41.58052153366591],
      [-87.47146192641044, 41.58052716381175],
      [-87.47147246378235, 41.57986843341744],
      [-87.47155826809644, 41.579863929254856],
      [-87.47156127877412, 41.58030533569431],
      [-87.47180514366681, 41.58041906492587],
      [-87.4720384711876, 41.580261420392894],
      [-87.4720384711876, 41.579915727105536],
      [-87.472747485783, 41.579919105224775],
      [-87.4727369484111, 41.58027718486349],
      [-87.47297930796495, 41.58042019095686],
      [-87.47321715150227, 41.58025241212224],
      [-87.473229194213, 41.57986955945802],
      [-87.47336768539287, 41.57979411468735],
      [-87.47336109369499, 41.57958187261139],
    ],
  },
];

export function RestrictedZonesOverlay() {
  const { activeLayers } = useMapStore();

  const restrictedFeatures = RESTRICTED_ZONES.map((zone) => ({
    type: "Feature",
    properties: {
      name: zone.name,
    },
    geometry: {
      type: "Polygon",
      coordinates: [zone.coordinates],
    },
  }));

  const openFeatures = OPEN_PARKING_ZONES.map((zone) => ({
    type: "Feature",
    properties: {
      name: zone.name,
    },
    geometry: {
      type: "Polygon",
      coordinates: [zone.coordinates],
    },
  }));

  const perimeterFeatures = PERIMETER_ZONES.map((zone) => ({
    type: "Feature",
    properties: {
      name: zone.name,
    },
    geometry: {
      type: "LineString",
      coordinates: zone.coordinates,
    },
  }));

  const constructionFeatures = CONSTRUCTION_ZONES.map((zone) => ({
    type: "Feature",
    properties: {
      name: zone.name,
    },
    geometry: {
      type: "Polygon",
      coordinates: [zone.coordinates],
    },
  }));

  const restrictedGeojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: restrictedFeatures as any,
  };

  const openGeojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: openFeatures as any,
  };

  const perimeterGeojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: perimeterFeatures as any,
  };

  const constructionGeojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: constructionFeatures as any,
  };

  return (
    <>
      {activeLayers.permittedParking && (
        <Source id="restricted-zones-source" type="geojson" data={restrictedGeojson}>
          <Layer
            id="restricted-zones-fill"
            type="fill"
            paint={{
              "fill-color": "#ef4444", // Red-500
              "fill-opacity": 0.3,
              "fill-outline-color": "#b91c1c", // Red-700
            }}
          />
          <Layer
            id="restricted-zones-outline"
            type="line"
            paint={{
              "line-color": "#b91c1c",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      <Source id="perimeter-zones-source" type="geojson" data={perimeterGeojson}>
        <Layer
          id="perimeter-zones-outline"
          type="line"
          paint={{
            "line-color": "#78350f", // Brown
            "line-width": 4,
            "line-dasharray": [2, 2],
            "line-opacity": 0.8,
          }}
        />
      </Source>

      {activeLayers.construction && (
        <Source id="construction-zones-source" type="geojson" data={constructionGeojson}>
          <Layer
            id="construction-zones-fill"
            type="fill"
            paint={{
              "fill-color": "#eab308", // Yellow-500
              "fill-opacity": 0.4,
              "fill-outline-color": "#a16207", // Yellow-700
            }}
          />
          <Layer
            id="construction-zones-outline"
            type="line"
            paint={{
              "line-color": "#a16207",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}
      
      {activeLayers.parking && (
        <Source id="open-parking-source" type="geojson" data={openGeojson}>
          <Layer
            id="open-parking-fill"
            type="fill"
            paint={{
              "fill-color": "#10b981", // Emerald-500 (Green)
              "fill-opacity": 0.3,
              "fill-outline-color": "#059669", // Emerald-600
            }}
          />
          <Layer
            id="open-parking-outline"
            type="line"
            paint={{
              "line-color": "#059669",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}
    </>
  );
}
