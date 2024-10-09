const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // นำเข้า path module

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ตั้งค่า middleware สำหรับให้บริการไฟล์ static
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint สำหรับดึงข้อมูลพยากรณ์อากาศจาก TMD
app.get('/api/forecast', async (req, res) => {
    const url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at?lat=16.50802960910885&lon=100.16819415961902&fields=tc,rh,slp,rain,psfc,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,swdown,cond&duration=10";
    const token = process.env.TMD_API_TOKEN; // เรียกจาก .env
    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// เสิร์ฟหน้า index.html เมื่อเข้าถึง root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// เสิร์ฟหน้า index_map.html เมื่อเข้าถึง /map
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index_map.html'));
});

// เพิ่ม endpoint สำหรับ OpenWeatherMap API
app.get('/api/weather', async (req, res) => {
    const lat = req.query.lat; // ดึง latitude จาก query
    const lon = req.query.lon; // ดึง longitude จาก query
    const apiKey = process.env.OPENWEATHER_API_KEY;    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`; // ส่งพิกัดไปยัง API

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// เพิ่ม endpoint สำหรับ Open Meteo API
app.get('/api/flood', async (req, res) => {
    const lat = 16.508059208185358; // Latitude ที่คุณระบุ
    const lon = 100.16810677061765; // Longitude ที่คุณระบุ
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min,river_discharge_p25,river_discharge_p75&forecast_days=7`;

    try {
        const response = await axios.get(url);
        res.json(response.data); // ส่งข้อมูล JSON กลับไปให้ผู้ขอ
    } catch (error) {
        console.error('Error fetching flood data:', error);
        res.status(500).json({ error: 'Failed to fetch flood data' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
