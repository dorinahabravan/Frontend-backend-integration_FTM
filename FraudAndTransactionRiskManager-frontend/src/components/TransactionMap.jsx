
import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const locations = {
    "United Kingdom": {
        position: [51.5074, -0.1278],
        city: "London"
    },
    "United States": {
        position: [40.7128, -74.0060],
        city: "New York"
    },
    "Spain": {
        position: [40.4168, -3.7038],
        city: "Madrid"
    },
    "France": {
        position: [48.8566, 2.3522],
        city: "Paris"
    },
    "Germany": {
        position: [52.5200, 13.4050],
        city: "Berlin"
    },
    "Italy": {
        position: [41.9028, 12.4964],
        city: "Rome"
    },
    "Netherlands": {
        position: [52.3676, 4.9041],
        city: "Amsterdam"
    },
    "Japan": {
        position: [35.6762, 139.6503],
        city: "Tokyo"
    },
    "Canada": {
        position: [43.6532, -79.3832],
        city: "Toronto"
    },
    "Switzerland": {
        position: [47.3769, 8.5417],
        city: "Zurich"
    },
    "Australia": {
        position: [-33.8688, 151.2093],
        city: "Sydney"
    }
};

const normalizeCountry = (country) => {
    const countryMap = {
        UK: "United Kingdom",
        GB: "United Kingdom",
        England: "United Kingdom",
        US: "United States",
        USA: "United States",
        FR: "France",
        DE: "Germany",
        ES: "Spain",
        IT: "Italy",
        NL: "Netherlands",
        JP: "Japan",
        CA: "Canada",
        CH: "Switzerland",
        AU: "Australia"
    };

    const value = String(country || "").trim();

    return countryMap[value] || value;
};

const markerIcon = new L.Icon({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIconRetinaUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapController({ selectedCountry }) {
    const map = useMap();
    const normalizedCountry = normalizeCountry(selectedCountry);

    useEffect(() => {
        const location = locations[normalizedCountry];

        if (location) {
            map.flyTo(location.position, 7, {
                duration: 1.5
            });
        } else {
            map.flyTo([25, 0], 2, {
                duration: 1.5
            });
        }
    }, [normalizedCountry, map]);

    useEffect(() => {
        const resizeMap = () => {
            map.invalidateSize();
        };

        resizeMap();

        const observer = new ResizeObserver(resizeMap);
        observer.observe(map.getContainer());

        return () => observer.disconnect();
    }, [map]);

    return null;
}

function TransactionMap({ selectedCountry }) {
    const normalizedCountry = normalizeCountry(selectedCountry);

    const selectedLocation =
        locations[normalizedCountry] || null;

    return (
        <MapContainer
            center={[25, 0]}
            zoom={2}
            scrollWheelZoom={true}
            style={{
                width: "100%",
                height: "100%",
                minHeight: "300px",
                borderRadius: "6px"
            }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController selectedCountry={selectedCountry} />

            {selectedLocation && (
                <Marker
                    position={selectedLocation.position}
                    icon={markerIcon}
                >
                    <Popup>
                        <strong>{selectedLocation.city}</strong>
                        <br />
                        {normalizedCountry}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

export default TransactionMap;
