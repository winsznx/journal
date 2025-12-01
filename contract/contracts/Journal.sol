// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Journal
 * @dev On-chain personal journal with privacy controls and mood tracking
 * @notice This contract allows users to store journal entries on the blockchain
 */
contract Journal is ReentrancyGuard, Ownable, Pausable {
    struct Entry {
        uint256 id;
        address owner;
        string title;
        string content;
        string mood;
        string[] tags;
        bool isPrivate;
        uint256 timestamp;
        uint256 lastEditedAt;
        bool exists;
        bool deleted;
    }

    // State variables
    uint256 public entryFee = 0.0000001 ether;
    uint256 public entryCounter;
    uint256 public maxEntryLength = 10000; // Maximum content length

    // Mappings
    mapping(uint256 => Entry) public entries;
    mapping(address => uint256[]) public userEntryIds;
    mapping(address => uint256) public userEntryCount;

    // Events
    event EntryAdded(
        uint256 indexed id,
        address indexed owner,
        string title,
        bool isPrivate,
        uint256 timestamp
    );
    event EntryUpdated(
        uint256 indexed id,
        uint256 timestamp
    );
    event EntryDeleted(
        uint256 indexed id,
        address indexed owner,
        uint256 timestamp
    );
    event PrivacyToggled(
        uint256 indexed id,
        bool isPrivate,
        uint256 timestamp
    );
    event EntryFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );
    event FundsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {
        // Owner is set via Ownable constructor
    }

    /**
     * @notice Add a new journal entry
     * @param _title Entry title
     * @param _content Entry content
     * @param _mood User's mood
     * @param _tags Array of tags for categorization
     * @param _isPrivate Privacy setting
     */
    function addEntry(
        string memory _title,
        string memory _content,
        string memory _mood,
        string[] memory _tags,
        bool _isPrivate
    ) public payable whenNotPaused {
        require(msg.value >= entryFee, "Insufficient fee");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_content).length > 0, "Content required");
        require(bytes(_content).length <= maxEntryLength, "Content too long");
        require(_tags.length <= 10, "Too many tags");

        uint256 id = entryCounter++;

        entries[id] = Entry({
            id: id,
            owner: msg.sender,
            title: _title,
            content: _content,
            mood: _mood,
            tags: _tags,
            isPrivate: _isPrivate,
            timestamp: block.timestamp,
            lastEditedAt: 0,
            exists: true,
            deleted: false
        });

        userEntryIds[msg.sender].push(id);
        userEntryCount[msg.sender]++;

        emit EntryAdded(id, msg.sender, _title, _isPrivate, block.timestamp);
    }

    /**
     * @notice Edit an existing entry
     * @param _entryId Entry ID to edit
     * @param _title New title
     * @param _content New content
     * @param _mood New mood
     * @param _tags New tags
     */
    function editEntry(
        uint256 _entryId,
        string memory _title,
        string memory _content,
        string memory _mood,
        string[] memory _tags
    ) public whenNotPaused {
        Entry storage entry = entries[_entryId];
        require(entry.exists, "Entry does not exist");
        require(!entry.deleted, "Entry was deleted");
        require(entry.owner == msg.sender, "Not entry owner");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_content).length > 0, "Content required");
        require(bytes(_content).length <= maxEntryLength, "Content too long");
        require(_tags.length <= 10, "Too many tags");

        entry.title = _title;
        entry.content = _content;
        entry.mood = _mood;
        entry.tags = _tags;
        entry.lastEditedAt = block.timestamp;

        emit EntryUpdated(_entryId, block.timestamp);
    }

    /**
     * @notice Soft delete an entry
     * @param _entryId Entry ID to delete
     */
    function deleteEntry(uint256 _entryId) public {
        Entry storage entry = entries[_entryId];
        require(entry.exists, "Entry does not exist");
        require(!entry.deleted, "Entry already deleted");
        require(entry.owner == msg.sender, "Not entry owner");

        entry.deleted = true;
        userEntryCount[msg.sender]--;

        emit EntryDeleted(_entryId, msg.sender, block.timestamp);
    }

    /**
     * @notice Toggle entry privacy
     * @param _entryId Entry ID
     */
    function togglePrivacy(uint256 _entryId) public {
        Entry storage entry = entries[_entryId];
        require(entry.exists, "Entry does not exist");
        require(!entry.deleted, "Entry was deleted");
        require(entry.owner == msg.sender, "Not entry owner");

        entry.isPrivate = !entry.isPrivate;
        
        emit PrivacyToggled(_entryId, entry.isPrivate, block.timestamp);
    }

    /**
     * @notice Get all entries for a user (respects privacy)
     * @param _user User address
     * @return Entry array
     */
    function getUserEntries(address _user) public view returns (Entry[] memory) {
        uint256[] memory ids = userEntryIds[_user];
        uint256 activeCount = 0;

        // Count active, non-deleted entries
        for (uint256 i = 0; i < ids.length; i++) {
            Entry memory entry = entries[ids[i]];
            if (entry.exists && !entry.deleted) {
                if (_user == msg.sender || !entry.isPrivate) {
                    activeCount++;
                }
            }
        }

        Entry[] memory result = new Entry[](activeCount);
        uint256 index = 0;

        // Populate result array
        for (uint256 i = 0; i < ids.length; i++) {
            Entry memory entry = entries[ids[i]];
            if (entry.exists && !entry.deleted) {
                if (_user == msg.sender || !entry.isPrivate) {
                    result[index] = entry;
                    index++;
                }
            }
        }

        return result;
    }

    /**
     * @notice Get a single entry (respects privacy)
     * @param _entryId Entry ID
     * @return Entry struct
     */
    function getEntry(uint256 _entryId) public view returns (Entry memory) {
        Entry memory entry = entries[_entryId];
        require(entry.exists, "Entry does not exist");
        require(!entry.deleted, "Entry was deleted");

        // Only owner can view private entries
        if (entry.isPrivate && entry.owner != msg.sender) {
            revert("Private entry");
        }

        return entry;
    }

    /**
     * @notice Get mood statistics for a user
     * @param _user User address
     * @return Array of mood counts
     */
    function getMoodStats(address _user) public view returns (
        string[] memory moods,
        uint256[] memory counts
    ) {
        require(_user == msg.sender, "Can only view own statistics");
        
        uint256[] memory ids = userEntryIds[_user];
        
        // This is a simplified version - in production you'd want a more efficient approach
        string[] memory moodList = new string[](8);
        moodList[0] = "happy";
        moodList[1] = "excited";
        moodList[2] = "grateful";
        moodList[3] = "calm";
        moodList[4] = "neutral";
        moodList[5] = "sad";
        moodList[6] = "anxious";
        moodList[7] = "angry";
        
        uint256[] memory moodCounts = new uint256[](8);
        
        for (uint256 i = 0; i < ids.length; i++) {
            Entry memory entry = entries[ids[i]];
            if (entry.exists && !entry.deleted) {
                for (uint256 j = 0; j < moodList.length; j++) {
                    if (keccak256(bytes(entry.mood)) == keccak256(bytes(moodList[j]))) {
                        moodCounts[j]++;
                        break;
                    }
                }
            }
        }
        
        return (moodList, moodCounts);
    }

    /**
     * @notice Update entry fee (owner only)
     * @param _newFee New fee amount
     */
    function updateFee(uint256 _newFee) public onlyOwner {
        uint256 oldFee = entryFee;
        entryFee = _newFee;
        emit EntryFeeUpdated(oldFee, _newFee, block.timestamp);
    }

    /**
     * @notice Update max entry length (owner only)
     * @param _newLength New max length
     */
    function updateMaxEntryLength(uint256 _newLength) public onlyOwner {
        require(_newLength >= 100, "Length too short");
        maxEntryLength = _newLength;
    }

    /**
     * @notice Pause contract (owner only)
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw contract balance (owner only, with reentrancy protection)
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner(), balance, block.timestamp);
    }

    /**
     * @notice Get contract balance
     * @return Balance in wei
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get total entry count for a user
     * @param _user User address
     * @return Entry count
     */
    function getUserEntryCount(address _user) public view returns (uint256) {
        return userEntryCount[_user];
    }

    /**
     * @notice Get entries by date range
     * @param _user User address
     * @param _startTime Start timestamp
     * @param _endTime End timestamp
     * @return Entries in range
     */
    function getEntriesByDateRange(
        address _user,
        uint256 _startTime,
        uint256 _endTime
    ) public view returns (Entry[] memory) {
        require(_startTime <= _endTime, "Invalid date range");
        require(_user == msg.sender, "Can only view own entries");

        uint256[] memory ids = userEntryIds[_user];
        uint256 count = 0;

        // Count matching entries
        for (uint256 i = 0; i < ids.length; i++) {
            Entry memory entry = entries[ids[i]];
            if (entry.exists && !entry.deleted) {
                if (entry.timestamp >= _startTime && entry.timestamp <= _endTime) {
                    count++;
                }
            }
        }

        Entry[] memory result = new Entry[](count);
        uint256 index = 0;

        // Populate result
        for (uint256 i = 0; i < ids.length; i++) {
            Entry memory entry = entries[ids[i]];
            if (entry.exists && !entry.deleted) {
                if (entry.timestamp >= _startTime && entry.timestamp <= _endTime) {
                    result[index] = entry;
                    index++;
                }
            }
        }

        return result;
    }
}
