const mongoose = require("mongoose");
const { all } = require("../app");


const resourceAllocationSchema = mongoose.Schema({

  patient: {
    type: String,
    required: true
  },

  requestId : {
    type: Number,
    required: true,
    unique : true
  },

  healthRisk : {
    type: String,
    required: true 
  },

  healthcareProvider : {
    type: String,
    required: true
  },

  resourceType : {
    type : String,
    required: true
  },

  lastUpdatedAt : {
    type: Date,
    required: true
  },

  status : {
    type : String,
    required: true
  }

});

resourceAllocationSchema.statics.deallocate = async (req) => {

    const result =  await ResourceAllocation.findOne(req);
  
    if(!result)
      return result;

      var set = {
        allocationStatus  : "deallocated"
    }
    
    result.set(set);

    const resource = await result.save();
  
    if(!resource)
      throw new Error({ message: "unable to deallocate resource" });
    
      return resource;
  };



resourceAllocationSchema.statics.allocatedResourceInfo = async (req) => {
    // get allocated resources  aggregated count

    let allocationCount =await ResourceAllocation.countDocuments({ allocationStatus : "allocated" })
    let pendingCount =await ResourceAllocation.countDocuments({ allocationStatus : "pending" })
    let completedCount =await ResourceAllocation.countDocuments({ allocationStatus : "deallocated" })

    let map = new Map()
    map['allocationCount'] = allocationCount/(allocationCount+pendingCount+completedCount)
    map['pendingCount'] = pendingCount/(allocationCount+pendingCount+completedCount)
    map['completedCount'] = completedCount/(allocationCount+pendingCount+completedCount)

    let result =  await ResourceAllocation.aggregate([
      {
         "$group": {
            "_id":  "$resourceType" ,
            "allocatedResourcesCount": { $sum: 1 }
     } 
  }   

  ]);

  let result2 = [map,result];

 if (!result2) {
   throw new Error({ error: "Couldn't get resource allocation details" });
 }
return result2;
};

resourceAllocationSchema.statics.getAll = async (req) => {

  const data = await ResourceAllocation.find({}).sort( { lastUpdatedAt : -1 } ).limit(10)

  if (!data) {
    throw new Error({ error: "Couldn't get resource allocation details" });
  }
  return data;
};

const ResourceAllocation = mongoose.model("ResourceAllocation", resourceAllocationSchema, "ResourceAllocation");

module.exports = ResourceAllocation;
