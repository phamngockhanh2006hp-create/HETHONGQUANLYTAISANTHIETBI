const { ethers } = require("ethers");
const fs = require("fs");

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const contractAddress = "0xf3Bc1CC2FC8c0fbFd9de2C3F1068698540D44E36";

const abi = JSON.parse(
  fs.readFileSync(
    "contracts/build/contracts_LabAssetManager_sol_LabAssetManager.abi",
    "utf8"
  )
);

async function getContract() {
  const signer = await provider.getSigner(0);
  return new ethers.Contract(contractAddress, abi, signer);
}

module.exports = { provider, getContract };
