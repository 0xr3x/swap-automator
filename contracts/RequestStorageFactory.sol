// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RequestStorage.sol";

contract RequestStorageFactory {
    address[] public deployedStorages;
    address public owner;

    event StorageCreated(address storageAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createStorage() external onlyOwner returns (address) {
        RequestStorage newStorage = new RequestStorage();
        deployedStorages.push(address(newStorage));
        emit StorageCreated(address(newStorage));
        return address(newStorage);
    }

    function getDeployedStorages() external view returns (address[] memory) {
        return deployedStorages;
    }

    function getStorageCount() external view returns (uint256) {
        return deployedStorages.length;
    }
}