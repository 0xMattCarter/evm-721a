// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Managerial
 * @author Matt Carter, degendeveloper.eth
 * 30 March 2023
 *
 * @dev This contract is a simplification of the PermitControl
 * contract written by Tim Clancy.
 *
 * @dev This contract allows the owner to delegate particular rights to
 * external addresses. These rights may have a limited time period. This feature
 * allows for a more flexible permission system than the standard Ownable contract.
 *
 * @dev The owner of this contract always possesses full permission as a super-administrator.
 */
abstract contract Managerial is Ownable {
  bytes32 public constant ZERO_RIGHT = hex"00000000000000000000000000000000";
  bytes32 public constant MANAGER = hex"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

  /// Mapping for address => right => expiration time
  mapping(address => mapping(bytes32 => uint256)) public permissions;

  /// Mapping for right => manager right (e.g. SET_URI => SET_URI_MANAGER)
  mapping(bytes32 => bytes32) public managerRight;

  /**
   * @dev Emitted when a permit is issued.
   * @param updator The address that issued the permit.
   * @param updatee The address that received the permit.
   * @param role The role issued.
   * @param expirationTime The expiration time of the permit.
   */
  event PermitUpdated(
    address indexed updator,
    address indexed updatee,
    bytes32 indexed role,
    uint256 expirationTime
  );

  /**
   * @dev Emitted when a manager right is updated.
   * @param manager The address that updated the manager right.
   * @param managedRight The right that was updated.
   * @param managerRight The manager right that was updated.
   */
  event ManagementUpdated(
    address indexed manager,
    bytes32 indexed managedRight,
    bytes32 indexed managerRight
  );

  /**
   * @dev Throws when called by any account that does not have a valid permit.
   * @param _right The right to check for.
   */
  modifier hasValidPermit(bytes32 _right) {
    require(
      _msgSender() == owner() ||
        hasRightUntil(_msgSender(), _right) > block.timestamp,
      "PermitControl: sender does not have a valid permit"
    );
    _;
  }

  /**
   * @dev Returns the expiration time of a permit.
   * @param _address The address to check.
   * @param _right The right to check for.
   */
  function hasRightUntil(
    address _address,
    bytes32 _right
  ) public view returns (uint256) {
    return permissions[_address][_right];
  }

  /**
   * @dev Sets a permit for an address.
   * e.g. Allow an address to SET_URI for 1 year.
   * @param _address The address to grant permission to.
   * @param _right The right to grant. (e.g. keccak256('SET_URI')
   * @param _expirationTime The expiration time of the permit.
   */
  function setPermit(
    address _address,
    bytes32 _right,
    uint256 _expirationTime
  ) external virtual hasValidPermit(managerRight[_right]) {
    require(
      _right != ZERO_RIGHT,
      "PermitControl: you may not grant the zero right"
    );
    permissions[_address][_right] = _expirationTime;
    emit PermitUpdated(_msgSender(), _address, _right, _expirationTime);
  }

  /**
   * @dev Links a permittable right to its corresponding manager right.
   * @param _right The right being linked (e.g. keccak256('SET_URI').
   * @param _managerRight The manager right to link to. (e.g. keccak256('SET_URI_MANAGER')).
   * ex: To allow an address permission to grant 'SET_URI' permits:
   *    - link the 'SET_URI' right to the 'SET_URI_MANAGER' right.
   *    - grant the 'SET_URI_MANAGER' right to the address using
   *      `setPermit(_address, keccak256('SET_URI_MANAGER), _expirationTime)`.
   * e.g. Allow an address the ability to grant SET_URI permits.
   */
  function setManagerRight(
    bytes32 _right,
    bytes32 _managerRight
  ) external virtual hasValidPermit(MANAGER) {
    require(
      _right != ZERO_RIGHT,
      "PermitControl: you may not specify a manager for the zero right"
    );
    managerRight[_right] = _managerRight;
    emit ManagementUpdated(_msgSender(), _right, _managerRight);
  }
}
