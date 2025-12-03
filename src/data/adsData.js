// Unified ad inventory across sections
const AdsData = {
  "Downtown Billboard": [
    { id: "db-201", location: "Downtown Main Road, Near Mall", size: "20x10", price: 15000, available: true, image: "/billboards/downtown-1.jpg", expiryDate: "2025-12-31" },
    { id: "db-202", location: "City Center Circle", size: "40x20", price: 28000, available: false, image: "/billboards/downtown-2.jpg", expiryDate: "2025-11-15" },
    { id: "db-203", location: "Old Market Street", size: "10x10", price: 9000, available: true, image: "/billboards/downtown-3.jpg", expiryDate: "2026-01-10" }
  ],
  "Highway Display": [
    { id: "hw-301", location: "NH4 Near Toll Plaza", size: "40x20", price: 25000, available: true, image: "/billboards/highway-1.jpg", expiryDate: "2025-12-20" },
    { id: "hw-302", location: "Expressway Exit 12", size: "20x10", price: 18000, available: true, image: "/billboards/highway-2.jpg", expiryDate: "2025-12-05" },
    { id: "hw-303", location: "Bypass Bridge", size: "10x10", price: 8000, available: false, image: "/billboards/highway-3.jpg", expiryDate: "2025-11-30" }
  ],
  "Shopping Mall Board": [
    { id: "sm-401", location: "City Mall Entrance", size: "20x10", price: 22000, available: true, image: "/billboards/mall-1.jpg", expiryDate: "2025-12-10" },
    { id: "sm-402", location: "Food Court Lobby", size: "10x10", price: 12000, available: false, image: "/billboards/mall-2.jpg", expiryDate: "2025-11-18" },
    { id: "sm-403", location: "Cinema Corridor", size: "20x10", price: 24000, available: true, image: "/billboards/mall-3.jpg", expiryDate: "2026-01-05" }
  ],
  "Event Promotion": [
    { id: "ev-501", location: "Expo Ground Gate A", size: "20x10", price: 16000, available: true, image: "/billboards/event-1.jpg", expiryDate: "2025-12-22" },
    { id: "ev-502", location: "Stadium Outer Ring", size: "40x20", price: 30000, available: false, image: "/billboards/event-2.jpg", expiryDate: "2025-11-25" },
    { id: "ev-503", location: "Convention Center Road", size: "10x10", price: 7000, available: true, image: "/billboards/event-3.jpg", expiryDate: "2026-02-10" }
  ],
  "City Center LED": [
    { id: "led-601", location: "Town Square LED Wall", size: "20x10", price: 35000, available: true, image: "/billboards/led-1.jpg", expiryDate: "2025-12-28" },
    { id: "led-602", location: "Metro Junction LED", size: "10x10", price: 20000, available: true, image: "/billboards/led-2.jpg", expiryDate: "2025-12-08" },
    { id: "led-603", location: "Clock Tower LED", size: "40x20", price: 50000, available: false, image: "/billboards/led-3.jpg", expiryDate: "2025-11-27" }
  ],
  "Corporate Ad Space": [
    { id: "co-701", location: "Tech Park Lobby", size: "10x10", price: 15000, available: true, image: "/billboards/corporate-1.jpg", expiryDate: "2025-12-12" },
    { id: "co-702", location: "Business Bay Entrance", size: "20x10", price: 26000, available: false, image: "/billboards/corporate-2.jpg", expiryDate: "2025-11-19" },
    { id: "co-703", location: "Finance District Skywalk", size: "40x20", price: 42000, available: true, image: "/billboards/corporate-3.jpg", expiryDate: "2026-01-12" }
  ]
};

export const SIZES = ["All", "10x10", "20x10", "40x20"];
export const CATEGORIES = Object.keys(AdsData);
export default AdsData;
