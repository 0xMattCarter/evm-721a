// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./ERC721November.sol";

error DecreasingLevelBelowZero();

/**
 * @title ERC721XP
 * @author Matt Carter, degendeveloper.eth
 * 30 March 2023
 *
 * @dev This ERC-721 contract implements a level system for tokens.
 * Each token mints at level 0. The contract owner or permitted
 * operators may increase and decrease these levels.
 *
 * @dev Levels will always be >= 0.
 */
contract ERC721XP is ERC721November {
  using Strings for uint256;

  /// Constant identifiers for manager rights
  bytes32 public constant INCREASE_LEVELS = keccak256("INCREASE_LEVELS");
  bytes32 public constant DECREASE_LEVELS = keccak256("DECREASE_LEVELS");

  /// Mapping of tokenIds to their current level
  mapping(uint256 => uint256) public levels;

  /**
   * @dev Emitted when a batch of tokens increase levels
   * @param tokenIds The tokenIds that increased levels
   * @param amounts The amounts that the levels increased by
   * @param operator The operator that increased the levels
   */
  event LevelsIncreased(
    uint256[] indexed tokenIds,
    uint256[] amounts,
    address indexed operator
  );

  /**
   * @dev Emitted when a batch of tokens decrease levels
   * @param tokenIds The tokenIds that decreased levels
   * @param amounts The amounts that the levels decreased by
   */
  event LevelsDecreased(
    uint256[] indexed tokenIds,
    uint256[] amounts,
    address indexed operator
  );

  constructor(
    string memory _name,
    string memory _symbol,
    string memory _uri,
    string memory _contractUri,
    address _owner,
    address _royaltyReceiver,
    uint256 _maxSupply,
    uint256 _priceWei,
    uint256 _royaltyFeeBps
  )
    ERC721November(
      _name,
      _symbol,
      _uri,
      _contractUri,
      _owner,
      _royaltyReceiver,
      _maxSupply,
      _priceWei,
      _royaltyFeeBps
    )
  {}

  /**
   * Increase the level for a batch of tokens
   * @param _tokenIds The tokenIds to increase levels for
   * @param _amounts The amounts to increase levels by
   * @dev Caller must be the owner or have a valid permit
   */
  function increaseLevels(
    uint256[] memory _tokenIds,
    uint256[] memory _amounts
  ) public hasValidPermit(INCREASE_LEVELS) {
    if (_tokenIds.length != _amounts.length) revert ArraysMismatch();

    for (uint256 i = 0; i < _tokenIds.length; ++i) {
      levels[_tokenIds[i]] += _amounts[i];
    }

    emit LevelsIncreased(_tokenIds, _amounts, msg.sender);
  }

  /**
   * Decrease the level for a batch of tokens
   * @param _tokenIds The tokenIds to decrease levels for
   * @param _amounts The amounts to decrease levels by
   * @dev Caller must be the owner or have a valid permit
   */
  function decreaseLevels(
    uint256[] memory _tokenIds,
    uint256[] memory _amounts
  ) public hasValidPermit(DECREASE_LEVELS) {
    if (_tokenIds.length != _amounts.length) revert ArraysMismatch();

    for (uint256 i = 0; i < _tokenIds.length; ++i) {
      if (levels[_tokenIds[i]] < _amounts[i]) {
        revert DecreasingLevelBelowZero();
      }
      levels[_tokenIds[i]] -= _amounts[i];
    }

    emit LevelsDecreased(_tokenIds, _amounts, msg.sender);
  }

  /**
   * Returns a token's URI based on its current level
   */
  function tokenURI(
    uint256 _tokenId
  ) public view override returns (string memory) {
    if (!isRevealed) {
      return URI;
    } else {
      return
        string(
          abi.encodePacked(
            URI,
            _tokenId.toString(),
            "-",
            levels[_tokenId].toString(),
            ".json"
          )
        );
    }
  }
}
