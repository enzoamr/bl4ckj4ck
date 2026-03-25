// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BlackjackVault
 * @notice Holds player funds on-chain for the Bl4ckJ4ck casino.
 *         Deposits are credited 1:1 in the off-chain chip system (1 ETH = 1000 chips).
 *         Withdrawals are requested off-chain (Firebase) and executed here.
 *
 * Deployment:
 *   - Polygon Mainnet (chainId 137) recommended for low fees
 *   - Or Ethereum Sepolia testnet for testing
 *
 * npx hardhat deploy --network polygon
 */
contract BlackjackVault {
    // ── State ──────────────────────────────────────────────────────────────────

    address public owner;

    /// @dev on-chain balance tracking (in wei)
    mapping(address => uint256) public balances;

    // ── Events ─────────────────────────────────────────────────────────────────

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    // ── Modifiers ──────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── Player actions ─────────────────────────────────────────────────────────

    /**
     * @notice Deposit native currency (ETH/MATIC) into the vault.
     *         The off-chain system will credit chips proportionally.
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw native currency from the vault.
     * @param amount Amount in wei to withdraw.
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient vault balance");

        balances[msg.sender] -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    // ── Owner / operator actions ───────────────────────────────────────────────

    /**
     * @notice Owner can credit additional balance (e.g. for winnings settled off-chain).
     *         In a fully decentralized version this would use a VRF oracle.
     */
    function creditBalance(address user, uint256 amount) external onlyOwner {
        balances[user] += amount;
    }

    /**
     * @notice Owner can debit balance (e.g. to settle losses).
     */
    function debitBalance(address user, uint256 amount) external onlyOwner {
        require(balances[user] >= amount, "Insufficient balance");
        balances[user] -= amount;
    }

    /**
     * @notice Transfer contract ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Emergency withdrawal by owner (e.g. contract migration).
     *         Should be called only during sunset/migration.
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // ── View ───────────────────────────────────────────────────────────────────

    function totalLocked() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
