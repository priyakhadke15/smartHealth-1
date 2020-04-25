const express = require("express");
const Patient = require("../schema/Patient");
const SimulatedData = require("../schema/SimulatedData");
const auth = require("../middleware/auth");

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {

  // get patient's dashboard
  
  try {

    let patient  = await Patient.getDashboard(req.query.emailId);
    let heartRatesData  = await SimulatedData.getHeartrate(req.query.emailId);

    let heartRates = [];
    heartRatesData.forEach(element => {
      heartRates.push(element.heartRate)
    });
   
    patient = {...patient, heartRates : heartRates };



    let result = JSON.parse(JSON.stringify(patient));
    res.json(result);

  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/riskStatus', auth, async (req, res) => {

  // update patient's risk status
  
  try {

    let patient  = await Patient.updateRiskStatus(req.query.emailId, req.body.riskStatus);
    let result = JSON.parse(JSON.stringify(patient));
    res.json(result);

  } catch (error) {
    res.status(400).send(error);
  }
});



module.exports = router;