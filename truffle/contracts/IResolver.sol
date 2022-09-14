// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IResolver {
    function checker()
        external
        view
        returns (bool canExec, bytes memory execPayload);
}
