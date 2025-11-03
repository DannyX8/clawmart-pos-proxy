// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Serve static files (our POS pages) from the "public" folder
app.use(express.static("public"));

// Optional CORS (keeps things flexible if you access from other origins)
app.use(cors());
app.use(express.json());

// 🔑 Read your GHL API key from .env (never sent to browser)
const GHL_API_KEY = process.env.GHL_API_KEY;

// --------- PROXY ENDPOINT: Load Rewards from GHL ----------
// Custom field: Reward_Item_Selected (id: FmHf1dsQmem7eAzZpwha)
app.get("/ghl/rewards", async (req, res) => {
  try {
    const url =
      "https://rest.gohighlevel.com/v1/custom-fields/FmHf1dsQmem7eAzZpwha";

    const resp = await fetch(url, {
      headers: {
        Authorization: "Bearer " + GHL_API_KEY
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("GHL error:", resp.status, text);
      return res
        .status(500)
        .json({ error: "Failed to load rewards from GoHighLevel" });
    }

    const data = await resp.json();

    // Depending on API shape, picklistOptions might be nested
    const customField = data.customField || data;
    const options = customField.picklistOptions || [];

    // We only return the list of reward names to the browser
    res.json({ options });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error loading rewards" });
  }
});

// ----------------------------------------------------------

app.listen(PORT, () => {
  console.log(`✅ Claw-Mart POS proxy running on http://localhost:${PORT}`);
});
