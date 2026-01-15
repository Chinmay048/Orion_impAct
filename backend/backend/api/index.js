require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- 1. REALISTIC ROUTE DATABASE (Scaled for Demo) ---
// Distances are relative. Time is in Milliseconds for the demo.
// 1000ms = 1 second. 
const ROUTE_MATRIX = {
    "Mumbai HQ": {
        "Delhi Hub": 60000,      // 1 min (Long)
        "Pune Factory": 15000,   // 15 sec (Short - they are close)
        "Chennai Port": 90000,   // 1.5 min
        "Kolkata Yard": 120000   // 2 min
    },
    "Chennai Port": {
        "Pune Factory": 45000,   // 45 sec (Medium)
        "Delhi Hub": 100000,     // 1 min 40s
        "Mumbai HQ": 50000       // 50 sec
    },
    "Global Supplier": {
        "Chennai Port": 120000,  // 2 min (Sea Freight)
        "Mumbai HQ": 110000,
        "Delhi Hub": 150000
    }
};

const DEFAULT_DURATION = 30000; // 30s default

// --- 2. SHARED STATE ---
let MARKETS = [
    { name: "Mumbai HQ", region: "West", stock: 1450, capacity: 5000, dailyUsage: 320 },
    { name: "Delhi Hub", region: "North", stock: 7800, capacity: 8000, dailyUsage: 600 },
    { name: "Chennai Port", region: "South", stock: 210, capacity: 4000, dailyUsage: 400 },
    { name: "Kolkata Yard", region: "East", stock: 5600, capacity: 7000, dailyUsage: 450 },
    { name: "Pune Factory", region: "West", stock: 890, capacity: 3000, dailyUsage: 200 }
];

let COMMODITIES = [
    { name: "Industrial Steel", basePrice: 450, yield: 0.95 }, 
    { name: "Lithium Ion", basePrice: 1200, yield: 0.88 },
    { name: "Microchips", basePrice: 8500, yield: 0.99 }, 
    { name: "Copper Wire", basePrice: 720, yield: 0.92 },
    { name: "Polymer Resin", basePrice: 180, yield: 0.85 }, 
    { name: "Titanium Alloy", basePrice: 3100, yield: 0.97 }
];

// Pre-load shipments with realistic routes
let SHIPMENTS = [
    { 
        id: "SHP-TASL-09", 
        origin: "Chennai Port", 
        dest: "Pune Factory", 
        status: "In Transit", 
        progress: 60, 
        eta: "00:45", 
        vehicle: "Tata Prima 5530.S", 
        cargo: "Titanium Alloy", 
        quantity: 500, 
        startTime: Date.now() - 30000, 
        arrivalTime: Date.now() + 45000, 
        carbon: 18.5,
        velocity: "68 km/h"
    }
];

// --- ENDPOINTS ---

app.get('/api/markets', (req, res) => res.json(MARKETS.map(m => ({ ...m, status: m.stock/m.capacity < 0.3 ? "CRITICAL" : "ADEQUATE" }))));
app.get('/api/commodities', (req, res) => res.json(COMMODITIES));
app.get('/api/logistics', (req, res) => res.json(SHIPMENTS));

// SMART ORDERING ENGINE
app.post('/api/order/place', (req, res) => {
    const { market, quantity, material } = req.body;
    
    // 1. Determine Origin (Logic: Find a source that isn't the destination)
    // For demo, we usually import from Ports or Global Suppliers
    let origin = "Global Supplier";
    if (market !== "Chennai Port") origin = "Chennai Port";
    if (market === "Chennai Port") origin = "Mumbai HQ";

    // 2. Calculate Duration based on Real-World Distance Logic
    let travelTime = DEFAULT_DURATION;
    if (ROUTE_MATRIX[origin] && ROUTE_MATRIX[origin][market]) {
        travelTime = ROUTE_MATRIX[origin][market];
    } else if (ROUTE_MATRIX["Global Supplier"][market]) {
        origin = "Global Supplier";
        travelTime = ROUTE_MATRIX["Global Supplier"][market];
    }

    const now = Date.now();
    
    const newShipment = {
        id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        origin: origin,
        dest: market,
        status: "In Transit",
        progress: 0,
        vehicle: origin === "Global Supplier" ? "C-130J Hercules" : "Tata Prima 5530.S",
        cargo: material,
        quantity: Number(quantity),
        startTime: now,
        arrivalTime: now + travelTime,
        carbon: (Math.random() * 50 + 10).toFixed(1),
        velocity: origin === "Global Supplier" ? "450 km/h" : "72 km/h"
    };

    SHIPMENTS.unshift(newShipment); 
    res.json({ success: true, shipment: newShipment });
});

app.post('/api/shipment/receive', (req, res) => {
    const { id } = req.body;
    const idx = SHIPMENTS.findIndex(s => s.id === id);
    if (idx > -1) {
        const s = SHIPMENTS[idx];
        const m = MARKETS.find(x => x.name === s.dest);
        if (m) m.stock = Math.min(m.capacity, m.stock + Number(s.quantity));
        
        SHIPMENTS[idx].status = "Delivered";
        SHIPMENTS[idx].progress = 100;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(port, () => console.log(`Backend Active on Port ${port}`));