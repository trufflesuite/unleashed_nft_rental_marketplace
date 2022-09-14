// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IERC4907.sol";
import "./IResolver.sol";

contract Marketplace is ReentrancyGuard, IResolver {
  using Counters for Counters.Counter;
  using EnumerableSet for EnumerableSet.AddressSet;
  using EnumerableSet for EnumerableSet.UintSet;
  address private constant GELATO_OPS_GOERLI = address(0xc1C6805B857Bef1f412519C4A842522431aFed39);
  Counters.Counter private _nftsListed;
  address private _marketOwner;
  uint256 private _listingFee = .001 ether;
  // maps contract address to token id to properties of the rental listing
  mapping(address => mapping(uint256 => Listing)) private _listingMap;
  // maps nft contracts to set of the tokens that are listed
  mapping(address => EnumerableSet.UintSet) private _nftContractTokensMap;
  // tracks the nft contracts that have been listed
  EnumerableSet.AddressSet private _nftContracts;
  struct Listing {
      address owner;
      address user;
      address nftContract;
      uint256 tokenId;
      uint256 pricePerDay;
      uint256 startDateUNIX; // when the nft can start being rented
      uint256 endDateUNIX; // when the nft can no longer be rented
      uint256 expires; // when the user can no longer rent it
  }
  event NFTListed(
      address owner,
      address user,
      address nftContract,
      uint256 tokenId,
      uint256 pricePerDay,
      uint256 startDateUNIX,
      uint256 endDateUNIX,
      uint256 expires
  );
  event NFTRented(
      address owner,
      address user,
      address nftContract,
      uint256 tokenId,
      uint256 startDateUNIX,
      uint256 endDateUNIX,
      uint64 expires,
      uint256 rentalFee
  );
  event NFTUnlisted(
      address unlistSender,
      address nftContract,
      uint256 tokenId,
      uint256 refund
  );

  constructor() {
      _marketOwner = msg.sender;
  }

  // function to list NFT for rental
  function listNFT(
      address nftContract,
      uint256 tokenId,
      uint256 pricePerDay,
      uint256 startDateUNIX,
      uint256 endDateUNIX
  ) public payable nonReentrant {
      require(isRentableNFT(nftContract), "Contract is not an ERC4907");
      require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner of nft");
      require(msg.value == _listingFee, "Not enough ether for listing fee");
      require(pricePerDay > 0, "Rental price should be greater than 0");
      require(startDateUNIX >= block.timestamp, "Start date cannot be in the past");
      require(endDateUNIX >= startDateUNIX, "End date cannot be before the start date");
      require(_listingMap[nftContract][tokenId].nftContract == address(0), "This NFT has already been listed");
      
      payable(_marketOwner).transfer(_listingFee);
      _listingMap[nftContract][tokenId] = Listing(
          msg.sender,
          address(0),
          nftContract,
          tokenId,
          pricePerDay,
          startDateUNIX,
          endDateUNIX,
          0
      );
      _nftsListed.increment();
      EnumerableSet.add(_nftContractTokensMap[nftContract], tokenId);
      EnumerableSet.add(_nftContracts, nftContract);
      emit NFTListed(
          IERC721(nftContract).ownerOf(tokenId),
          address(0),
          nftContract,
          tokenId,
          pricePerDay,
          startDateUNIX,
          endDateUNIX,
          0
      );
    }

    function isRentableNFT(address nftContract) public view returns (bool) {
        bool _isRentable = false;
        bool _isNFT = false;
        try IERC165(nftContract).supportsInterface(type(IERC4907).interfaceId) returns (bool rentable) {
            _isRentable = rentable;
        } catch {
            return false;
        }
        try IERC165(nftContract).supportsInterface(type(IERC721).interfaceId) returns (bool nft) {
            _isNFT = nft;
        } catch {
            return false;
        }
        return _isRentable && _isNFT;
    }

    // function to rent an NFT
    function rentNFT(
        address nftContract,
        uint256 tokenId,
        uint64 expires
    ) public payable nonReentrant {
        Listing storage listing = _listingMap[nftContract][tokenId];
        require(listing.user == address(0) || block.timestamp > listing.expires, "NFT already rented");
        require(expires <= listing.endDateUNIX, "Rental period exceeds max date rentable");
        // Transfer rental fee
        uint256 numDays = (expires - block.timestamp)/60/60/24 + 1;
        uint256 rentalFee = listing.pricePerDay * numDays;
        require(msg.value >= rentalFee, "Not enough ether to cover rental period");
        payable(listing.owner).transfer(rentalFee);
        // Update listing
        IERC4907(nftContract).setUser(tokenId, msg.sender, expires);
        listing.user = msg.sender;
        listing.expires = expires;

        emit NFTRented(
            IERC721(nftContract).ownerOf(tokenId),
            msg.sender,
            nftContract,
            tokenId,
            listing.startDateUNIX,
            listing.endDateUNIX,
            expires,
            rentalFee
        );
    }

    // function to unlist your rental, refunding the user for any lost time
    function unlistNFT(address nftContract, uint256 tokenId) public payable nonReentrant {
        Listing storage listing = _listingMap[nftContract][tokenId];
        require(listing.owner != address(0), "This NFT is not listed");
        require(listing.owner == msg.sender || _marketOwner == msg.sender || GELATO_OPS_GOERLI == msg.sender,
            "Not approved to unlist NFT");
        // fee to be returned to user if unlisted before rental period is up
        // nothing to refund if no renter
        uint256 refund = 0;
        if (listing.user != address(0)) {
            refund = ((listing.expires - block.timestamp) / 60 / 60 / 24 + 1) * listing.pricePerDay;
            require(msg.value >= refund, "Not enough ether to cover refund");
            payable(listing.user).transfer(refund);
        }
        // clean up data
        IERC4907(nftContract).setUser(tokenId, address(0), 0);
        EnumerableSet.remove(_nftContractTokensMap[nftContract], tokenId);
        delete _listingMap[nftContract][tokenId];
        if (EnumerableSet.length(_nftContractTokensMap[nftContract]) == 0) {
            EnumerableSet.remove(_nftContracts, nftContract);
        }
        _nftsListed.decrement();

        emit NFTUnlisted(
            msg.sender,
            nftContract,
            tokenId,
            refund
        );
    }

    /* 
    * function to get all listings
    *
    * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
    * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
    * this function has an unbounded cost, and using it as part of a state-changing function may render the function
    * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
    */
    function getAllListings() public view returns (Listing[] memory) {
        Listing[] memory listings = new Listing[](_nftsListed.current());
        uint256 listingsIndex = 0;
        address[] memory nftContracts = EnumerableSet.values(_nftContracts);
        for (uint i = 0; i < nftContracts.length; i++) {
            address nftAddress = nftContracts[i];
            uint256[] memory tokens = EnumerableSet.values(_nftContractTokensMap[nftAddress]);
            for (uint j = 0; j < tokens.length; j++) {
                listings[listingsIndex] = _listingMap[nftAddress][tokens[j]];
                listingsIndex++;
            }
        }
        return listings;
    }

    function removeUnavailableListings(Listing[] memory unavailableListings) public {
        for (uint i = 0; i < unavailableListings.length; i++) {
            unlistNFT(unavailableListings[i].nftContract, unavailableListings[i].tokenId);
        }
    }

    function checker()
        external
        view 
        override returns (bool canExec, bytes memory execPayload) {
        uint256 totalListingCount = _nftsListed.current();
        uint256 unavailableListingCount = 0;
        Listing[] memory allListings = getAllListings();
        for (uint i = 0; i < totalListingCount; i++) {
            if (allListings[i].endDateUNIX > block.timestamp) {
                unavailableListingCount++;
            }
        }

        if (unavailableListingCount <= 0) {
            return (false, bytes("No listings to unlist"));
        }
        if (tx.gasprice > 80 gwei) {
            return (false, bytes("Gas price is greater than 80 gwei"));
        }

        Listing[] memory unavailableListings = new Listing[](unavailableListingCount);
        uint256 unavailableListingsCount = 0;
        for (uint i = 0; i < totalListingCount; i++) {
            if (allListings[i].endDateUNIX > block.timestamp) {
                unavailableListings[unavailableListingsCount] = allListings[i];
                unavailableListingsCount++;
            }
        }

        execPayload = abi.encodeWithSelector(
            this.removeUnavailableListings.selector,
            unavailableListings
        );
        return (true, execPayload);
    }

    function getListingFee() public view returns (uint256) {
        return _listingFee;
    }
}


