// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./Managerial.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error ArraysMismatch();
error BurningNotActive();
error ExceedsMaxSupply();
error ExceedsMaxBps();
error InsufficientFunds();
error MintingNotActive();

interface IProxyRegistry {
  function proxies(address _owner) external view returns (address _operator);
}

/**
 * @title ERC721November
 * @author Matt Carter, degendeveloper.eth
 * 30 March, 2023
 *
 * @dev This contract extends the ERC721A contract built by chiru labs.
 */
contract ERC721November is ERC721A, Managerial {
  using Strings for uint256;

  /// Constant identifiers for manager rights
  bytes32 public constant TOGGLE_MINTING = keccak256("TOGGLE_MINTING");
  bytes32 public constant TOGGLE_BURNING = keccak256("TOGGLE_BURNING");
  bytes32 public constant TOGGLE_REVEAL = keccak256("TOGGLE_REVEAL");

  bytes32 public constant SET_URI = keccak256("SET_URI");
  bytes32 public constant SET_CONTRACT_URI = keccak256("SET_CONTRACT_URI");
  bytes32 public constant SET_ROYALTY_FEE = keccak256("SET_ROYALTY_FEE");
  bytes32 public constant SET_ROYALTY_FEE_RECEIVER =
    keccak256("SET_ROYALTY_FEE_RECEIVER");
  bytes32 public constant SET_PRICE_WEI = keccak256("SET_PRICE_WEI");
  bytes32 public constant SET_PROXY_REGISTRY = keccak256("SET_PROXY_REGISTRY");

  bytes32 public constant MINT = keccak256("MINT");
  bytes32 public constant BURN = keccak256("BURN");
  bytes32 public constant WITHDRAW = keccak256("WITHDRAW");

  /// Max token supply
  uint256 public immutable MAX_SUPPLY;

  /// Receiver of royalty payments
  address public royaltyReceiver;
  /// Address of proxy registry
  address public proxyRegistryAddress;

  /// Link to token URI(s)
  string public URI;
  /// Link to contract URI
  string public contractURI;

  /// Is minting allowed ?
  bool public isMinting;
  /// Is burning allowed ?
  bool public isBurning;
  /// Are tokens revealed (unique or identical) ?
  bool public isRevealed;

  /// Price to mint 1 token in wei
  uint256 public priceWei;
  /// Royalty percentage basis points (out of 10,000)
  uint256 public royaltyFeeBps;

  /**
   * @dev Emitted when the minting status is updated
   * @param _currentStatus The new minting status
   * @param _updator The address that updated the minting status
   */
  event MintingStatusUpdated(bool _currentStatus, address indexed _updator);

  /**
   * @dev Emitted when the burning status is updated
   * @param _currentStatus The new burning status
   * @param _updator The address that updated the burning status
   */
  event BurningStatusUpdated(bool _currentStatus, address indexed _updator);

  /**
   * @dev Emitted when the reveal status is updated
   * @param _currentStatus The new reveal status
   * @param _updator The address that updated the reveal status
   */
  event RevealStatusUpdated(bool _currentStatus, address indexed _updator);

  /**
   * @dev Emitted when the base URI is updated
   * @param _newUri The new base URI
   * @param _updator The address that updated the base URI
   */
  event TokenUriUpdated(string _newUri, address indexed _updator);

  /**
   * @dev Emitted when the contract URI is updated
   * @param _newContractUri The new contract URI
   * @param _updator The address that updated the contract URI
   */

  event ContractUriUpdated(string _newContractUri, address indexed _updator);

  /**
   * @dev Emitted when the royalty fee is updated
   * @param _newFeeBps The new royalty fee
   * @param _updator The address that updated the royalty fee
   */
  event RoyaltyFeeUpdated(uint256 _newFeeBps, address indexed _updator);

  /**
   * @dev Emitted when the royalty receiver is updated
   * @param _newReceiver The new royalty receiver
   * @param _updator The address that updated the royalty receiver
   */
  event RoyaltyReceiverUpdated(address _newReceiver, address indexed _updator);

  /**
   * @dev Emitted when the price is updated
   * @param _newPriceWei The new price
   * @param _updator The address that updated the price
   */
  event PriceUpdated(uint256 _newPriceWei, address indexed _updator);

  /**
   * @dev Emitted when the proxy registry is updated
   * @param _newProxyRegistry The new proxy registry
   * @param _updator The address that updated the proxy registry
   */
  event ProxyRegistryUpdated(
    address _newProxyRegistry,
    address indexed _updator
  );

  /**
   * @dev Emitted when a manager mints tokens
   * @param _amounts The number of tokens minted to each receiver
   * @param _receivers The addresses that received the tokens
   * @param _minter The address that burned the token
   */
  event TokensSudoMinted(
    uint256[] _amounts,
    address[] _receivers,
    address _minter
  );

  /**
   * @dev Emitted when a manager burns tokens
   * @param _tokenIds The token IDs burned
   * @param _burner The address that burned the tokens
   */
  event TokensSudoBurned(uint256[] _tokenIds, address _burner);

  /**
   * @dev Emitted when tokens are burned by approved operators
   * @param _tokenIds The token IDs burned
   * @param _burner The address that burned the tokens
   */
  event TokensBurned(uint256[] _tokenIds, address _burner);

  /**
   * @dev Emitted when the contract is withdrawn from
   * @param _to The address that received the funds
   * @param _amount The amount withdrawn
   * @param _withdrawer The address that initiated the withdraw
   */
  event ContractWithdrawn(address _to, uint256 _amount, address _withdrawer);

  /**
   * @dev Sets initial arguments/data at deployment
   * @param _name Collection name
   * @param _symbol Collection symbol
   * @param _uri URI base for tokens
   * @param _contractUri URI for collection/contract
   * @param _owner Address to become contract owner
   * @param _royaltyReceiver Address to receive royalty payments
   * @param _maxSupply Max supply of collection
   * @param _priceWei Price in wei for each public mint
   * @param _royaltyFeeBps Percentage points for each royalty (out of 10,000)
   */
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
  ) ERC721A(_name, _symbol) {
    URI = _uri;
    contractURI = _contractUri;
    royaltyReceiver = _royaltyReceiver;
    MAX_SUPPLY = _maxSupply;
    priceWei = _priceWei;
    royaltyFeeBps = _royaltyFeeBps;
    transferOwnership(_owner);
  }

  /**
   * @dev Overrides the first mint to start at tokenId 1 instead of 0
   * @return _id The tokenId to start minting at
   */
  function _startTokenId() internal pure override returns (uint256 _id) {
    _id = 1;
  }

  /**
   * @dev Calculates the royalty fee for a sale
   * @param _salePrice The price of the sale in wei
   * @return _royalty The royalty fee in wei
   */
  function _calculateRoyalty(
    uint256 _salePrice
  ) public view returns (uint256 _royalty) {
    _royalty = ((royaltyFeeBps * _salePrice) / 10000);
  }

  /**
   * @dev Returns if `_operator` is allowed to manage the assets of `_owner`
   * @param _owner The address that owns the assets
   * @param _operator The address that is acting on behalf of _owner
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  ) public view virtual override returns (bool) {
    /// @dev If the proxy registry is set, use it
    if (proxyRegistryAddress != address(0)) {
      IProxyRegistry proxyRegistry = IProxyRegistry(proxyRegistryAddress);
      if (address(proxyRegistry.proxies(_owner)) == _operator) {
        return true;
      }
    }

    return super.isApprovedForAll(_owner, _operator);
  }

  /// ============ MANAGER FUNCTIONS ============ ///

  /**
   * Set base URI for tokens
   * @dev Caller must be the owner or have a valid permit
   * @param _uri The new URI
   */
  function setURI(string memory _uri) external hasValidPermit(SET_URI) {
    URI = _uri;
    emit TokenUriUpdated(_uri, msg.sender);
  }

  /**
   * Set contract URI
   * @dev Caller must be the owner or have a valid permit
   * @param _contractURI The new contract URI
   */
  function setContractURI(
    string memory _contractURI
  ) public hasValidPermit(SET_CONTRACT_URI) {
    contractURI = _contractURI;
    emit ContractUriUpdated(_contractURI, msg.sender);
  }

  /**
   * Toggle if public minting is allowed/unallowed
   * @dev Caller must be the owner or have a valid permit
   */
  function toggleMinting() external hasValidPermit(TOGGLE_MINTING) {
    isMinting = !isMinting;
    emit MintingStatusUpdated(isMinting, msg.sender);
  }

  /**
   * Toggle if public burning is allowed/unallowed
   * @dev Caller must be the owner or have a valid permit
   */
  function toggleBurning() external hasValidPermit(TOGGLE_BURNING) {
    isBurning = !isBurning;
    emit BurningStatusUpdated(isBurning, msg.sender);
  }

  /**
   * Toggle if tokens are revealed or not (unique or identical)
   * @dev Caller must be the owner or have a valid permit
   */
  function toggleReveal() external hasValidPermit(TOGGLE_REVEAL) {
    isRevealed = !isRevealed;
    emit RevealStatusUpdated(isRevealed, msg.sender);
  }

  /**
   * Set mint price in wei
   * @dev Caller must be the owner or have a valid permit
   * @param _priceWei The new mint price in wei
   */
  function setPriceWei(
    uint256 _priceWei
  ) external hasValidPermit(SET_PRICE_WEI) {
    priceWei = _priceWei;
    emit PriceUpdated(_priceWei, msg.sender);
  }

  /**
   * Set address to reveive royalty payments
   * @dev Caller must be the owner or have a valid permit
   * @param _receiver The new address to receive royalty payments
   */
  function setRoyaltyReceiver(
    address _receiver
  ) public hasValidPermit(SET_ROYALTY_FEE_RECEIVER) {
    royaltyReceiver = _receiver;
    emit RoyaltyReceiverUpdated(_receiver, msg.sender);
  }

  /**
   * Set royalty fee basis points
   * @dev Caller must be the owner or have a valid permit
   * @param _royaltyFeeBps The new royalty fee basis points
   */
  function setRoyaltyFeeBps(
    uint256 _royaltyFeeBps
  ) public hasValidPermit(SET_ROYALTY_FEE) {
    if (_royaltyFeeBps > 10000) {
      revert ExceedsMaxBps();
    }
    royaltyFeeBps = _royaltyFeeBps;
    emit RoyaltyFeeUpdated(_royaltyFeeBps, msg.sender);
  }

  /**
   * Mint tokens to an array of addresses with no restrictions
   * @dev Caller must be the owner or have a valid permit
   * @param _amounts Array of amounts to mint to each receiver
   * @param _receivers Array of addresses receiving tokens
   * NOTE - If the collection has 10 tokens left until it reaches MAX_SUPPLY,
   * a sudo mint of 10 tokens will prevent the public from potentially minting
   * those last 10 tokens.
   */
  function mintTokensSudo(
    uint256[] memory _amounts,
    address[] memory _receivers
  ) public hasValidPermit(MINT) {
    if (_amounts.length != _receivers.length) revert ArraysMismatch();
    for (uint256 i = 0; i < _amounts.length; i++) {
      _mint(_receivers[i], _amounts[i]);
    }
    emit TokensSudoMinted(_amounts, _receivers, msg.sender);
  }

  /**
   * Burn an array of tokenIds as the owner or manager
   * @dev Caller must be the owner or have a valid permit
   * @param _tokenIds Array of tokenIds to burn
   */
  function burnTokensSudo(
    uint256[] memory _tokenIds
  ) public hasValidPermit(BURN) {
    for (uint256 i = 0; i < _tokenIds.length; i++) {
      _burn(_tokenIds[i]);
    }
    emit TokensSudoBurned(_tokenIds, msg.sender);
  }

  /**
   * Sets the proxy registry address
   * @dev Caller must be the owner or have a valid permit
   * @param _proxyRegistryAddress The address of the proxy registry
   */
  function setProxyRegistry(
    address _proxyRegistryAddress
  ) public hasValidPermit(SET_PROXY_REGISTRY) {
    proxyRegistryAddress = _proxyRegistryAddress;
    emit ProxyRegistryUpdated(_proxyRegistryAddress, msg.sender);
  }

  /**
   * Withdraw contract funds to `_receiver`
   * @dev Caller must be the owner or have a valid permit
   * @param _receiver The address receiving the funds
   */
  function withdraw(address payable _receiver) public hasValidPermit(WITHDRAW) {
    uint256 balance = address(this).balance;
    payable(_receiver).transfer(balance);
    emit ContractWithdrawn(_receiver, balance, msg.sender);
  }

  /// ============ PUBLIC FUNCTIONS ============ ///

  /**
   * Mint tokens for `priceWei` * `_amount`
   * @param _amount The number of tokens to mint
   */
  function mintTokens(uint256 _amount) public payable {
    if (!isMinting) revert MintingNotActive();
    if (msg.value < _amount * priceWei) revert InsufficientFunds();
    if (_totalMinted() + _amount > MAX_SUPPLY) revert ExceedsMaxSupply();

    _mint(msg.sender, _amount);
  }

  /**
   * Burn tokens if owner or approved operator
   * @param _tokenIds The tokenIds to burn
   */
  function burnTokens(uint256[] memory _tokenIds) public {
    if (!isBurning) revert BurningNotActive();
    for (uint256 i = 0; i < _tokenIds.length; ++i) {
      /// @dev Passing `true` verifies caller is owner or approved operator
      _burn(_tokenIds[i], true);
    }
    emit TokensBurned(_tokenIds, msg.sender);
  }

  /// ============ READ FUNCTIONS ============ ///

  /**
   * Return the total number of tokens minted
   */
  function totalMinted() public view returns (uint256) {
    return _totalMinted();
  }

  /**
   * Returns the total number of tokens burned
   */
  function totalBurned() public view returns (uint256) {
    return _totalBurned();
  }

  /**
   * Return the URI for a specific token
   * @param _tokenId The tokenId to lookup
   * @return _URI The uri for the token
   */
  function tokenURI(
    uint256 _tokenId
  ) public view virtual override returns (string memory _URI) {
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
   * @return receiver The address that should receive the royalty payment
   * @return royaltyAmount The payment amount to send to `receiver`
   */
  function royaltyInfo(
    uint256 _tokenId,
    uint256 _salePrice
  ) external view returns (address receiver, uint256 royaltyAmount) {
    receiver = royaltyReceiver;
    royaltyAmount = _calculateRoyalty(_salePrice);
  }
}
