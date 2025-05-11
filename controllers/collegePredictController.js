const xlsx = require('xlsx');
const path = require('path');
const Predictor = require("../models/Predictor");
const excelLoader = require('./excelLoader');

exports.predictIIT_IIITs = (req, res) => {
    const { jee_rank, category, gender } = req.query;
  
    if (!jee_rank || !category || !gender) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
  
    // const filePath = path.join(__dirname, '../data/JoSAA-2024.xlsx');
    // const workbook = xlsx.readFile(filePath);
    // let sheet='';
    // if(req.url.startsWith('/predict-iits'))
    //   sheet = workbook.Sheets['IITs_2024'];
    // else
    //   sheet = workbook.Sheets['IIITs_2024'];
    // const data = xlsx.utils.sheet_to_json(sheet);
    // console.log(data.length);
    const data = req.url.startsWith('/predict-iits') ? excelLoader.getIITData() : excelLoader.getIIITData();
    const rank = parseInt(jee_rank);
    const results = [];
  
    data.forEach((row) => {
      const seatType = row['Seat Type'].toLowerCase();
      const rowGender = row['Gender'].toLowerCase();
      const opening = parseInt(row['Opening Rank']);
      const closing = parseInt(row['Closing Rank']);
  
      // Match category & gender
      const seatMatch = seatType === category.toLowerCase();
      const genderMatch = rowGender === gender.toLowerCase();
  
      if (seatMatch && genderMatch && rank >= opening && (rank*0.95) <= closing) {
        results.push({
          institute: row['Institute'],
          program: row['Academic Program Name'],
          opening_rank: opening,
          closing_rank: closing
        });
      }
    });
  
    res.json(results);
  }

  exports.predictNIT_GFTI = (req, res) => {
    const { jee_rank, category, gender, state } = req.query;
  
    if (!jee_rank || !category || !gender || !state) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
  
    // const filePath = path.join(__dirname, '../data/JoSAA-2024.xlsx');
    // const workbook = xlsx.readFile(filePath);
    // let sheet = '';
  
    // if (req.url.startsWith('/predict-nits'))
    //   sheet = workbook.Sheets['NITs_2024'];
    // else
    //   sheet = workbook.Sheets['GFTIs_2024'];
  
    // const data = xlsx.utils.sheet_to_json(sheet);
    const data = req.url.startsWith('/predict-nits') ? excelLoader.getNITData() : excelLoader.getGFTIData();
    const rank = parseInt(jee_rank);
    const results = [];
  
    data.forEach((row) => {
      const seatType = row['Seat Type'].toLowerCase().trim();
      const rowGender = row['Gender'].toLowerCase().trim();
      const opening = parseInt(row['Opening Rank']);
      const closing = parseInt(row['Closing Rank']);
      const rowState = row['State'].toLowerCase().trim();
      let rowqt = row['Quota'].toUpperCase().trim();
      const rowQuota = rowqt==='AI'?'OS':rowqt;
  
      // Determine expected quota based on state match
      const expectedQuota = rowState === state.toLowerCase() ? 'HS' : 'OS';
  
      const seatMatch = seatType === category.toLowerCase();
      const genderMatch = rowGender === gender.toLowerCase();
      const quotaMatch = rowQuota === expectedQuota;
  
      if (seatMatch && genderMatch && quotaMatch && rank >= opening && (rank*0.95) <= closing) {
        results.push({
          institute: row['Institute'],
          program: row['Academic Program Name'],
          state: row['State'],
          quota: row['Quota'],
          opening_rank: opening,
          closing_rank: closing
        });
      }
    });
  
    res.json(results);
  };

  exports.savePredictData = async (req, res) => {
  try {
    const { mobile, jee_main_rank, jee_adv_rank, category, gender, state } = req.body;

    // Validate mobile number
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }

    // Validate at least one rank
    if (!jee_main_rank && !jee_adv_rank) {
      return res.status(400).json({ error: 'Please provide at least one of JEE Mains Rank or JEE Advanced Rank' });
    }

    // Create a new Predictor entry
    const predictorData = new Predictor({
      mobile,
      jee_main_rank: jee_main_rank || null,
      jee_adv_rank: jee_adv_rank || null,
      category: category || null,
      gender: gender || null,
      state: state || null
    });

    // Save the entry to the database
    await predictorData.save();
    
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving prediction data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  