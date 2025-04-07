import {
  GoogleLogin,
  googleLogout,
  GoogleOAuthProvider
} from "@react-oauth/google"
import { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import Slider from "react-slick"
import "slick-carousel/slick/slick-theme.css"
import "slick-carousel/slick/slick.css"
import "./App.css"

const API_URL = "http://localhost:3001"

const formatDate = (dateString) => {
  if (!dateString) return "ไม่ระบุวันที่";

  try {
    // รองรับรูปแบบ ISO date (YYYY-MM-DD)
    if (typeof dateString === "string" && dateString.includes("-")) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "ไม่ระบุวันที่";

      // แปลงเป็นรูปแบบ DD/MM/YYYY
      return new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    }

    // กรณีเป็น Date object
    if (dateString instanceof Date) {
      return new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(dateString);
    }

    return dateString;
  } catch (error) {
    console.error("❌ Error formatting date:", error);
    return "ไม่ระบุวันที่";
  }
};

Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
})

const customIcon = new Icon({
  iconUrl: require("./img/location.png"),
  iconSize: [38, 38]
})

const GPSMarker = ({ setUserPosition }) => {
  const [position, setPosition] = useState(null)
  const map = useMap()

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16, watch: true })
    map.on("locationfound", (e) => {
      setPosition(e.latlng)
      setUserPosition(e.latlng) // ✅ บันทึกตำแหน่งปัจจุบัน
    })
    map.on("locationerror", (e) => console.error("Location error:", e.message))
  }, [map, setUserPosition])

  const userIcon = new Icon({
    iconUrl: require("./img/location-me.png"),
    iconSize: [30, 30]
  })

  return position ? (
    <Marker
      position={position}
      icon={userIcon}
    >
      <Popup>คุณอยู่ที่นี่</Popup>
    </Marker>
  ) : null
}

const ReCenterButton = ({ position }) => {
  const map = useMap()

  const handleRecenter = () => {
    if (position) {
      map.setView(position, 18, { animate: true }) // ✅ ซูมเข้าไปที่ตำแหน่งผู้ใช้
      map.invalidateSize() // ✅ แก้บั๊กแผนที่โหลดไม่ครบ
    } else {
      alert("ไม่พบตำแหน่งของคุณ")
    }
  }

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
        cursor: "pointer"
      }}
    >
      📍
    </button>
  )
}

function HeaderBar({
  onFilterClick,
  onProfileClick,
  onSearchChange,
  isLoggedIn
}) {
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
        zIndex: 1000
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={require("./img/logo.png")}
          alt="Logo"
          style={{ height: "40px" }}
        />
        {isLoggedIn && (
          <span style={{ marginLeft: "10px", fontSize: "12px", color: "#eee" }}>
            ●
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder="ค้นหาสถานที่..."
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          margin: "0 10px",
          padding: "5px 10px",
          borderRadius: "5px",
          border: "none",
          color: "black"
        }}
      />
      <button
        onClick={onFilterClick}
        style={{
          padding: "5px 15px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "white",
          color: "#006642"
        }}
      >
        Filter
      </button>
      <img
        src={require("./img/profile.png")}
        alt="Profile"
        style={{
          height: "40px",
          marginLeft: "10px",
          borderRadius: "50%",
          cursor: "pointer",
          border: isLoggedIn ? "2px solid #8effb5" : "none" // แสดงขอบสีเขียวเมื่อล็อกอินแล้ว
        }}
        onClick={onProfileClick}
      />
    </header>
  )
}

function LoginPage({ onClose, onRegisterClick, onLogin }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      onLogin(JSON.parse(storedUser).name) // ✅ อัปเดตชื่อผู้ใช้ทันที
    }
  }, [])

  const handleSuccess = (credentialResponse) => {
    console.log("🔹 Google Login Success:", credentialResponse)

    fetch("http://localhost:3001/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🔹 Server Response:", data) // ✅ ตรวจสอบค่าที่เซิร์ฟเวอร์ส่งกลับมา

        if (data.user) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
          onLogin(data.user.name) // ✅ อัปเดตชื่อผู้ใช้
        } else {
          alert("Login failed!")
        }
      })
      .catch((error) => console.error("🔴 Google Auth Error:", error))
  }

  const handleFailure = () => {
    alert("Google login failed. Please try again.")
  }

  return (
    <GoogleOAuthProvider clientId="577202715001-pa9pfkmbm44haiocpbpg4ran1rn4f824.apps.googleusercontent.com">
      <div
        style={{
          padding: "20px",
          maxWidth: "400px",
          margin: "100px auto",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}
      >
        <h3 style={{ fontSize: 24, fontWeight: "bold", marginBottom: "16px" }}>
          Login
        </h3>

        {!user ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px"
            }}
          >
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleFailure}
              size="large"
              width="250"
            />
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <h3>Logged in as:</h3>
            <p>{user.name}</p>
            <p>Email: {user.email}</p>
            <button
              onClick={() => {
                googleLogout()
                setUser(null)
                localStorage.removeItem("user")
              }}
              style={{
                padding: "10px 20px",
                marginTop: "10px",
                cursor: "pointer",
                backgroundColor: "#d9534f",
                color: "white",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

function SignUpPage({ onClose, onLoginClick }) {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "100px auto",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
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
          border: "1px solid #ccc"
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
          border: "1px solid #ccc"
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
          border: "1px solid #ccc"
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
          border: "1px solid #ccc"
        }}
      />
      <button
        style={{
          padding: "10px",
          width: "100%",
          backgroundColor: "#006642",
          color: "white",
          border: "none",
          borderRadius: "5px"
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
  )
}

function FilterPanel({ onClose, filters, setFilters, applyFilters }) {
  const handleClear = () => {
    setFilters({
      women: false,
      men: false,
      accessible: false,
      bidet: false,
      tissue: false,
      free: false
    })
  }

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
        zIndex: 1000
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
          marginBottom: "12px"
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
          marginBottom: "12px"
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
          marginBottom: "12px"
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
          marginBottom: "12px"
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
          marginBottom: "12px"
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
          marginBottom: "12px"
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
          marginTop: "20px"
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
          onClick={() => {
            applyFilters()
            onClose() // ✅ ปิดหน้า Filter หลังจากกด Done
          }}
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
  )
}

function BottomSheet({
  data,
  onClose,
  loggedIn,
  setShowLogin,
  username,
  commentsByLocation,
  setCommentsByLocation,
  NO_IMAGE_URL
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // เพิ่ม state สำหรับแสดงสถานะกำลังบันทึก

  // state สำหรับการจัดการรูปภาพ
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // อ้างอิงไปยัง input file
  const fileInputRef = useRef(null)

  // ดึงข้อมูล user จาก localStorage
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("❌ ไม่สามารถแปลงข้อมูลผู้ใช้ได้:", error)
      }
    }
  }, [])

  if (!data) return null

  const comments = commentsByLocation[data.name] || []
  const features = data.features
  const hours = data.hours

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true
  }

  const handleRatingClick = (value) => {
    if (!loggedIn) {
      setShowLoginAlert(true)
      return
    }
    setRating(value)
  }

  const handleImageChange = (e) => {
    if (!loggedIn) {
      setShowLoginAlert(true)
      return
    }

    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)

      // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleImageButtonClick = () => {
    if (!loggedIn) {
      setShowLoginAlert(true)
      return
    }
    fileInputRef.current.click()
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCommentSubmit = () => {
    console.log("🔹 กำลังบันทึกความคิดเห็น...")
    console.log("🔹 ข้อมูล: ", {
      loggedIn,
      username: username || "ไม่ระบุชื่อผู้ใช้",
      comment,
      rating,
      selectedImage: selectedImage ? "มีรูปภาพ" : "ไม่มีรูปภาพ",
      data: data || "ไม่มีข้อมูล"
    })

    if (!loggedIn || !user) {
      console.error("🔴 User is not logged in!")
      setShowLoginAlert(true)
      return
    }

    // ตรวจสอบว่ามีการให้คะแนนหรือไม่
    if (rating === 0) {
      alert("กรุณาให้คะแนนก่อนบันทึกความคิดเห็น")
      return
    }

    // ตรวจสอบว่ามีการเขียนความคิดเห็นหรือไม่
    if (comment.trim() === "") {
      alert("กรุณาเขียนความคิดเห็นก่อนบันทึก")
      return
    }

    // ตรวจสอบว่ามี data และ data.id หรือไม่
    if (!data || !data.id) {
      console.error("🔴 ไม่พบข้อมูล restroom_id")
      alert("เกิดข้อผิดพลาดในการบันทึกความคิดเห็น: ไม่พบข้อมูลห้องน้ำ")
      return
    }

    // ตรวจสอบว่ามี user_id หรือไม่
    if (!user.user_id) {
      console.error("🔴 ไม่พบข้อมูล user_id")
      alert("เกิดข้อผิดพลาดในการบันทึกความคิดเห็น: ไม่พบข้อมูลผู้ใช้")
      return
    }

    // แสดงสถานะ loading
    setIsSubmitting(true)

    try {
      // สร้าง FormData สำหรับส่งข้อมูลและรูปภาพ
      const formData = new FormData()
      formData.append("restroom_id", data.id)
      formData.append("user_id", user.user_id)
      formData.append("rating", rating)
      formData.append("comment", comment)

      // แสดงรายละเอียด FormData ใน console
      console.log("🔹 FormData entries:")
      for (let [key, value] of formData.entries()) {
        console.log(`   ${key}: ${value}`)
      }

      // ถ้ามีรูปภาพ ให้แนบไปด้วย
      if (selectedImage) {
        console.log(
          "🔹 กำลังเพิ่มรูปภาพ:",
          selectedImage.name,
          "ขนาด:",
          selectedImage.size,
          "bytes"
        )
        formData.append("photo", selectedImage)

        // ตรวจสอบว่ารูปภาพมีขนาดใหญ่เกินไปหรือไม่
        if (selectedImage.size > 5 * 1024 * 1024) {
          // 5MB
          alert("รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้รูปภาพที่มีขนาดไม่เกิน 5MB")
          setIsSubmitting(false)
          return
        }
      }

      // ทดลองใช้วิธี base64 แทนถ้าการอัปโหลดไฟล์ไม่ทำงาน
      if (selectedImage && window.FileReader) {
        const reader = new FileReader()
        reader.onload = function (e) {
          const base64data = e.target.result
          sendReviewWithBase64(formData, base64data)
        }
        reader.readAsDataURL(selectedImage)
      } else {
        // ส่งข้อมูลไปยัง API แบบปกติ
        sendReviewData(formData)
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการสร้าง FormData:", error)
      alert("เกิดข้อผิดพลาดในการเตรียมข้อมูล กรุณาลองใหม่อีกครั้ง")
      setIsSubmitting(false)
    }
  }

  // ฟังก์ชันสำหรับส่งรีวิวพร้อมรูปภาพแบบ base64
  const sendReviewWithBase64 = (formData, base64Image) => {
    try {
      console.log("🔶 API_URL:", API_URL)
      console.log(
        "🔶 Full URL for review submission:",
        `${API_URL}/review/base64`
      )

      // ต้องแน่ใจว่า formData มีข้อมูลที่จำเป็นครบถ้วน
      if (
        !formData.get("restroom_id") ||
        !formData.get("user_id") ||
        !formData.get("rating")
      ) {
        throw new Error("Missing required data")
      }

      // แยกข้อมูล base64 ออกจาก header (เช่น data:image/jpeg;base64,)
      let base64String = base64Image
      if (base64Image.includes(";base64,")) {
        base64String = base64Image.split(";base64,")[1]
      }

      // สร้างข้อมูลที่จะส่ง
      const reviewData = {
        restroom_id: formData.get("restroom_id"),
        user_id: formData.get("user_id"),
        rating: formData.get("rating"),
        comment: formData.get("comment") || "",
        photo_base64: base64String
      }

      // แสดง log ข้อมูลที่จะส่ง
      console.log("🔹 Sending review data:", {
        restroom_id: reviewData.restroom_id,
        user_id: reviewData.user_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        photo_base64_length: reviewData.photo_base64
          ? reviewData.photo_base64.length
          : 0
      })

      // ทดสอบส่งข้อมูลไปยัง endpoint ทดสอบก่อน
      console.log("🔹 ทดสอบส่งข้อมูลไปยัง /test-base64 ก่อน...")
      fetch(`${API_URL}/test-base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          test: "data",
          timestamp: new Date().toISOString()
        })
      })
        .then((response) => {
          console.log(
            "🔹 ผลการทดสอบ /test-base64:",
            response.status,
            response.statusText
          )
          if (!response.ok) {
            console.error(
              "⚠️ Test endpoint failed, but continuing with actual request"
            )
          }

          // ส่งข้อมูลไปยัง API จริง
          console.log("🔹 กำลังส่งข้อมูลไปยัง /review/base64...")
          return fetch(`${API_URL}/review/base64`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(reviewData)
          })
        })
        .then((response) => {
          // ตรวจสอบสถานะ response
          console.log(
            "🔹 สถานะการส่งข้อมูล:",
            response.status,
            response.statusText
          )
          if (!response.ok) {
            // ถ้ามี error ให้อ่านข้อความ error ก่อน
            return response.text().then((text) => {
              console.error("❌ Server error response:", text)
              throw new Error(
                `Server responded with status: ${response.status}. ${text}`
              )
            })
          }
          return response.json()
        })
        .then((data) => {
          console.log("✅ Review submission successful:", data)
          // เรียกฟังก์ชันสำหรับจัดการความสำเร็จ
          handleResponse(data)
        })
        .catch((error) => {
          console.error("❌ Error in review submission:", error)

          // แสดงข้อมูลเพิ่มเติมเกี่ยวกับ error
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
          })

          // ถ้าส่งข้อมูลไปยัง /review/base64 ไม่สำเร็จ ให้ลองส่งผ่าน /review แทน
          console.log("🔸 ลองส่งข้อมูลผ่าน /review แทน...")

          // สร้าง FormData ใหม่
          const alternativeFormData = new FormData()
          alternativeFormData.append("restroom_id", reviewData.restroom_id)
          alternativeFormData.append("user_id", reviewData.user_id)
          alternativeFormData.append("rating", reviewData.rating)
          alternativeFormData.append("comment", reviewData.comment)

          // แปลงรูปภาพ base64 กลับเป็นไฟล์ (ถ้าทำได้)
          if (base64Image && base64Image.includes(";base64,")) {
            try {
              const contentType = base64Image.split(";")[0].split(":")[1]
              const byteCharacters = atob(base64Image.split(",")[1])
              const byteArrays = []

              for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i))
              }

              const byteArray = new Uint8Array(byteArrays)
              const blob = new Blob([byteArray], { type: contentType })
              const file = new File([blob], "review_image.jpg", {
                type: contentType
              })

              alternativeFormData.append("photo", file)
            } catch (e) {
              console.error("❌ ไม่สามารถแปลง base64 เป็นไฟล์ได้:", e)
            }
          }

          return fetch(`${API_URL}/review`, {
            method: "POST",
            body: alternativeFormData
          })
            .then((response) => {
              console.log(
                "🔹 สถานะการส่งข้อมูลผ่าน /review:",
                response.status,
                response.statusText
              )
              if (!response.ok) {
                return response.text().then((text) => {
                  throw new Error(
                    `Alternative endpoint failed: ${response.status}. ${text}`
                  )
                })
              }
              return response.json()
            })
            .then((data) => {
              console.log(
                "✅ Review submission via alternative endpoint successful:",
                data
              )
              handleResponse(data)
            })
            .catch((altError) => {
              console.error("❌ Alternative endpoint also failed:", altError)
              // เรียกฟังก์ชันสำหรับจัดการข้อผิดพลาด
              handleError(error) // ใช้ error เดิม เพราะนั่นคือ error หลัก
            })
        })
    } catch (error) {
      console.error("❌ Error preparing review data:", error)
      handleError(error)
    }
  }

  const sendReviewData = (formData) => {
    console.log("🔹 ส่งข้อมูลแบบ FormData")

    fetch(`${API_URL}/review`, {
      method: "POST",
      body: formData
    })
      .then((response) => {
        console.log(
          "🔹 สถานะการส่งข้อมูล:",
          response.status,
          response.statusText
        )
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Server responded with status: ${response.status}. ${text}`
            )
          })
        }
        return response.json()
      })
      .then((data) => {
        console.log("✅ บันทึกความคิดเห็นสำเร็จ:", data)

        // สร้างข้อมูลความคิดเห็นใหม่
        const newComment = {
          username: username,
          text: comment,
          rating: rating,
          date: data.review_date
            ? new Date(data.review_date).toLocaleDateString("th-TH")
            : new Date().toLocaleDateString("th-TH"),
          image: data.photo_url || null
        }

        // อัปเดตข้อมูลความคิดเห็น
        setCommentsByLocation((prevComments) => ({
          ...prevComments,
          [data.name]: [...(prevComments[data.name] || []), newComment]
        }))

        alert("บันทึกความคิดเห็นสำเร็จ!")
        setComment("")
        setRating(0)
        handleClearImage()
        setIsSubmitting(false)
      })
      .catch(handleError)
  }
  // ฟังก์ชันจัดการ response
  const handleResponse = (data) => {
    // ตรวจสอบว่าเป็น Response object หรือไม่
    if (data && typeof data.json === "function") {
      return data.json().then((result) => {
        // ดำเนินการกับข้อมูล result ต่อไป
      })
    } else {
      // ถ้าไม่ใช่ Response object ให้ใช้ข้อมูลนั้นเลย
      console.log("✅ บันทึกความคิดเห็นสำเร็จ:", data)

      // สร้างข้อมูลความคิดเห็นใหม่และแสดงผล
      const newComment = {
        username: username,
        text: comment,
        rating: rating,
        date: data.review_date
          ? new Date(data.review_date).toLocaleDateString("th-TH")
          : new Date().toLocaleDateString("th-TH"),
        image: data.photo_url || null
      }

      // อัปเดตและแสดงข้อมูล
      setCommentsByLocation((prevComments) => ({
        ...prevComments,
        [data.name]: [...(prevComments[data.name] || []), newComment]
      }))

      alert("บันทึกความคิดเห็นสำเร็จ!")
      setComment("")
      setRating(0)
      handleClearImage()
      setIsSubmitting(false)
    }
  }

  // ฟังก์ชันจัดการข้อผิดพลาด
  // แก้ไขใน handleError ใน src/App.js
  const handleError = (error) => {
    console.error("❌ เกิดข้อผิดพลาดในการบันทึกความคิดเห็น:", error)

    // แสดงข้อความแจ้งเตือนที่เฉพาะเจาะจงมากขึ้น
    let errorMessage =
      "เกิดข้อผิดพลาดในการบันทึกความคิดเห็น กรุณาลองใหม่อีกครั้ง"

    if (error.message) {
      if (error.message.includes("undefined")) {
        errorMessage =
          "ไม่สามารถติดต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ"
      } else {
        errorMessage = error.message
      }
    }

    alert(errorMessage)
    setIsSubmitting(false)
  }

  const DriveImage = ({ driveId, index, fallbackUrl }) => {
    const [hasError, setHasError] = useState(false)

    // Format Google Drive URL correctly for image embedding
    const formattedUrl = driveId
      ? `https://lh3.googleusercontent.com/d/${driveId}`
      : fallbackUrl

    return (
      <img
        src={hasError ? fallbackUrl : formattedUrl}
        alt={`Image ${index + 1}`}
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "auto",
          maxHeight: "300px",
          objectFit: "contain",
          borderRadius: "10px",
          border: "1px solid #ddd",
          padding: "5px"
        }}
        onError={(e) => {
          console.log("🚀 ~ DriveImage ~ formattedUrl:", formattedUrl)
          console.error(`❌ Error loading image: ${driveId}`)
          setHasError(true)
        }}
      />
    )
  }

  const extractDriveId = (url) => {
    // Handle full Google Drive links
    if (typeof url === "string" && url.includes("drive.google.com")) {
      const idMatch = url.match(/[\/?]d\/([^\/]+)/)
      if (idMatch && idMatch[1]) return idMatch[1]

      const idParam = url.match(/[?&]id=([^&]+)/)
      if (idParam && idParam[1]) return idParam[1]
    }

    // If already an ID or can't extract
    return url
  }

  return (
    <div
      style={{
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
        padding: "20px"
      }}
    >
      {/* Login Alert Modal */}
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
                cursor: "pointer"
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
              setShowLoginAlert(false)
              setShowLogin(true)
              onClose()
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
              width: "30%"
            }}
          >
            Got it
          </button>
        </div>
      )}

      {/* Close Button */}
      <div
        style={{
          position: "sticky",
          top: "-20px",
          width: "100%",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          zIndex: 1000,
          marginTop: "-20px"
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
            cursor: "pointer"
          }}
        >
          ▼
        </button>
      </div>

      {/* Restroom Details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3 style={{ fontWeight: "bold" }}>{data.name}</h3>
      </div>
      <p>
        <strong>ชั้น:</strong> {data.floor}
      </p>
      <div>
        <strong>Rating:</strong> {data.rating} ⭐
      </div>
      <br />

      {/* Features */}
      <div>
        <strong>Features:</strong>
        <ul>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Women's restroom{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.women ? "✔" : "✘"}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Men's restroom{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.men ? "✔" : "✘"}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Accessible restroom{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.accessible ? "✔" : "✘"}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Bidet{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.bidet ? "✔" : "✘"}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Tissue available{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.tissue ? "✔" : "✘"}
            </span>
          </li>
          <li
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            Free to use{" "}
            <span style={{ marginLeft: "10px" }}>
              {features.free ? "✔" : "✘"}
            </span>
          </li>
        </ul>
      </div>
      <br />

      {/* Opening Hours */}
      <div>
        <strong>Opening Hours:</strong>
        <ul>
          {Object.keys(hours).map((day) => (
            <li
              key={day}
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <span>{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
              <span style={{ marginLeft: "10px" }}>{hours[day]}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Images */}
      <div style={{ marginTop: "20px" }}>
        <strong>Images:</strong>
        {Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? (
          <Slider {...settings}>
            {data.imageUrls.map((image, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <DriveImage
                  driveId={extractDriveId(image)}
                  index={index}
                  fallbackUrl={NO_IMAGE_URL}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <p>No images available.</p>
        )}
      </div>

      {/* Rating Section */}
      <div style={{ marginTop: "20px" }}>
        <strong>Rating</strong>
        <div style={{ display: "flex", fontSize: "24px", cursor: "pointer" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRatingClick(star)}
              style={{
                color: star <= rating ? "#FFD700" : "#ccc",
                marginRight: "5px"
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Comment Text Area */}
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
          border: "1px solid #ccc"
        }}
      />

      {/* Image Upload Section - NEW */}
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px"
          }}
        >
          <button
            onClick={handleImageButtonClick}
            style={{
              padding: "8px 15px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            📷 เพิ่มรูปภาพ
          </button>

          {imagePreview && (
            <button
              onClick={handleClearImage}
              style={{
                padding: "8px 15px",
                backgroundColor: "#fff0f0",
                color: "#d9534f",
                border: "1px solid #d9534f",
                borderRadius: "5px"
              }}
            >
              ❌ ยกเลิก
            </button>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div style={{ marginTop: "10px", position: "relative" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: "5px",
                border: "1px solid #ddd"
              }}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCommentSubmit}
        disabled={isSubmitting}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: isSubmitting ? "#a0c1b0" : "#006642",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
          cursor: isSubmitting ? "wait" : "pointer"
        }}
      >
        {isSubmitting ? "กำลังบันทึก..." : "Submit"}
      </button>

      {/* Comments Section */}
      <div style={{ marginTop: "20px" }}>
        <strong>Comment</strong>
        {comments.map((c, index) => (
          <div
            key={index}
            style={{
              marginTop: "10px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "5px"
            }}
          >
            <strong>{c.username}</strong>
            <div style={{ color: "#FFD700", fontSize: "16px" }}>
              {"★".repeat(c.rating) + "☆".repeat(5 - c.rating)}
            </div>
            <p>{c.text}</p>

            {/* รูปภาพของความคิดเห็น - NEW */}
            {c.image && (
              <div style={{ marginTop: "5px", marginBottom: "5px" }}>
                <img
                  src={c.image}
                  alt="Comment image"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    // สามารถเพิ่มฟังก์ชันเปิดรูปภาพแบบเต็มจอได้ตรงนี้
                    window.open(c.image, "_blank")
                  }}
                />
              </div>
            )}

            <span style={{ fontSize: "12px", color: "gray" }}>{c.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyReviewsPage({ onClose, username, commentsByLocation }) {
  const [userReviews, setUserReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch user's reviews from the API
  useEffect(() => {
    const fetchUserReviews = async () => {
      setIsLoading(true)
      try {
        // Get user ID from localStorage
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          setUserReviews([])
          setIsLoading(false)
          return
        }

        const user = JSON.parse(storedUser)
        const userId = user.user_id

        // Fetch user's reviews from API
        const response = await fetch(`${API_URL}/reviews/user/${userId}`)
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const reviewData = await response.json()
        console.log("🔹 ดึงข้อมูลรีวิวของผู้ใช้สำเร็จ:", reviewData)

        // Format the reviews for display
        const formattedReviews = reviewData.map((item) => ({
          id: item.review_id,
          location: item.building_name,
          floor: item.floor || "ไม่ระบุ",
          rating: item.rating,
          comment: item.comment,
          date: item.review_date
            ? formatDate(item.review_date)
            : item.created_at
              ? formatDate(item.created_at)
              : "ไม่ระบุวันที่",
          // เก็บวันที่ดิบไว้ใช้สำหรับการเรียงลำดับ
          rawDate: item.review_date || item.created_at || new Date(0),
          imageUrl: item.photo_url || null
        }));

        // เรียงลำดับรีวิวจากวันที่ล่าสุดไปยังเก่าสุด
        formattedReviews.sort((a, b) => {
          // แปลงเป็น Date object เพื่อเปรียบเทียบ
          const dateA = new Date(a.rawDate);
          const dateB = new Date(b.rawDate);
          return dateB - dateA; // เรียงจากใหม่ไปเก่า (ล่าสุดอยู่บนสุด)
        });

        setUserReviews(formattedReviews);
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว:", error)

        // Fallback: Filter reviews from existing commentsByLocation data
        console.log("🔶 ใช้ข้อมูลสำรองจาก commentsByLocation");
        const allUserReviews = [];

        Object.entries(commentsByLocation).forEach(([location, comments]) => {
          comments.forEach((comment) => {
            if (comment.username === username) {
              // แยกแปลงวันที่ไทยเป็น Date object
              let rawDate;
              try {
                // พยายามแปลงวันที่ในรูปแบบไทย (วัน/เดือน/ปี) เป็น Date object
                const parts = comment.date.split('/');
                if (parts.length === 3) {
                  // format: dd/mm/yyyy (ปีไทย)
                  rawDate = new Date(parseInt(parts[2]) - 543, parseInt(parts[1]) - 1, parseInt(parts[0]));
                } else {
                  rawDate = new Date(); // ถ้าแปลงไม่ได้ ใช้วันที่ปัจจุบัน
                }
              } catch (e) {
                rawDate = new Date(); // กรณีมีข้อผิดพลาด
              }

              allUserReviews.push({
                location: location,
                floor: "ไม่ระบุ",
                rating: comment.rating,
                comment: comment.text,
                date: comment.date,
                rawDate: rawDate, // เก็บ Date object ไว้สำหรับเรียงลำดับ
                imageUrl: comment.image || null
              });
            }
          });
        });

        // เรียงลำดับรีวิวจากวันที่ล่าสุดไปเก่าสุด
        allUserReviews.sort((a, b) => b.rawDate - a.rawDate);

        setUserReviews(allUserReviews);
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserReviews()
  }, [username, commentsByLocation])

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        width: "100%",
        height: "calc(100vh - 60px)",
        backgroundColor: "white",
        zIndex: 1001,
        padding: "20px",
        overflowY: "auto"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            margin: 0
          }}
        >
          รีวิวของฉัน
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : userReviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#666"
          }}
        >
          <p>คุณยังไม่มีรีวิว</p>
          <p>เมื่อคุณรีวิวห้องน้ำ รายการจะแสดงที่นี่</p>
        </div>
      ) : (
        <div>
          {userReviews.map((review, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#f9f9f9"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px"
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: 0
                  }}
                >
                  {review.location}
                </h3>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666"
                  }}
                >
                  {review.date}
                </span>
              </div>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "14px",
                  color: "#666"
                }}
              >
                ชั้น: {review.floor}
              </p>

              <div
                style={{
                  color: "#FFD700",
                  fontSize: "16px",
                  margin: "8px 0"
                }}
              >
                {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
              </div>

              <p
                style={{
                  margin: "10px 0",
                  fontSize: "16px"
                }}
              >
                {review.comment}
              </p>

              {review.imageUrl && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={review.imageUrl}
                    alt="รูปภาพรีวิว"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                      objectFit: "contain"
                    }}
                    onClick={() => window.open(review.imageUrl, "_blank")}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserProfile({
  username,
  handleLogout,
  setShowUserProfile,
  mapRef,
  userPosition,
  commentsByLocation
}) {
  console.log("🔹 DEBUG - UserProfile component rendered")
  const [showMyReviews, setShowMyReviews] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayName, setDisplayName] = useState(username || "")

  useEffect(() => {
    // ตรวจสอบข้อมูลจาก props ก่อน
    if (username) {
      setDisplayName(username)
      return
    }

    // ถ้าไม่มี username จาก props ให้ลองดึงจาก localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const fullName = `${parsedUser.first_name || ""} ${parsedUser.last_name || ""
          }`.trim()
        if (fullName) {
          setDisplayName(fullName)
          console.log("🔹 ดึงชื่อผู้ใช้จาก localStorage สำเร็จ:", fullName)
        }
      } catch (error) {
        console.error("❌ ข้อผิดพลาดในการดึงชื่อผู้ใช้:", error)
      }
    }
  }, [username])

  // Check if current user is admin
  useEffect(() => {
    const checkIfAdmin = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          // Check if user has admin email
          if (user.email === "admkutoilet@gmail.com") {
            setIsAdmin(true)
            console.log("🔹 Admin user detected")
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error("❌ Error checking admin status:", error)
          setIsAdmin(false)
        }
      }
    }

    checkIfAdmin()
  }, [])

  // Function to handle "Find a toilet" button click
  const handleFindToiletClick = () => {
    console.log("🔹 Find a toilet button clicked")
    // Close the profile view
    setShowUserProfile(false)

    // Center the map on the KU campus area with a good zoom level to show markers
    if (mapRef && mapRef.current) {
      const map = mapRef.current
      // Center on KU campus with appropriate zoom level
      map.setView([13.84599, 100.571218], 15, { animate: true })
      console.log("🔹 Map centered on KU campus")
    } else {
      console.warn("❌ Map reference not available")
    }
  }

  // Function to handle "Near Me" button click
  const handleNearMeClick = () => {
    console.log("🔹 Near Me button clicked")
    // Close the profile view
    setShowUserProfile(false)

    // Center the map on the user's current position
    if (mapRef && mapRef.current && userPosition) {
      const map = mapRef.current
      // Center on user's position with high zoom level (18)
      map.setView(userPosition, 18, { animate: true })
      map.invalidateSize() // Fix map rendering issues
      console.log("🔹 Map centered on user's position:", userPosition)
    } else {
      // If position is not available, show alert
      alert("ไม่พบตำแหน่งของคุณ กรุณาอนุญาตการเข้าถึงตำแหน่ง")
      console.warn("❌ User position not available")
    }
  }

  // Function to handle "My review" button click
  const handleMyReviewClick = () => {
    console.log("🔹 My review button clicked")
    setShowMyReviews(true)
  }

  // Function to handle "Admin Panel" button click
  const handleAdminPanelClick = () => {
    console.log("🔹 Admin panel button clicked")
    setShowAdminPanel(true)
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          width: "100%",
          backgroundColor: "white",
          padding: "20px",
          textAlign: "center",
          zIndex: 1001,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "0 0 10px 10px",
          height: "calc(100vh - 60px)",
          overflowY: "auto"
        }}
      >
        <h1 style={{ fontSize: "30px", fontWeight: "bold", marginTop: "30px" }}>
          Hello, {displayName || "Guest"}
        </h1>
        <p style={{ fontSize: "16px", color: "#555", marginTop: "10px" }}>
          Have a nice day :)
        </p>

        {/* Admin badge for admin users */}
        {isAdmin && (
          <div
            style={{
              backgroundColor: "#006642",
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              display: "inline-block",
              marginTop: "10px",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Admin
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center",
            marginTop: "40px"
          }}
        >
          {/* Find a toilet button */}
          <button
            onClick={handleFindToiletClick}
            style={profileButtonStyle}
          >
            Find a toilet
          </button>

          {/* Near Me button with click handler */}
          <button
            onClick={handleNearMeClick}
            style={profileButtonStyle}
          >
            Near Me
          </button>

          {/* My review button with click handler */}
          <button
            onClick={handleMyReviewClick}
            style={profileButtonStyle}
          >
            My Reviews
          </button>

          {/* Admin Panel button - only visible for admin users */}
          {isAdmin && (
            <button
              onClick={handleAdminPanelClick}
              style={{
                ...profileButtonStyle,
                backgroundColor: "#006642",
                color: "white",
                border: "none"
              }}
            >
              Admin Panel
            </button>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            fontWeight: "bold",
            padding: "15px 40px",
            backgroundColor: "#006642",
            color: "#fff",
            border: "none",
            borderRadius: "25px",
            width: "80%",
            marginTop: "40px"
          }}
        >
          Logout
        </button>
      </div>

      {/* My Reviews Page */}
      {showMyReviews && (
        <MyReviewsPage
          onClose={() => setShowMyReviews(false)}
          username={username}
          commentsByLocation={commentsByLocation}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </>
  )
}

function AdminPanel({ onClose }) {
  const [allReviews, setAllReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [locations, setLocations] = useState([])
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  // ฟังก์ชันช่วยในการแปลงวันที่จากฐานข้อมูลให้แสดงผลถูกต้อง

  // Fetch all reviews when component mounts
  useEffect(() => {
    console.log("🔹 กำลังโหลดข้อมูลแอดมิน...")
    fetchAllReviews()
  }, [])

  const fetchAllReviews = async () => {
    setIsLoading(true)
    try {
      // ดึงข้อมูลผู้ใช้จาก localStorage
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        setAllReviews([])
        setIsLoading(false)
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้")
        return
      }

      const user = JSON.parse(storedUser)

      // ตรวจสอบว่าผู้ใช้มีสิทธิแอดมินหรือไม่ (จากอีเมล)
      if (user.email !== "admkutoilet@gmail.com") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้")
        setIsLoading(false)
        return
      }

      // ส่งอีเมลไปด้วยใน query params เพื่อยืนยันตัวตน
      const response = await fetch(
        `${API_URL}/admin/reviews?email=${encodeURIComponent(user.email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": user.email // เพิ่ม header นี้เพื่อความมั่นใจ
          }
        }
      )

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("🔹 ดึงข้อมูลรีวิวทั้งหมดสำเร็จ:", data)

      // Extract unique locations
      const uniqueLocations = [
        ...new Set(data.map((item) => item.building_name))
      ]
      setLocations(["all", ...uniqueLocations])

      // Format reviews for display
      const formattedReviews = data.map((item) => ({
        id: item.review_id,
        userId: item.user_id,
        userName: `${item.first_name} ${item.last_name}`,
        userEmail: item.email,
        location: item.building_name,
        floor: item.floor || "ไม่ระบุ",
        rating: item.rating,
        comment: item.comment,
        date: item.review_date
          ? formatDate(item.review_date)
          : item.created_at
            ? formatDate(item.created_at)
            : "ไม่ระบุวันที่",
        imageUrl: item.photo_url || null
      }))

      setAllReviews(formattedReviews)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว:", error)
      alert(`ไม่สามารถดึงข้อมูลรีวิวได้: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter reviews based on search term and selected location
  const filteredReviews = allReviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(filter.toLowerCase()) ||
      review.userName.toLowerCase().includes(filter.toLowerCase()) ||
      review.userEmail.toLowerCase().includes(filter.toLowerCase()) ||
      review.location.toLowerCase().includes(filter.toLowerCase())

    const matchesLocation =
      selectedLocation === "all" || review.location === selectedLocation

    return matchesSearch && matchesLocation
  })

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId)

    try {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้")
        setDeleteConfirmation(null)
        return
      }

      const user = JSON.parse(storedUser)

      // ส่งอีเมลไปทั้งใน URL และ Header
      const response = await fetch(
        `${API_URL}/admin/reviews/${reviewId}?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": user.email
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      // Remove the deleted review from the state
      setAllReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      )
      alert("ลบรีวิวสำเร็จ")
      setDeleteConfirmation(null)
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการลบรีวิว:", error)
      alert("ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setDeletingReviewId(null)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        width: "100%",
        height: "calc(100vh - 60px)",
        backgroundColor: "white",
        zIndex: 1001,
        padding: "20px",
        overflowY: "auto"
      }}
    >
      {/* Header with title and close button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            margin: 0,
            color: "#006642"
          }}
        >
          แผงควบคุมผู้ดูแลระบบ
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          gap: "10px",
          flexWrap: "wrap"
        }}
      >
        <input
          type="text"
          placeholder="ค้นหารีวิว..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            flex: "1",
            minWidth: "200px"
          }}
        />

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            minWidth: "150px"
          }}
        >
          {locations.map((location, index) => (
            <option
              key={index}
              value={location}
            >
              {location === "all" ? "ทุกสถานที่" : location}
            </option>
          ))}
        </select>

        <button
          onClick={fetchAllReviews}
          style={{
            padding: "10px",
            backgroundColor: "#006642",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          รีเฟรช
        </button>
      </div>

      {/* Status Information */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          จำนวนรีวิวทั้งหมด: {allReviews.length} | กำลังแสดง:{" "}
          {filteredReviews.length}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#666"
          }}
        >
          <p>ไม่พบรีวิวที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div>
          {/* Reviews List */}
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              style={{
                marginBottom: "20px",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#f9f9f9",
                position: "relative"
              }}
            >
              {/* Delete Button */}
              <button
                onClick={() => setDeleteConfirmation(review.id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: "#d9534f",
                  cursor: "pointer",
                  fontSize: "20px"
                }}
                title="ลบรีวิวนี้"
              >
                🗑️
              </button>

              {/* User Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      margin: 0
                    }}
                  >
                    {review.userName}
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "14px",
                      color: "#666"
                    }}
                  >
                    {review.userEmail}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginRight: "30px"
                  }}
                >
                  {review.date}
                </span>
              </div>

              {/* Location Info */}
              <div
                style={{
                  backgroundColor: "#e8f4ea",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  display: "inline-block",
                  margin: "10px 0"
                }}
              >
                <strong>{review.location}</strong>
                <span> | ชั้น: {review.floor}</span>
              </div>

              {/* Rating */}
              <div
                style={{
                  color: "#FFD700",
                  fontSize: "16px",
                  margin: "8px 0"
                }}
              >
                {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
              </div>

              {/* Comment */}
              <p
                style={{
                  margin: "10px 0",
                  fontSize: "16px",
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #eee"
                }}
              >
                {review.comment}
              </p>

              {/* Review Image */}
              {review.imageUrl && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={review.imageUrl}
                    alt="รูปภาพรีวิว"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      border: "1px solid #ddd"
                    }}
                    onClick={() => window.open(review.imageUrl, "_blank")}
                  />
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmation === review.id && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px",
                    zIndex: 2
                  }}
                >
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      textAlign: "center",
                      margin: "10px 0"
                    }}
                  >
                    ยืนยันการลบรีวิวนี้?
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px"
                    }}
                  >
                    <button
                      onClick={() => setDeleteConfirmation(null)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#f0f0f0",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                      disabled={deletingReviewId === review.id}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#d9534f",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                      disabled={deletingReviewId === review.id}
                    >
                      {deletingReviewId === review.id ? "กำลังลบ..." : "ลบ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [commentsByLocation, setCommentsByLocation] = useState({})
  const [userPosition, setUserPosition] = useState(null)
  const [searchText, setSearchText] = useState("")
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [filteredRestrooms, setFilteredRestrooms] = useState([])
  const [restrooms, setRestrooms] = useState([])
  const mapRef = useRef(null)

  const [filters, setFilters] = useState({
    women: false,
    men: false,
    accessible: false,
    bidet: false,
    tissue: false,
    free: false
  })

  const applyFilters = () => {
    const filtered = restrooms.filter((restroom) => {
      const matchesSearch =
        !searchText ||
        restroom.name.toLowerCase().includes(searchText.toLowerCase())

      return (
        matchesSearch &&
        (!filters.women || restroom.features.women) &&
        (!filters.men || restroom.features.men) &&
        (!filters.accessible || restroom.features.accessible) &&
        (!filters.bidet || restroom.features.bidet) &&
        (!filters.tissue || restroom.features.tissue) &&
        (!filters.free || restroom.features.free)
      )
    })

    console.log("🔹 Filtered Restrooms:", filtered)
    setFilteredRestrooms(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [searchText, filters, restrooms])

  useEffect(() => {
    setFilteredRestrooms(restrooms) // ✅ ตั้งค่าข้อมูลที่ถูกกรองให้เป็นข้อมูลทั้งหมดก่อน
  }, [restrooms])

  const NO_IMAGE_URL = require("./img/logo.png")

  const MapController = () => {
    const map = useMap()

    // Store the map reference when the component mounts
    useEffect(() => {
      mapRef.current = map
      console.log("🔹 Map reference saved")
    }, [map])

    return null
  }

  const convertGoogleDriveThumbnail = (url) => {
    if (!url || typeof url !== "string") {
      console.warn("❌ Invalid URL provided:", url)
      return NO_IMAGE_URL
    }

    const googleDriveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//)
    if (googleDriveMatch) {
      return `https://drive.google.com/thumbnail?id=${googleDriveMatch[1]}&sz=w1000`
    }

    return url
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0

    let totalRating = 0
    let count = 0

    reviews.forEach((review) => {
      if (review.review && typeof review.review.rating === "number") {
        totalRating += review.review.rating
        count++
      }
    })

    return count > 0 ? (totalRating / count).toFixed(1) : 0
  }

  // ✅ โหลดข้อมูลจาก Backend เมื่อ Component โหลด
  useEffect(() => {
    console.log("🔹 กำลังโหลดข้อมูลห้องน้ำจาก API...")

    fetch(`${API_URL}/restrooms/details`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log("✅ โหลดข้อมูลห้องน้ำสำเร็จ:", data)

        const transformedData = data.map((item) => {
          // สร้าง object สำหรับเก็บความคิดเห็นพร้อมรูปภาพ
          const processedReviews = {}

          // แปลงข้อมูลความคิดเห็นให้มีรูปแบบที่ต้องการ
          if (item.reviews && Array.isArray(item.reviews)) {
            item.reviews.forEach((review) => {
              // ถ้ามีรูปภาพประกอบ ให้แนบไปด้วย
              let reviewImage = null

              // ตรวจสอบว่า review มี photos หรือไม่
              if (
                review.photos &&
                Array.isArray(review.photos) &&
                review.photos.length > 0
              ) {
                // ใช้ URL รูปภาพแรก
                reviewImage = convertGoogleDriveThumbnail(
                  review.photos[0].base64
                )
              }

              // สร้างข้อมูลความคิดเห็นในรูปแบบที่แอพต้องการ
              const formattedReview = {
                username:
                  review.review.first_name + " " + review.review.last_name,
                text: review.review.comment,
                rating: review.review.rating,
                date: review.review.review_date
                  ? new Date(review.review.review_date).toLocaleDateString("th-TH")
                  : new Date().toLocaleDateString("th-TH"),
                image: reviewImage
              }

              // เพิ่มความคิดเห็นเข้าไปในคอลเลกชันของห้องน้ำนี้
              if (!processedReviews[item.restroom.building_name]) {
                processedReviews[item.restroom.building_name] = []
              }
              processedReviews[item.restroom.building_name].push(
                formattedReview
              )
            })
          }

          // เพิ่มข้อมูลความคิดเห็นเข้าไปในแอพ
          if (Object.keys(processedReviews).length > 0) {
            setCommentsByLocation((prev) => ({
              ...prev,
              ...processedReviews
            }))
          }

          // สร้างข้อมูลห้องน้ำในรูปแบบที่แอพต้องการ
          return {
            id: item.restroom.restroom_id, // เพิ่ม ID เพื่อใช้ในการบันทึกความคิดเห็น
            geocode: [
              parseFloat(item.restroom.latitude),
              parseFloat(item.restroom.longitude)
            ],
            name: item.restroom.building_name,
            floor: item.restroom.floor,
            rating: calculateAverageRating(item.reviews), // คำนวณคะแนนเฉลี่ย
            features: {
              women: item.restroom.is_women,
              men: item.restroom.is_men,
              accessible: item.restroom.is_accessible,
              bidet: item.restroom.is_bum_gun,
              tissue: item.restroom.is_toilet_paper,
              free: item.restroom.is_free
            },
            hours: {
              monday: item.restroom.opening_hours_monday || "ไม่ระบุ",
              tuesday: item.restroom.opening_hours_tuesday || "ไม่ระบุ",
              wednesday: item.restroom.opening_hours_wednesday || "ไม่ระบุ",
              thursday: item.restroom.opening_hours_thursday || "ไม่ระบุ",
              friday: item.restroom.opening_hours_friday || "ไม่ระบุ",
              saturday: item.restroom.opening_hours_saturday || "ไม่ระบุ",
              sunday: item.restroom.opening_hours_sunday || "ไม่ระบุ"
            },
            imageUrls: (item.restroom_photos || []).map((photo) =>
              convertGoogleDriveThumbnail(photo.base64)
            )
          }
        })

        setRestrooms(transformedData)
      })
      .catch((err) => console.error("❌ Error fetching restrooms:", err))
  }, [])

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // สร้างชื่อผู้ใช้จากชื่อและนามสกุล (ตรวจสอบค่าว่างด้วย)
          const firstName = parsedUser.first_name || ""
          const lastName = parsedUser.last_name || ""
          const fullName = `${firstName} ${lastName}`.trim()

          if (fullName) {
            setUsername(fullName)
            console.log("✅ พบข้อมูลผู้ใช้: ", fullName)
          } else {
            // ถ้าไม่มีชื่อ ให้ใช้อีเมลแทน
            setUsername(parsedUser.email || "Guest")
          }

          setLoggedIn(true)
        } catch (error) {
          console.error("❌ เกิดข้อผิดพลาดในการแปลงข้อมูลผู้ใช้:", error)
          localStorage.removeItem("user")
          setLoggedIn(false)
          setUser(null)
          setUsername("")
        }
      } else {
        console.log("⚠️ ไม่พบข้อมูลผู้ใช้ใน localStorage")
        setLoggedIn(false)
        setUser(null)
        setUsername("")
      }
    }

    loadUserData()
  }, [])

  const handleProfileClick = () => {
    console.log("🔹 กำลังคลิกที่ไอคอนโปรไฟล์")

    // 1. ถ้ากำลังแสดงหน้า Profile ให้ปิดเท่านั้น
    if (showUserProfile) {
      console.log("🔹 กำลังปิดหน้าโปรไฟล์")
      setShowUserProfile(false)
      return
    }

    // 2. ถ้ากำลังแสดงหน้า Login ให้ปิดเท่านั้น
    if (showLogin) {
      console.log("🔹 กำลังปิดหน้าล็อกอิน")
      setShowLogin(false)
      return
    }

    // 3. ตรวจสอบสถานะการล็อกอิน
    if (loggedIn) {
      // ถ้าล็อกอินแล้ว ให้เปิดหน้าโปรไฟล์
      console.log("🔹 ผู้ใช้ล็อกอินแล้ว เปิดหน้าโปรไฟล์")
      setShowUserProfile(true)
    } else {
      // ถ้ายังไม่ได้ล็อกอิน ให้เปิดหน้าล็อกอิน
      console.log("🔹 ผู้ใช้ยังไม่ได้ล็อกอิน เปิดหน้าล็อกอิน")
      setShowLogin(true)
    }
  }

  const handleFilterClick = () => {
    setShowFilter((prev) => !prev)
  }

  const handleRegisterClick = () => {
    setShowSignUp(true)
    setShowLogin(false)
  }

  const handleLoginClick = () => {
    setShowSignUp(false)
    setShowLogin(true)
  }

  const handleLogin = (usernameInput) => {
    console.log("🔹 User logged in:", usernameInput)
    setUsername(usernameInput)
    setLoggedIn(true)
    setShowLogin(false)
    setShowUserProfile(true) // เพิ่มบรรทัดนี้เพื่อแสดงโปรไฟล์หลังล็อกอินทันที
  }

  const handleLogout = () => {
    console.log("🔹 กำลังออกจากระบบ")

    // ลบข้อมูลผู้ใช้และรีเซ็ตสถานะ
    localStorage.removeItem("user")
    setUser(null)
    setLoggedIn(false)

    // ปิดหน้าโปรไฟล์
    setShowUserProfile(false)

    // เปิดหน้าล็อกอินทันที
    setTimeout(() => {
      setShowLogin(true)
    }, 100) // ใช้ setTimeout เพื่อให้การเปลี่ยนสถานะมีเวลาอัปเดตก่อน
  }

  return (
    <GoogleOAuthProvider clientId="577202715001-pa9pfkmbm44haiocpbpg4ran1rn4f824.apps.googleusercontent.com">
      <div>
        <HeaderBar
          onFilterClick={() => setShowFilter(!showFilter)}
          onProfileClick={handleProfileClick}
          onSearchChange={(text) => {
            setSearchText(text)
            applyFilters()
          }}
          isLoggedIn={loggedIn}
        />

        {showUserProfile && (
          <UserProfile
            username={username}
            mapRef={mapRef}
            userPosition={userPosition}
            commentsByLocation={commentsByLocation}
            setShowUserProfile={setShowUserProfile}
            handleLogout={() => {
              console.log("🔹 กำลังออกจากระบบจากหน้าโปรไฟล์")
              localStorage.removeItem("user")
              setUser(null)
              setLoggedIn(false)
              setShowUserProfile(false)

              // เปิดหน้าล็อกอินทันที
              setTimeout(() => {
                setShowLogin(true)
              }, 100)
            }}
          />
        )}

        {showLogin && (
          <LoginPage
            onClose={() => setShowLogin(false)}
            onRegisterClick={handleRegisterClick}
            onLogin={handleLogin}
          />
        )}

        {showSignUp && (
          <SignUpPage
            onClose={() => setShowSignUp(false)}
            onLoginClick={() => {
              setShowSignUp(false)
              setShowLogin(true)
            }}
          />
        )}

        <MapContainer
          style={{
            width: "100%",
            height: "100vh",
            marginTop: "60px",
            position: "relative"
          }}
          center={[13.84599, 100.571218]}
          zoom={13}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GPSMarker setUserPosition={setUserPosition} />
          <MarkerClusterGroup>
            {filteredRestrooms.map((marker, index) => (
              <Marker
                key={index}
                position={marker.geocode}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedMarker(marker)
                }}
              >
                <Popup>
                  <h3>{marker.name}</h3>
                  <p>ชั้น: {marker.floor}</p>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          {/* MapController to get reference to the map */}
          <MapController />

          <div
            style={{
              position: "absolute",
              bottom: "60px",
              right: "20px",
              zIndex: 1000
            }}
          >
            <ReCenterButton position={userPosition} />
          </div>
        </MapContainer>
        {selectedMarker && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)"
            }}
          >
            <button
              onClick={() => setSelectedMarker(null)}
              style={{ float: "right" }}
            >
              ✖
            </button>
            <h3>{selectedMarker.name}</h3>
            <p>ชั้น: {selectedMarker.floor}</p>
            <strong>สิ่งอำนวยความสะดวก:</strong>
            <ul>
              <li>ห้องน้ำหญิง: {selectedMarker.features.women ? "✔" : "✘"}</li>
              <li>ห้องน้ำชาย: {selectedMarker.features.men ? "✔" : "✘"}</li>
              <li>
                รองรับผู้พิการ: {selectedMarker.features.accessible ? "✔" : "✘"}
              </li>
              <li>สายฉีด: {selectedMarker.features.bidet ? "✔" : "✘"}</li>
              <li>กระดาษชำระ: {selectedMarker.features.tissue ? "✔" : "✘"}</li>
              <li>ฟรี: {selectedMarker.features.free ? "✔" : "✘"}</li>
            </ul>
            <strong>เวลาทำการ:</strong>
            <ul>
              <li>จันทร์: {selectedMarker.hours.monday}</li>
              <li>อังคาร: {selectedMarker.hours.tuesday}</li>
              <li>พุธ: {selectedMarker.hours.wednesday}</li>
              <li>พฤหัส: {selectedMarker.hours.thursday}</li>
              <li>ศุกร์: {selectedMarker.hours.friday}</li>
              <li>เสาร์: {selectedMarker.hours.saturday}</li>
              <li>อาทิตย์: {selectedMarker.hours.sunday}</li>
            </ul>
            {selectedMarker.imageUrls.length > 0 && (
              <img
                src={selectedMarker.imageUrls[0]}
                alt="Toilet"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  marginTop: "10px"
                }}
              />
            )}
          </div>
        )}

        {showFilter && (
          <FilterPanel
            onClose={() => setShowFilter(false)}
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
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
    </GoogleOAuthProvider>
  )
}

const profileButtonStyle = {
  fontWeight: "bold",
  padding: "15px 40px",
  backgroundColor: "#fff",
  color: "#006642",
  border: "2px solid #006642",
  borderRadius: "25px",
  width: "80%",
  cursor: "pointer"
}

export default App
