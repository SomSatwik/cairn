// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/CairnRegistry.sol";

/// @notice Deploy CairnRegistry to Monad testnet (chain 10143).
/// Usage: forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.monad.xyz --broadcast
/// Ref: https://docs.monad.xyz/guides/deploy-smart-contract/foundry
contract DeployCairn is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        CairnRegistry registry = new CairnRegistry();

        vm.stopBroadcast();

        console.log("CairnRegistry deployed at:", address(registry));

        string memory json = vm.serializeAddress("deployment", "CairnRegistry", address(registry));
        vm.writeJson(json, "../deployments/monad-testnet.json");
    }
}
