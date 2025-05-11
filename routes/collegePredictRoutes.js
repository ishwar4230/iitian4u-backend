const express = require("express");
const { predictIIT_IIITs, predictNIT_GFTI, savePredictData } = require("../controllers/collegePredictController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/predict-iits", predictIIT_IIITs);
router.get("/predict-iiits", predictIIT_IIITs);
router.get("/predict-nits",predictNIT_GFTI);
router.get("/predict-gftis",predictNIT_GFTI);
router.post("/save-predict-data",savePredictData);

module.exports = router;
