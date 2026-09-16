import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

function LocationMarker({
  position,
  onChange,
}: {
  position: LatLngExpression;
  onChange: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });
  return <Marker position={position} />;
}

export default function FarmMap({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}) {
  return (
    <MapContainer center={position} zoom={12} scrollWheelZoom className="h-64 w-full rounded-lg">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} onChange={onChange} />
    </MapContainer>
  );
}
