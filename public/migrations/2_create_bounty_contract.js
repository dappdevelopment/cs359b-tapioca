var BountyDistribution = artifacts.require("BountyDistribution");  
module.exports = function(deployer) {
    deployer.deploy(BountyDistribution);
};
