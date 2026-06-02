// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ArcDailyCheckIn
/// @notice A small hackathon contract for GM, GN, and once-per-day check-ins.
contract ArcDailyCheckIn {
    struct UserStats {
        uint256 gmCount;
        uint256 gnCount;
        uint256 dailyCheckInCount;
        uint256 lastCheckInTimestamp;
        uint256 currentStreak;
        uint256 lastGmDay;
        uint256 lastGnDay;
        uint256 lastCheckInDay;
    }

    mapping(address => UserStats) private stats;

    event GM(address indexed user, uint256 totalGmCount, uint256 timestamp);
    event GN(address indexed user, uint256 totalGnCount, uint256 timestamp);
    event DailyCheckIn(
        address indexed user,
        uint256 totalDailyCheckInCount,
        uint256 currentStreak,
        uint256 timestamp
    );

    error AlreadySaidGmToday();
    error AlreadySaidGnToday();
    error AlreadyCheckedInToday();

    function gm() external {
        UserStats storage user = stats[msg.sender];
        uint256 today = _currentDay();

        if (user.gmCount > 0 && user.lastGmDay == today) {
            revert AlreadySaidGmToday();
        }

        user.lastGmDay = today;
        user.gmCount += 1;

        emit GM(msg.sender, user.gmCount, block.timestamp);
    }

    function gn() external {
        UserStats storage user = stats[msg.sender];
        uint256 today = _currentDay();

        if (user.gnCount > 0 && user.lastGnDay == today) {
            revert AlreadySaidGnToday();
        }

        user.lastGnDay = today;
        user.gnCount += 1;

        emit GN(msg.sender, user.gnCount, block.timestamp);
    }

    function dailyCheckIn() external {
        UserStats storage user = stats[msg.sender];
        uint256 today = _currentDay();

        if (user.dailyCheckInCount > 0 && user.lastCheckInDay == today) {
            revert AlreadyCheckedInToday();
        }

        if (user.dailyCheckInCount > 0 && user.lastCheckInDay + 1 == today) {
            user.currentStreak += 1;
        } else {
            user.currentStreak = 1;
        }

        user.lastCheckInDay = today;
        user.lastCheckInTimestamp = block.timestamp;
        user.dailyCheckInCount += 1;

        emit DailyCheckIn(
            msg.sender,
            user.dailyCheckInCount,
            user.currentStreak,
            block.timestamp
        );
    }

    function getUserStats(address user)
        external
        view
        returns (
            uint256 gmCount,
            uint256 gnCount,
            uint256 dailyCheckInCount,
            uint256 lastCheckInTimestamp,
            uint256 currentStreak
        )
    {
        UserStats storage userStats = stats[user];

        return (
            userStats.gmCount,
            userStats.gnCount,
            userStats.dailyCheckInCount,
            userStats.lastCheckInTimestamp,
            userStats.currentStreak
        );
    }

    function _currentDay() private view returns (uint256) {
        return block.timestamp / 1 days;
    }
}
