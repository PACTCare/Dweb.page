"use strict";

const poWaaS = (iotaInstance, endpoint, apiKey) => {
  // Save Sandbox URL
  iotaInstance.sandboxUrl = endpoint;
  // Save API Key
  iotaInstance.sandboxKey = apiKey;
  // Override the attachToTangle call
  iotaInstance.api.attachToTangle = async (
    trunk,
    branch,
    mwm,
    trytes,
    callback
  ) => {
    // Validate all the things!
    validate(iotaInstance, trunk, branch, mwm, trytes, callback);
    // Send ATT call to the sandbox
    let data = await sandboxATT(
      trunk,
      branch,
      mwm,
      trytes,
      iotaInstance.sandboxUrl,
      iotaInstance.sandboxKey
    );
    callback(null, data.trytes);
  };
};
// Call the Sandbox
const sandboxATT = async (trunk, branch, mwm, trytes, sandbox, apiKey) => {
  // Create Request Payload
  const payload = {
    command: "attachToTangle",
    trunkTransaction: trunk,
    branchTransaction: branch,
    minWeightMagnitude: mwm,
    trytes: trytes
  };
  // Create Request Object
  let params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
  // If API add auth
  if (apiKey) params.headers["Authorization"] = apiKey;
  // Post job to Sandbox
  const response = await window.fetch(`${sandbox}`, params);
  const data = await response.json();
  return data;
};

const validate = (iotaInstance, trunk, branch, mwm, trytes, callback) => {
  // inputValidator: Check if correct hash
  if (!iotaInstance.valid.isHash(trunk))
    return callback(
      new Error(
        "You have provided an invalid hash as a trunk/branch: " + trunk
      ),
      null
    );

  // inputValidator: Check if correct hash
  if (!iotaInstance.valid.isHash(branch))
    return callback(
      new Error(
        "You have provided an invalid hash as a trunk/branch: " + branch
      ),
      null
    );

  // inputValidator: Check if int
  if (!iotaInstance.valid.isValue(mwm)) {
    return callback(new Error("One of your inputs is not an integer"), null);
  }

  // inputValidator: Check if array of trytes
  if (!iotaInstance.valid.isArrayOfTrytes(trytes)) {
    return callback(new Error("Invalid Trytes provided"), null);
  }
};

module.exports = poWaaS;
