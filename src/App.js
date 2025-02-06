import './App.css';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';


import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from 'leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";
const API_URL = "http://localhost:3001"; // เปลี่ยน URL ถ้า Backend อยู่ที่อื่น



// แก้ปัญหา Marker Icon ไม่แสดง
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icon
const customIcon = new Icon({
  iconUrl: require("./img/location.png"),
  iconSize: [38, 38],
});

// Component ติดตามตำแหน่งผู้ใช้
const GPSMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    // เรียก locate เพื่อติดตามตำแหน่ง
    map.locate({
      setView: true,
      maxZoom: 16,
      watch: true, // ติดตามตำแหน่งต่อเนื่อง
    });

    // Event เมื่อเจอตำแหน่ง
    map.on("locationfound", (e) => {
      setPosition(e.latlng); // เก็บตำแหน่งใน state
    });

    // Event เมื่อไม่พบตำแหน่ง
    map.on("locationerror", (e) => {
      console.error("Location error:", e.message);
    });
  }, [map]);

  // แสดง Marker เมื่อมีตำแหน่ง
  return position ? (
    <Marker position={position}>
      <Popup>คุณอยู่ที่นี่</Popup>
    </Marker>
  ) : null;
};



function App() {

  //Docker Setting Start
  const [message, setMessage] = useState("");
  const [dbMessages, setDbMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // โหลดข้อความจาก Backend
  useEffect(() => {
    fetch(`${API_URL}/test`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error("Error:", err));

    fetchMessages();
  }, []);

  // ดึงข้อมูลจาก Database
  const fetchMessages = () => {
    fetch(`${API_URL}/messages`)
      .then(res => res.json())
      .then(data => setDbMessages(data))
      .catch(err => console.error("Error fetching messages:", err));
  };

  // ส่งข้อความไปยัง Database
  const sendMessage = async () => {
    if (!newMessage) return;
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      fetchMessages(); // โหลดข้อมูลใหม่
      setNewMessage("");
    }
  };

  //Docker Setting end


  const markers = [
    {
      geocode: [13.845990, 100.571118],
      popUp: "Hello, I am pop up 1",
    },
    {
      geocode: [13.845990, 100.571118],
      popUp: "Hello, I am pop up 1",
    },{
      geocode: [13.845990, 100.571118],
      popUp: "Hello, I am pop up 1",
    },{
      geocode: [13.845990, 100.571118],
      popUp: "Hello, I am pop up 1",
    },{
      geocode: [13.845990, 100.571118],
      popUp: "Hello, I am pop up 1",
    },


    {
      geocode: [13.845872, 100.5710799],
      popUp: "Hello, I am pop up 2",
    },
    {
      geocode: [13.8456807, 100.5709628],
      popUp: "Hello, I am pop up 3",
    },
    {
      geocode: [13.8457964, 100.5708979],
      popUp: "Hello, I am pop up 4",
    },
  ];

  return (
    <MapContainer
      style={{ width: '100%', height: '100vh' }}
      center={[13.845990, 100.571218]}
      zoom={13}
      scrollWheelZoom={true}
    >
      {/* แผนที่ OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ตำแหน่ง GPS */}
      <GPSMarker />

      {/* Cluster ของ Marker */}
      <MarkerClusterGroup spiderfyOnMaxZoom={true} maxClusterRadius={1}>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )

}

   


export default App;
