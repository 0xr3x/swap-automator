// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RequestStorage {
    struct Request {
        uint256 timestamp;
        string requestId;
    }

    Request[] private requests;
    address public owner;

    event RequestAdded(uint256 timestamp, string requestId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addRequest(uint256 _timestamp, string memory _requestId) external onlyOwner {
        requests.push(Request({
            timestamp: _timestamp,
            requestId: _requestId
        }));
        emit RequestAdded(_timestamp, _requestId);
    }

    function getRequest(uint256 index) external view returns (uint256 timestamp, string memory requestId) {
        require(index < requests.length, "Index out of bounds");
        Request memory request = requests[index];
        return (request.timestamp, request.requestId);
    }

    function getRequestCount() external view returns (uint256) {
        return requests.length;
    }
}