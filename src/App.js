import "./App.css";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = "http://localhost:3001";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const customIcon = new Icon({
  iconUrl: require("./img/location.png"),
  iconSize: [38, 38],
});

const GPSMarker = ({ setUserPosition }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16, watch: true });
    map.on("locationfound", (e) => {
      setPosition(e.latlng);
      setUserPosition(e.latlng); // ✅ บันทึกตำแหน่งปัจจุบัน
    });
    map.on("locationerror", (e) => console.error("Location error:", e.message));
  }, [map, setUserPosition]);

  const userIcon = new Icon({
    iconUrl: require("./img/location-me.png"),
    iconSize: [30, 30],
  });

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>คุณอยู่ที่นี่</Popup>
    </Marker>
  ) : null;
};


const ReCenterButton = ({ position }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (position) {
      map.setView(position, 18, { animate: true }); // ✅ ซูมเข้าไปที่ตำแหน่งผู้ใช้
      map.invalidateSize(); // ✅ แก้บั๊กแผนที่โหลดไม่ครบ
     
    } else {
      alert("ไม่พบตำแหน่งของคุณ");
    }
  };

  return (
    <button
      onClick={handleRecenter}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: "white",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      📍
    </button>
  );
};

function HeaderBar({ onFilterClick, onProfileClick }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#006642",
        color: "white",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={require("./img/logo.png")}
          alt="Logo"
          style={{ height: "40px" }}
        />
      </div>
      <input
        type="text"
        placeholder="ค้นหาสถานที่..."
        style={{
          flex: 1,
          margin: "0 10px",
          padding: "5px 10px",
          borderRadius: "5px",
          border: "none",
          color: "black",
        }}
      />
      <button
        onClick={onFilterClick}
        style={{
          padding: "5px 15px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "white",
          color: "#006642",
        }}
      >
        Filter
      </button>
      <img
        src={require("./img/profile.png")}
        alt="Profile"
        style={{ height: "40px", marginLeft: "10px", borderRadius: "50%", cursor:"pointer"}}
        onClick={onProfileClick}
      />
    </header>
  );
}

function LoginPage({ onClose, onRegisterClick, onLogin}) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const testUsers = [
    { username: "test", password: "test123" },  
    { username: "henry", password: "henry123" }, 
  ];
  

  const handleLogin = () => {

    const user = testUsers.find(
      (user) => user.username === username && user.password === password
    );
    
    if (user) {
      setError("");
      onLogin(username);
      onClose();
      alert("Login successful!");
    } else {
      setError("Invalid username or password.");
    }
  };
  
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "100px auto",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: 24, fontWeight: "bold", marginBottom: "16px" }}>
        Login
      </h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {error && (
        <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleLogin}
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#006642",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Login
      </button>
      <div style={{ marginTop: "20px" }}>
        <span>
          Don’t have an account?{" "}
          <a
            href="#"
            onClick={onRegisterClick}
            style={{ textDecoration: "underline" }}
          >
            Register
          </a>
        </span>
      </div>
    </div>
  );
}

function SignUpPage({ onClose, onLoginClick}) {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "100px auto",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: 24, fontWeight: "bold", marginBottom: "16px" }}>
        Sign Up
      </h3>
      <input
        type="text"
        placeholder="Username"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="text"
        placeholder="Name"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="email"
        placeholder="E-mail"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#006642",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Register
      </button>
      <div style={{ marginTop: "20px" }}>
        <span>
          Have an account?{" "}
          <a
            href="#"
            onClick={onLoginClick}
            style={{ textDecoration: "underline" }}
          >
            Login
          </a>
        </span>
      </div>
    </div>
  );
}

function FilterPanel({ onClose, filters, setFilters }) {
  const handleClear = () => {
    setFilters({
      women: false,
      men: false,
      accessible: false,
      bidet: false,
      tissue: false,
      free: false,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        width: "100%",
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <h3 style={{ fontSize: 24, fontWeight: "bold", marginBottom: "16px" }}>
        Filter
      </h3>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/women.png")}
            alt="Women Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Women</label>
        </div>
        <input
          type="checkbox"
          checked={filters.women}
          onChange={() =>
            setFilters((prev) => ({ ...prev, women: !prev.women }))
          }
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/men.png")}
            alt="Men Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Men</label>
        </div>
        <input
          type="checkbox"
          checked={filters.men}
          onChange={() => setFilters((prev) => ({ ...prev, men: !prev.men }))}
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/accessible.png")}
            alt="Accessible Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Accessible</label>
        </div>
        <input
          type="checkbox"
          checked={filters.accessible}
          onChange={() =>
            setFilters((prev) => ({ ...prev, accessible: !prev.accessible }))
          }
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/bidet.png")}
            alt="Bidet Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Bidet Spray</label>
        </div>
        <input
          type="checkbox"
          checked={filters.bidet}
          onChange={() =>
            setFilters((prev) => ({ ...prev, bidet: !prev.bidet }))
          }
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/tissue.png")}
            alt="Tissue Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Tissue Paper</label>
        </div>
        <input
          type="checkbox"
          checked={filters.tissue}
          onChange={() =>
            setFilters((prev) => ({ ...prev, tissue: !prev.tissue }))
          }
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        className="filter-option"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={require("./img/money.png")}
            alt="Free Icon"
            style={{ height: "24px", marginRight: "10px" }}
          />
          <label>Free</label>
        </div>
        <input
          type="checkbox"
          checked={filters.free}
          onChange={() => setFilters((prev) => ({ ...prev, free: !prev.free }))}
          style={{ transform: "scale(1.5)" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center", 
          gap: "20px", 
          marginTop: "20px",
        }}
      >
        <button
          onClick={handleClear}
          style={{
            background: "none",
            border: "1px solid #006642",
            color: "#006642",
            padding: "10px",
            borderRadius: "15px"
          }}
        >
          Clear
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#006642",
            color: "white",
            padding: "10px",
            borderRadius: "15px"
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function BottomSheet({ data, onClose, loggedIn, setShowLogin, username, commentsByLocation, setCommentsByLocation }) {
  const [rating, setRating] = useState(0); 
  const [comment, setComment] = useState("");

  const [showLoginAlert, setShowLoginAlert] = useState(false); 
  
  if (!data) return null;

  const comments = commentsByLocation[data.name] || [];

  const features = data.features;
  const hours = data.hours;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };
  

  const handleRatingClick = (value) => {
    if (!loggedIn) {
      setShowLoginAlert(true);
      return;
    }
    setRating(value);
  };

  const handleCommentSubmit = () => {
    if (!loggedIn) {
      setShowLoginAlert(true);
      return;
    }

    if (comment.trim() !== "") {
      const newComment = {
        username: username,
        text: comment,
        rating: rating,
        date: new Date().toLocaleDateString("en-GB"),
      };

      setCommentsByLocation((prevComments) => ({
        ...prevComments,
        [data.name]: [...(prevComments[data.name] || []), newComment],
      }));

      setComment(""); 
      setRating(0);
    }
  };

  return (
    <div style={{
      position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        maxHeight: "50vh",
        backgroundColor: "white",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px",
    }}>

      {showLoginAlert && (
  <div
    style={{
      position: "fixed",
      top: "30%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "15px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
      zIndex: 2000,
      width: "320px",
      border: "2px solid rgba(0, 0, 0, 0.1)"
    }}
  >

    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={() => setShowLoginAlert(false)}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ✖
      </button>
    </div>

    <p style={{ fontSize: "18px", fontWeight: "bold", margin: "10px 0" }}>
      Please Login before review!
    </p>

    <button
      onClick={() => {
        setShowLoginAlert(false); 
        setShowLogin(true);
        onClose(); 
      }}
      style={{
        marginTop: "15px",
        padding: "10px 20px",
        backgroundColor: "#006642",
        color: "white",
        border: "none",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "16px",
        width: "30%",
      }}
    >
      Got it
    </button>
  </div>
)}

<div
  style={{
    position: "sticky",
    top: "-20px",
    width: "100%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
    marginTop: "-20px",
    
  }}
>
  <button
    onClick={onClose}
    style={{
      background: "white",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        cursor: "pointer",
    }}
  >
    ▼
  </button>
</div>



      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ fontWeight: 'bold' }}>{data.name}</h3>
      </div>
      <p><strong>{data.details}</strong></p>

      <div>
        <strong>Rating:</strong> {data.rating} ⭐
      </div>
      <br />

      <div>
        <strong>Features:</strong>
        <ul>
        <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Women's restroom <span style={{ marginLeft: '10px' }}>{features.women ? '✔' : '✘'}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Men's restroom <span style={{ marginLeft: '10px' }}>{features.men ? '✔' : '✘'}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Accessible restroom <span style={{ marginLeft: '10px' }}>{features.accessible ? '✔' : '✘'}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Bidet <span style={{ marginLeft: '10px' }}>{features.bidet ? '✔' : '✘'}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Tissue available <span style={{ marginLeft: '10px' }}>{features.tissue ? '✔' : '✘'}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            Free to use <span style={{ marginLeft: '10px' }}>{features.free ? '✔' : '✘'}</span>
          </li>
          
        </ul>
      </div>
      <br />

      <div>
        <strong>Opening Hours:</strong>
        <ul>
          {Object.keys(hours).map((day) => (
            <li key={day} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
            <span style={{ marginLeft: '10px' }}>{hours[day]}</span>
          </li>
          ))}
        </ul>
      </div>

<div style={{ marginTop: '20px' }}>
    <strong>Images:</strong>
    {Array.isArray(data.imageUrls) && data.imageUrls.length > 1 ? (
        <Slider {...settings}>
            {data.imageUrls.map((image, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img 
                        src={image} 
                        alt={`Image ${index + 1}`} 
                        style={{ 
                            width: "100%", 
                            maxWidth: "600px",
                            height: "auto", 
                            maxHeight: "300px",
                            objectFit: "contain",
                            borderRadius: "10px"
                        }} 
                    />
                </div>
            ))}
        </Slider>
    ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img 
                src={data.imageUrls[0]} 
                alt="Single Image" 
                style={{ 
                    width: "100%", 
                    maxWidth: "600px",
                    height: "auto",
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "10px"
                }} 
            />
        </div>
    )}
</div>


      <div style={{ marginTop: "20px" }}>
        <strong>Rating</strong>
        <div style={{ display: "flex", fontSize: "24px", cursor: "pointer" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRatingClick(star)}
              style={{ color: star <= rating ? "#FFD700" : "#ccc", marginRight: "5px" }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="เขียนความคิดเห็นของคุณ..."
        style={{
          width: "100%",
          height: "80px",
          marginTop: "10px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleCommentSubmit}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#006642",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
        }}
      >
        Submit
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Comment</strong>
        {comments.map((c, index) => (
          <div key={index} style={{ marginTop: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
            <strong>{c.username}</strong>
            <div style={{ color: "#FFD700", fontSize: "16px" }}>
              {"★".repeat(c.rating) + "☆".repeat(5 - c.rating)}
            </div>
            <p>{c.text}</p>
            <span style={{ fontSize: "12px", color: "gray" }}>{c.date}</span>
          </div>
        ))}
      </div>
      
    </div>
    
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false); 
  const [username, setUsername] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [commentsByLocation, setCommentsByLocation] = useState({});
  const [userPosition, setUserPosition] = useState(null);

  const [filters, setFilters] = useState({
    women: false,
    men: false,
    accessible: false,
    bidet: false,
    tissue: false,
    free: false,
  });

  const markers = [
    {
      geocode: [13.8475, 100.5695],
      name: "อาคารสารสนเทศ",
      rating: 4.5,
      details: "ห้องน้ำอยู่ที่ชั้น 1",
      imageUrls: [
        require("./img/pic1.jpg"),
        require("./img/pic2.jpg"),
        require("./img/pic3.jpg"),
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "8:00 - 20:00",
        tuesday: "8:00 - 20:00",
        wednesday: "8:00 - 20:00",
        thursday: "8:00 - 20:00",
        friday: "8:00 - 20:00",
        saturday: "9:00 - 18:00",
        sunday: "Closed",
      },
    },
    
    {
      geocode: [13.845872, 100.5710799],
      name: "ตึก SC-45",
      rating: 4.2,
      details: "คณะวิทยาศาสตร์ ชั้น 2",
      imageUrls: [
        require("./img/SC45_1.JPG"),
        require("./img/SC45_2.jpg"),
        require("./img/SC45_3.JPG"),
        require("./img/SC45_4.JPG"),
        require("./img/SC45_5.jpg"),
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "9:00 - 20:00",
        tuesday: "9:00 - 20:00",
        wednesday: "9:00 - 20:00",
        thursday: "9:00 - 20:00",
        friday: "9:00 - 20:00",
        saturday: "10:00 - 18:00",
        sunday: "Closed",
      },
    },
    {
      geocode: [13.8447, 100.5679],
      name: "สำนักบริการคอมพิวเตอร์",
      rating: 4.8,
      details: "ชั้น 1",
      imageUrls: [require("./img/pic2.jpg")], 

      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: false,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "8:00 - 22:00",
        tuesday: "8:00 - 22:00",
        wednesday: "8:00 - 22:00",
        thursday: "8:00 - 22:00",
        friday: "8:00 - 22:00",
        saturday: "9:00 - 18:00",
        sunday: "9:00 - 18:00",
      },
    },
    {
      geocode: [13.8500161, 100.5694243],
      name: "ศูนย์เรียนรวม 4",
      rating: 2.5,
      details: "ชั้น 1",
      imageUrls: [
        require("./img/LH4_1.jpg"),
        require("./img/LH4_2.jpg"),
        require("./img/LH4_3.jpg"),
        
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "6:00 - 20:00",
        tuesday: "6:00 - 20:00",
        wednesday: "6:00 - 20:00",
        thursday: "6:00 - 20:00",
        friday: "6:00 - 20:00",
        saturday: "7:00 - 18:00",
        sunday: "7:00 - 18:00",
      },
    },
    {
      geocode: [13.8481469, 100.5720633],
      name: "สำนักหอสมุด",
      rating: 5.0,
      details: "ชั้น 1",
      imageUrls: [
        require("./img/lib1.jpg"),
        require("./img/lib2.jpg"),
        require("./img/lib3.jpg"),
        
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "8:00 - 18:30",
        tuesday: "8:00 - 18:30",
        wednesday: "8:00 - 18:30",
        thursday: "8:00 - 18:30",
        friday: "8:00 - 18:30",
        saturday: "8:00 - 18:30",
        sunday: "Closed",
      },
    },
    {
      geocode: [13.8494822, 100.5693871],
      name: "ศูนย์เรียนรวม 3",
      rating: 4.0,
      details: "ชั้น 1",
      imageUrls: [
        require("./img/LH3_1.jpg"),
        require("./img/LH3_2.jpg"),
        require("./img/LH3_3.jpg"),
        
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: true,
        free: true,
      },
      hours: {
        monday: "7:00 - 18:00",
        tuesday: "7:00 - 18:00",
        wednesday: "7:00 - 18:00",
        thursday: "7:00 - 18:00",
        friday: "7:00 - 18:00",
        saturday: "7:00 - 16:30",
        sunday: "7:00 - 16:30",
      },
    },
    {
      geocode: [13.8522467, 100.571537],
      name: "โรงอาหารกลาง 2 ",
      rating: 4.5,
      details: "ห้องน้ำอยู่ที่ชั้น 1",
      imageUrls: [
        require("./img/pic1.jpg"),
        require("./img/pic2.jpg"),
        require("./img/pic3.jpg"),
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: false,
        free: true,
      },
      hours: {
        monday: "8:00 - 20:00",
        tuesday: "8:00 - 20:00",
        wednesday: "8:00 - 20:00",
        thursday: "8:00 - 20:00",
        friday: "8:00 - 20:00",
        saturday: "9:00 - 18:00",
        sunday: "Closed",
      },
    },
    {
      geocode: [13.8446855,100.5768418],
      name: "คณะสัตวแพทย์ศาสตร์",
      rating: 3.5,
      details: "อาคารจักรพิชัยรณรงค์สงคราม",
      imageUrls: [
        require("./img/pic1.jpg"),
        require("./img/pic2.jpg"),
        require("./img/pic3.jpg"),
      ],
      features: {
        women: true,
        men: true,
        accessible: true,
        bidet: true,
        tissue: false,
        free: true,
      },
      hours: {
        monday: "8:00 - 20:00",
        tuesday: "8:00 - 20:00",
        wednesday: "8:00 - 20:00",
        thursday: "8:00 - 20:00",
        friday: "8:00 - 20:00",
        saturday: "9:00 - 18:00",
        sunday: "Closed",
      },
    },
  ];


  const handleProfileClick = () => {
    if (loggedIn) {
      setShowUserProfile((prev) => !prev);
    } else {
      if (showLogin || showSignUp) {
        setShowLogin(false);
        setShowSignUp(false);
      } else {
        setShowLogin(true);
      }
    }
  };

  const handleFilterClick = () => {
    setShowFilter((prev) => !prev);
  };

  const handleRegisterClick = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const handleLogin = (usernameInput) => {
    setUsername(usernameInput);
    setLoggedIn(true);
    setShowLogin(false);
    setShowSignUp(false);
    setShowUserProfile(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setShowUserProfile(false);
  };



  return (
    <div>
      <HeaderBar 
        onFilterClick={() => setShowFilter(!showFilter)}
        onProfileClick={handleProfileClick}
      />
      {loggedIn && showUserProfile ? (
        <div style={{ padding: "20px", textAlign: "center", marginTop: "100px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>Hi, {username}</h1>
          <p style={{ fontSize: "16px", color: "#555" }}>have a nice day :)</p>
          <br />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
            <button style={profileButtonStyle}>Find a toilet</button>
            <button style={profileButtonStyle}>Near Me</button>
            <button style={profileButtonStyle}>My review</button>
          </div>

          <div style={{ marginTop: "40px" }}>
            <button
              onClick={handleLogout}
              style={{
                fontWeight: "bold",
                padding: "15px 40px",
                backgroundColor: "#006642",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                width: "80%"
              }}
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <>
          {showLogin && (
            <LoginPage
              onClose={() => setShowLogin(false)}
              onRegisterClick={() => { setShowSignUp(true); setShowLogin(false); }}
              onLogin={handleLogin}
            />
          )}
          {showSignUp && (
            <SignUpPage
              onClose={() => setShowSignUp(false)}
              onLoginClick={() => { setShowSignUp(false); setShowLogin(true); }}
            />
          )}
        </>
      )}

<MapContainer
  style={{ width: "100%", height: "100vh", marginTop: "60px", position: "relative" }}
  center={[13.84599, 100.571218]}
  zoom={13}
  scrollWheelZoom={true}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <GPSMarker setUserPosition={setUserPosition} />
  <MarkerClusterGroup 
    spiderfyOnMaxZoom={true}
    showCoverageOnHover={false}
    maxClusterRadius={80}
    zoomToBoundsOnClick={true}
  >
    {markers.map((marker, index) => (
      <Marker
        key={index}
        position={marker.geocode}
        icon={customIcon}
        eventHandlers={{
          click: () => setSelectedMarker(marker),
        }}
      ></Marker>
    ))}
  </MarkerClusterGroup>

  {/* ✅ ใส่ปุ่ม ReCenterButton ไว้ใต้ MapContainer */}
  <div style={{ position: "absolute", bottom: "60px", right: "20px", zIndex: 1000 }}>
    <ReCenterButton position={userPosition} />
  </div>
</MapContainer>

      {showFilter && (
        <FilterPanel
          onClose={() => setShowFilter(false)}
          filters={filters}
          setFilters={setFilters}
        />
      )}
      <BottomSheet
        data={selectedMarker} 
        onClose={() => setSelectedMarker(null)} 
        loggedIn={loggedIn}
        setShowLogin={setShowLogin}
        username={username}
        commentsByLocation={commentsByLocation}
        setCommentsByLocation={setCommentsByLocation}
      />
    </div>
  );
}

const profileButtonStyle = {
  fontWeight: 'bold',
  padding: "15px 40px",
  backgroundColor: "#fff",
  color: "#006642",
  border: "2px solid #006642",
  borderRadius: "25px",
  width: "80%",
};

export default App;