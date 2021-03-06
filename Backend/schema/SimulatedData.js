const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_KEY} = require('../config.js');

const simulatedDataSchema = mongoose.Schema({

  emailId: {
    type: String,
    required: false
  },

  time: {
    type: Date,
    required: true
  },

  chestPainType : {
    type: String,
    required: false
  },

  // cholesterol : {
  //   type: Number,
  //   required: false
  // },
  
  bloodPressure : {
    type: Number,
    required: false
  },

  // fbs : {
  //   type: Boolean,
  //   required: false 
  // },
  // exang : {
  //   type: Boolean,
  //   required: false 
  // },

  heartRate : {
    type: Number,
    required: false
  },

  //-----
  Painloc : {
    type: Number,
   required: false
  },

  Painexer : {
    type: Number,
    required: false
  },

  htn : {
    type: Number,
   required: false
  },

  Famhist : {
    type: Number,
    required: false
  },

  Dig : {
    type: Number,
   required: false
  },

  prop : {
    type: Number,
    required: false
  },

  nitr : {
    type: Number,
   required: false
  },

  pro : {
    type: Number,
    required: false
  },

  chol : {
    type: Number,
   required: false
  },

  fbs : {
    type: Number,
    required: false
  },

  thalach : {
    type: Number,
   required: false
  },

  thalrest : {
    type: Number,
    required: false
  },



  tpeakbps : {
    type: Number,
    required: false
  },

  tpeakbpd : {
    type: Number,
   required: false
  },

  trestbpd : {
    type: Number,
    required: false
  },

  thaldur : {
    type: Number,
   required: false
  },

  met : {
    type: Number,
    required: false
  },

  exang : {
    type: Number,
    required: false
  },

  xhypo : {
    type: Number,
   required: false
  },

  old_peak : {
    type: Number,
    required: false
  },

  slope : {
    type: Number,
   required: false
  },

  rldv5 : {
    type: Number,
    required: false
  },




  rldv5e : {
    type: Number,
    required: false
  },

  cp_encoded : {
    type: Number,
   required: false
  },

  Restcg_encoded : {
    type: Number,
    required: false
  },

  cp_1 : {
    type: Number,
   required: false
  },

  cp_2 : {
    type: Number,
    required: false
  },

  cp_3 : {
    type: Number,
    required: false
  },

  cp_4 : {
    type: Number,
   required: false
  },

  relrest : {
    type: Number,
    required: false
  },

  deviceId : {
    type: String,
    required: false
  },
 

  relrest : {
    type: Number,
    required: false
  },

  'restecg_0.0' : {
    type: Number,
   required: false
  },

  'restecg_1.0' : {
    type: Number,
    required: false
  },

  'restecg_2.0' : {
    type: Number,
    required: false
  },

  age : {
    type: Number,
   required: false
  },

  sex : {
    type: Number,
    required: false
  },

  trestbps : {
    type: Number,
    required: false
  },

  risk_level :{
    type: String,
    required: false
  },

  risk_factor :{
    type: Number,
   required: false
  }


});

simulatedDataSchema.pre("save", async function (next) {

  // add pre conditions before saving patient's info (securiy purpose)

  next();
});

simulatedDataSchema.statics.getHeartrate = async (emailId) => {
  // get heartbeat data details  by email 
  const data = await  SimulatedData.find({ emailId },{  risk_factor : 1,  trestbps : 1}).sort({ time : -1})
  
  if (!data) {
    throw new Error({ error: "Invalid Details" });
  }
 return data;
};


simulatedDataSchema.statics.delete = async (req) => {
  // get heartbeat data details  by email 
  const data = await  SimulatedData.deleteMany({ trestbps : 0});
  
  if (!data) {
    throw new Error({ error: "Invalid Details" });
  }
 return data;
};

const SimulatedData = mongoose.model("SimulatedData", simulatedDataSchema, "SimulatedData");

module.exports = SimulatedData;
