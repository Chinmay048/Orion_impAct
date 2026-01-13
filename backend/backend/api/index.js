require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[Request Received] ${req.method} ${req.path}`);
    next();
});

const GEN_AI_KEY = "AIzaSyBpkyAgN1y658Gk_iVms-ye7iF2a4Z1TgY"; 
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

// --- SHARED DATA ---
const COMPANY_PROFILE = {
    name: "Tata Advanced Systems", sector: "Industrial Manufacturing", dailyUsage: 500, minStockLevel: 2000, currentStock: 12500,
    productionHistory: [420, 450, 480, 470, 490, 510, 500], trackedMaterials: ["Industrial Steel", "Lithium Ion", "Titanium Alloy"]
};

let MARKETS = [
    { name: "Mumbai HQ", region: "West", stock: 1450, capacity: 5000, status: "SHORTAGE", dailyUsage: 320, production: 280 },
    { name: "Delhi Hub", region: "North", stock: 7800, capacity: 8000, status: "ADEQUATE", dailyUsage: 600, production: 650 },
    { name: "Chennai Port", region: "South", stock: 2100, capacity: 4000, status: "WARNING", dailyUsage: 400, production: 350 },
    { name: "Kolkata Yard", region: "East", stock: 5600, capacity: 7000, status: "ADEQUATE", dailyUsage: 450, production: 500 },
    { name: "Pune Factory", region: "West", stock: 890, capacity: 3000, status: "CRITICAL", dailyUsage: 200, production: 100 }
];

let COMMODITIES = [
    { name: "Industrial Steel", basePrice: 450, volatility: "Low", sentiment: "Stable" }, 
    { name: "Lithium Ion", basePrice: 1200, volatility: "High", sentiment: "Bullish" },
    { name: "Microchips", basePrice: 8500, volatility: "Extreme", sentiment: "Critical" }, 
    { name: "Copper Wire", basePrice: 720, volatility: "Medium", sentiment: "Bearish" },
    { name: "Polymer Resin", basePrice: 180, volatility: "Low", sentiment: "Stable" }, 
    { name: "Titanium Alloy", basePrice: 3100, volatility: "Medium", sentiment: "Bullish" }
];

const GLOBAL_EVENTS = [
    { id: 1, title: "Port Workers Strike in Chennai", type: "Disruption", severity: "High", affected: "Lithium Ion", time: "2h ago" },
    { id: 2, title: "New Semiconductor Fab opening in Gujarat", type: "Opportunity", severity: "Medium", affected: "Microchips", time: "5h ago" },
    { id: 3, title: "Steel Import Tariffs Hiked by 10%", type: "Regulation", severity: "High", affected: "Industrial Steel", time: "1d ago" },
    { id: 4, title: "Monsoon floods delay Copper shipments", type: "Weather", severity: "Medium", affected: "Copper Wire", time: "1d ago" }
];

const SHIPMENTS = [
    { id: "SHP-9001", origin: "Mumbai HQ", dest: "Delhi Hub", status: "In Transit", progress: 65, eta: "4h 20m", vehicle: "EV-Truck X1", carbon: 12.5, carbonSaved: 4.2 },
    { id: "SHP-9002", origin: "Chennai Port", dest: "Pune Factory", status: "Delayed", progress: 30, eta: "14h 10m", vehicle: "Diesel Cargo", carbon: 45.1, carbonSaved: 0 },
    { id: "SHP-9003", origin: "Kolkata Yard", dest: "Mumbai HQ", status: "Customs", progress: 85, eta: "2h 05m", vehicle: "Rail Freight", carbon: 8.2, carbonSaved: 15.3 },
    { id: "SHP-9004", origin: "Delhi Hub", dest: "Pune Factory", status: "Scheduled", progress: 0, eta: "Pending", vehicle: "EV-Fleet", carbon: 0, carbonSaved: 0 }
];

// --- ENDPOINTS ---

app.get('/api/company-stats', (req, res) => {
    const daysLeft = (COMPANY_PROFILE.currentStock / COMPANY_PROFILE.dailyUsage).toFixed(1);
    const liveMaterials = COMMODITIES.filter(c => COMPANY_PROFILE.trackedMaterials.includes(c.name)).map(c => ({
        name: c.name, price: (c.basePrice * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2),
        change: ((Math.random() * 0.04 - 0.02) * 100).toFixed(2), trend: Math.random() > 0.5 ? "up" : "down"
    }));
    res.json({ profile: COMPANY_PROFILE, runway: { days: daysLeft, status: daysLeft < 10 ? "CRITICAL" : "HEALTHY" }, materials: liveMaterials, riskScore: Math.floor(Math.random() * 15) + 10 });
});

app.get('/api/markets', (req, res) => {
    const liveMarkets = MARKETS.map(m => {
        let status = "ADEQUATE";
        const ratio = m.stock / m.capacity;
        if (ratio < 0.3) status = "CRITICAL"; 
        else if (ratio < 0.5) status = "WARNING";
        return { ...m, status };
    });
    res.json(liveMarkets);
});

app.get('/api/commodities', (req, res) => res.json(COMMODITIES));

app.post('/api/inventory/update', (req, res) => {
    const { market, quantity, action } = req.body;
    const m = MARKETS.find(m => m.name === market);
    if (m) {
        if (quantity) {
            const qtyNum = Number(quantity);
            if (action === "ADD") m.stock += qtyNum;
            else m.stock = Math.max(0, m.stock - qtyNum);
        }
        res.json({ success: true, market: m });
    } else res.status(404).json({ success: false });
});

app.post('/api/predict-gemini', async (req, res) => {
    const { commodity, inventory, capacity, demandFactor, supplyFactor, priceTrend } = req.body;
    const safeSupply = Number(supplyFactor) < 0.1 ? 0.1 : Number(supplyFactor);
    const elasticity = (Number(demandFactor) / safeSupply) * Number(priceTrend);
    const safeCapacity = Number(capacity) || 1;
    const fillRate = Number(inventory) / safeCapacity;
    const scarcityRisk = Math.max(0, Math.min(100, Math.round((1 - fillRate) * 100)));
    let recommendedQty = 0;
    
    if (elasticity > 1.2) recommendedQty = Math.round(Number(inventory) * 2.5);
    else if (elasticity < 0.8) recommendedQty = 0;
    else recommendedQty = Math.round(Number(inventory) * 0.8);

    let actionPlan = [];
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as a Logistics AI. Commodity: ${commodity}. Elasticity: ${elasticity.toFixed(2)}. Scarcity Risk: ${scarcityRisk}%. Write 4 short, imperative action steps. No markdown.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        actionPlan = text.split('\n').filter(line => line.trim().length > 0).slice(0, 4);
    } catch (error) {
        // Fallback
        if (elasticity > 1.2) actionPlan = ["1. Trigger emergency bulk procurement.", "2. Secure alternative freight carriers.", "3. Lock in current prices immediately.", "4. Alert production of incoming surplus."];
        else actionPlan = ["1. Maintain current stock levels.", "2. Monitor market prices for dips.", "3. Optimize warehouse storage layout.", "4. Review supplier lead times."];
    }
    res.json({ success: true, metrics: { elasticity: elasticity.toFixed(3), scarcityRisk, recommendedQty, confidence: 96 }, actionPlan });
});

app.get('/api/market-sensing', (req, res) => {
    const richData = COMMODITIES.map(c => {
        const history = [];
        let currentPrice = c.basePrice;
        for (let i = 0; i < 7; i++) {
            const volatilityFactor = c.volatility === "High" ? 0.08 : c.volatility === "Extreme" ? 0.15 : 0.02;
            const change = (Math.random() * volatilityFactor * 2) - volatilityFactor;
            currentPrice = currentPrice * (1 + change);
            history.push(currentPrice);
        }
        const events = GLOBAL_EVENTS.filter(e => e.affected === c.name || e.affected === "All");
        return { ...c, history, events };
    });
    res.json({ marketData: richData, globalFeed: GLOBAL_EVENTS });
});

app.get('/api/logistics', (req, res) => {
    res.json(SHIPMENTS);
});

// FIX: Correct path for analytics
app.get('/api/analytics', (req, res) => {
    res.json({
        kpis: { spend: "₹1.2Cr", efficiency: 94.2, riskIndex: 12, sustainability: 88 },
        radar: {
            labels: ['Resilience', 'Cost Efficiency', 'Speed', 'Sustainability', 'Reliability'],
            current: [85, 70, 90, 65, 88], 
            simulated: [60, 40, 50, 40, 50] 
        },
        costTrend: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            actual: [45, 47, 46, 48, 52, 51],
            predicted: [45.5, 46.5, 47, 47.5, 48, 48.5]
        },
        anomalies: [
            { id: 1, type: "Cost Spike", msg: "Logistics fuel surcharge +15% vs Forecast", severity: "High" },
            { id: 2, type: "Inventory Leak", msg: "Stock discrepancy in Pune Factory", severity: "Medium" }
        ]
    });
});

app.get('/api/alerts', (req, res) => {
    res.json([]);
});

app.listen(port, () => console.log(`Backend Active on Port ${port}`));