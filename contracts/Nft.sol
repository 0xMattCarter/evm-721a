//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error ExceedsMaxSupply();
error ExceedsMaxBps();
error InsufficientFunds();
error MintingNotActive();

/**
 * @title OmniNFT
 * @author Matt Carter, degendeveloper.eth
 * 13 February, 2023
 *
 * This contract is EIP-2981 compliant and implements the ERC-721A contract
 * written by Chiru Labs @ https://www.erc721a.org/
 *
 */
contract Nft is ERC721A, Ownable {
  /// @dev Setup
  using Strings for uint256;

  /// @dev Max token supply
  uint256 public immutable MAX_SUPPLY;

  /// @dev Price to mint 1 token in wei
  uint256 public priceWei;

  /// @dev Royalty percentage basis points (out of 10,000)
  uint256 public royaltyFeeBps;

  /// @dev Receiver of royalty payments
  address public royaltyReceiver;

  /// @dev Is minting allowed ?
  bool public isMinting;

  /// @dev Are tokens revealed (unique or identical) ?
  bool public isRevealed;

  /// @dev Links to contract URI and base token URI
  string public contractURI;
  string public URI;

  /**
   * Sets initial arguments/data at deployment
   * @param _name The collection name
   * @param _symbol The collection symbol
   * @param _uri The base URI for token
   * @param _contractUri The URI for the collection/contract
   * @param _royaltyReceiver The address to send royalty payments to
   * @param _owner The address to transfer ownership to
   * @param _maxSupply The max supply of the collection
   * @param _priceWei The price in wei to pay for each mint
   * @param _royaltyFeeBps The percentage points for each royalty (out of 10,000)
   */
  constructor(
    string memory _name,
    string memory _symbol,
    string memory _uri,
    string memory _contractUri,
    address _royaltyReceiver,
    address _owner,
    uint256 _maxSupply,
    uint256 _priceWei,
    uint256 _royaltyFeeBps
  ) ERC721A(_name, _symbol) {
    URI = _uri;
    contractURI = _contractUri;
    royaltyReceiver = _royaltyReceiver;
    MAX_SUPPLY = _maxSupply;
    priceWei = _priceWei;
    royaltyFeeBps = _royaltyFeeBps;

    /// Transfer ownership to new owner
    transferOwnership(_owner);
  }

  /// ============ INTERNAL FUNCTIONS ============ ///

  /**
   * Overrides the first mint to start at tokenId 1 instead of 0
   * @return _id The tokenId to start minting at
   */
  function _startTokenId() internal pure override returns (uint256 _id) {
    _id = 1;
  }

  /**
   * Calculates the royalty fee for a sale
   * @param _salePrice The price of the sale in wei
   * @return _royalty The royalty fee in wei
   */
  function _calculateRoyalty(
    uint256 _salePrice
  ) public view returns (uint256 _royalty) {
    _royalty = ((royaltyFeeBps * _salePrice) / 10000);
  }

  /// ============ OWNER FUNCTIONS ============ ///

  /**
   * Set base URI for tokens
   * @param _uri The new URI
   */
  function setURI(string memory _uri) external onlyOwner {
    URI = _uri;
  }

  /**
   * Set contract URI
   * @param _contractURI The new contract URI
   */
  function setContractURI(string memory _contractURI) public onlyOwner {
    contractURI = _contractURI;
  }

  /**
   * Set mint price in wei
   * @param _priceWei The new mint price in wei
   */
  function setPrice(uint256 _priceWei) external onlyOwner {
    priceWei = _priceWei;
  }

  /**
   * Set address to reveive royalty payments
   * @param _receiver The new address to receive royalty payments
   */
  function setRoyaltyReceiver(address _receiver) public onlyOwner {
    royaltyReceiver = _receiver;
  }

  /**
   * Set royalty basis points
   * @param _royaltyFeeBps The new royalty fee basis points
   */
  function setRoyaltyFeeBps(uint256 _royaltyFeeBps) public onlyOwner {
    if (_royaltyFeeBps > 10000) {
      revert ExceedsMaxBps();
    }
    royaltyFeeBps = _royaltyFeeBps;
  }

  /**
   * Toggle if minting is allowed/unallowed
   */
  function toggleMinting() external onlyOwner {
    isMinting = !isMinting;
  }

  /**
   * Toggle if tokens are revealed or not (unique or identical)
   */
  function toggleReveal() external onlyOwner {
    isRevealed = !isRevealed;
  }

  /**
   * Withdraw contract funds to `_receiver`
   * @param _receiver The address receiving the funds
   */
  function withdraw(address payable _receiver) public onlyOwner {
    payable(_receiver).transfer(address(this).balance);
  }

  /**
   * Mint tokens for free to an address as contract owner
   * @param _amount The number of tokens to mint
   * @param _to The address to receive the tokens
   */
  function mintTokensAsOwner(uint256 _amount, address _to) public onlyOwner {
    if (_totalMinted() + _amount > MAX_SUPPLY) {
      revert ExceedsMaxSupply();
    }
    if (!isMinting) {
      revert MintingNotActive();
    }

    _mint(_to, _amount);
  }

  /// ============ PUBLIC FUNCTIONS ============ ///

  /**
   * Mint tokens
   * @param _amount The number of tokens to mint
   */
  function mintTokens(uint256 _amount) public payable {
    if (!isMinting) {
      revert MintingNotActive();
    }
    if (msg.value < _amount * priceWei) {
      revert InsufficientFunds();
    }
    if (_totalMinted() + _amount > MAX_SUPPLY) {
      revert ExceedsMaxSupply();
    }

    _mint(msg.sender, _amount);
  }

  /// ============ READ FUNCTIONS ============ ///

  /**
   * Return the URI for a specific token
   * @param _tokenId The tokenId to lookup
   * @return _URI The uri for the token
   */
  function tokenURI(
    uint256 _tokenId
  ) public view override returns (string memory _URI) {
    if (!isRevealed) {
      _URI = URI;
    } else {
      _URI = string(abi.encodePacked(URI, _tokenId.toString(), ".json"));
    }
  }

  /**
   * Add support for EIP-2981
   * @param interfaceId The interface to check for support
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override returns (bool) {
    return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
  }

  /**
   * Return royalty information for a specific sale
   * @param _tokenId The token ID that is being sold
   * @param _salePrice The sale price of the token
   */
  function royaltyInfo(
    uint256 _tokenId,
    uint256 _salePrice
  ) external view returns (address receiver, uint256 royaltyAmount) {
    receiver = royaltyReceiver;
    royaltyAmount = _calculateRoyalty(_salePrice);
  }
}
