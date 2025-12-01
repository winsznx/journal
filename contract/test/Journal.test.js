const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Journal Contract", function () {
    let Journal;
    let journal;
    let owner;
    let user1;
    let user2;
    const entryFee = ethers.parseEther("0.0000001");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        Journal = await ethers.getContractFactory("Journal");
        journal = await Journal.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await journal.owner()).to.equal(owner.address);
        });

        it("Should set the correct entry fee", async function () {
            expect(await journal.entryFee()).to.equal(entryFee);
        });

        it("Should initialize entry counter to 0", async function () {
            expect(await journal.entryCounter()).to.equal(0);
        });
    });

    describe("Adding Entries", function () {
        it("Should add a new entry successfully", async function () {
            await journal.connect(user1).addEntry(
                "My First Entry",
                "Today was a great day!",
                "happy",
                ["personal", "positive"],
                false,
                { value: entryFee }
            );

            const entries = await journal.getUserEntries(user1.address);
            expect(entries.length).to.equal(1);
            expect(entries[0].title).to.equal("My First Entry");
            expect(entries[0].mood).to.equal("happy");
        });

        it("Should fail without sufficient fee", async function () {
            await expect(
                journal.connect(user1).addEntry(
                    "Test",
                    "Content",
                    "happy",
                    [],
                    false,
                    { value: ethers.parseEther("0.00000001") }
                )
            ).to.be.revertedWith("Insufficient fee");
        });

        it("Should fail with empty title", async function () {
            await expect(
                journal.connect(user1).addEntry(
                    "",
                    "Content",
                    "happy",
                    [],
                    false,
                    { value: entryFee }
                )
            ).to.be.revertedWith("Title required");
        });

        it("Should fail with empty content", async function () {
            await expect(
                journal.connect(user1).addEntry(
                    "Title",
                    "",
                    "happy",
                    [],
                    false,
                    { value: entryFee }
                )
            ).to.be.revertedWith("Content required");
        });

        it("Should fail with too many tags", async function () {
            const tooManyTags = Array(11).fill("tag");
            await expect(
                journal.connect(user1).addEntry(
                    "Title",
                    "Content",
                    "happy",
                    tooManyTags,
                    false,
                    { value: entryFee }
                )
            ).to.be.revertedWith("Too many tags");
        });

        it("Should emit EntryAdded event", async function () {
            await expect(
                journal.connect(user1).addEntry(
                    "Test Entry",
                    "Test Content",
                    "happy",
                    [],
                    false,
                    { value: entryFee }
                )
            ).to.emit(journal, "EntryAdded");
        });

        it("Should increment entry counter", async function () {
            await journal.connect(user1).addEntry(
                "Entry 1",
                "Content 1",
                "happy",
                [],
                false,
                { value: entryFee }
            );

            await journal.connect(user1).addEntry(
                "Entry 2",
                "Content 2",
                "sad",
                [],
                false,
                { value: entryFee }
            );

            expect(await journal.entryCounter()).to.equal(2);
        });
    });

    describe("Editing Entries", function () {
        beforeEach(async function () {
            await journal.connect(user1).addEntry(
                "Original Title",
                "Original Content",
                "happy",
                ["original"],
                false,
                { value: entryFee }
            );
        });

        it("Should edit entry successfully", async function () {
            await journal.connect(user1).editEntry(
                0,
                "Updated Title",
                "Updated Content",
                "sad",
                ["updated"]
            );

            const entry = await journal.getEntry(0);
            expect(entry.title).to.equal("Updated Title");
            expect(entry.content).to.equal("Updated Content");
            expect(entry.mood).to.equal("sad");
        });

        it("Should update lastEditedAt timestamp", async function () {
            const tx = await journal.connect(user1).editEntry(
                0,
                "Updated",
                "Updated",
                "happy",
                []
            );

            await tx.wait();
            const entry = await journal.getEntry(0);
            expect(entry.lastEditedAt).to.be.greaterThan(0);
        });

        it("Should fail if not entry owner", async function () {
            await expect(
                journal.connect(user2).editEntry(
                    0,
                    "Hacked",
                    "Hacked",
                    "angry",
                    []
                )
            ).to.be.revertedWith("Not entry owner");
        });

        it("Should emit EntryUpdated event", async function () {
            await expect(
                journal.connect(user1).editEntry(
                    0,
                    "Updated",
                    "Updated",
                    "happy",
                    []
                )
            ).to.emit(journal, "EntryUpdated");
        });
    });

    describe("Deleting Entries", function () {
        beforeEach(async function () {
            await journal.connect(user1).addEntry(
                "To Delete",
                "This will be deleted",
                "neutral",
                [],
                false,
                { value: entryFee }
            );
        });

        it("Should delete entry successfully", async function () {
            await journal.connect(user1).deleteEntry(0);

            await expect(
                journal.getEntry(0)
            ).to.be.revertedWith("Entry was deleted");
        });

        it("Should decrease user entry count", async function () {
            expect(await journal.getUserEntryCount(user1.address)).to.equal(1);

            await journal.connect(user1).deleteEntry(0);

            expect(await journal.getUserEntryCount(user1.address)).to.equal(0);
        });

        it("Should fail if not entry owner", async function () {
            await expect(
                journal.connect(user2).deleteEntry(0)
            ).to.be.revertedWith("Not entry owner");
        });

        it("Should fail if already deleted", async function () {
            await journal.connect(user1).deleteEntry(0);

            await expect(
                journal.connect(user1).deleteEntry(0)
            ).to.be.revertedWith("Entry already deleted");
        });

        it("Should emit EntryDeleted event", async function () {
            await expect(
                journal.connect(user1).deleteEntry(0)
            ).to.emit(journal, "EntryDeleted");
        });
    });

    describe("Privacy Control", function () {
        beforeEach(async function () {
            await journal.connect(user1).addEntry(
                "Private Entry",
                "This is private",
                "anxious",
                [],
                true,
                { value: entryFee }
            );
        });

        it("Should toggle privacy successfully", async function () {
            let entry = await journal.connect(user1).getEntry(0);
            expect(entry.isPrivate).to.be.true;

            await journal.connect(user1).togglePrivacy(0);

            entry = await journal.connect(user1).getEntry(0);
            expect(entry.isPrivate).to.be.false;
        });

        it("Should prevent viewing private entries by others", async function () {
            await expect(
                journal.connect(user2).getEntry(0)
            ).to.be.revertedWith("Private entry");
        });

        it("Should allow owner to view private entries", async function () {
            const entry = await journal.connect(user1).getEntry(0);
            expect(entry.title).to.equal("Private Entry");
        });

        it("Should emit PrivacyToggled event", async function () {
            await expect(
                journal.connect(user1).togglePrivacy(0)
            ).to.emit(journal, "PrivacyToggled");
        });
    });

    describe("Mood Statistics", function () {
        beforeEach(async function () {
            // Add entries with different moods
            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });
            await journal.connect(user1).addEntry("E2", "C2", "happy", [], false, { value: entryFee });
            await journal.connect(user1).addEntry("E3", "C3", "sad", [], false, { value: entryFee });
            await journal.connect(user1).addEntry("E4", "C4", "excited", [], false, { value: entryFee });
        });

        it("Should return mood statistics correctly", async function () {
            const [moods, counts] = await journal.connect(user1).getMoodStats(user1.address);

            expect(moods.length).to.equal(8);
            expect(counts[0]).to.equal(2); // happy
            expect(counts[1]).to.equal(1); // excited
            expect(counts[5]).to.equal(1); // sad
        });

        it("Should prevent viewing others' statistics", async function () {
            await expect(
                journal.connect(user2).getMoodStats(user1.address)
            ).to.be.revertedWith("Can only view own statistics");
        });
    });

    describe("Date Range Queries", function () {
        it("Should return entries within date range", async function () {
            const now = await time.latest();

            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });

            await time.increase(86400); // 1 day

            await journal.connect(user1).addEntry("E2", "C2", "sad", [], false, { value: entryFee });

            const entries = await journal.connect(user1).getEntriesByDateRange(
                user1.address,
                now,
                now + 86400
            );

            expect(entries.length).to.equal(1);
        });

        it("Should fail with invalid date range", async function () {
            await expect(
                journal.connect(user1).getEntriesByDateRange(
                    user1.address,
                    1000,
                    500
                )
            ).to.be.revertedWith("Invalid date range");
        });
    });

    describe("Owner Functions", function () {
        it("Should update entry fee", async function () {
            const newFee = ethers.parseEther("0.0000002");
            await journal.updateFee(newFee);
            expect(await journal.entryFee()).to.equal(newFee);
        });

        it("Should fail to update fee if not owner", async function () {
            await expect(
                journal.connect(user1).updateFee(ethers.parseEther("0.0000002"))
            ).to.be.revertedWithCustomError(journal, "OwnableUnauthorizedAccount");
        });

        it("Should update max entry length", async function () {
            await journal.updateMaxEntryLength(20000);
            expect(await journal.maxEntryLength()).to.equal(20000);
        });

        it("Should pause contract", async function () {
            await journal.pause();

            await expect(
                journal.connect(user1).addEntry(
                    "Test",
                    "Test",
                    "happy",
                    [],
                    false,
                    { value: entryFee }
                )
            ).to.be.revertedWithCustomError(journal, "EnforcedPause");
        });

        it("Should unpause contract", async function () {
            await journal.pause();
            await journal.unpause();

            await journal.connect(user1).addEntry(
                "Test",
                "Test",
                "happy",
                [],
                false,
                { value: entryFee }
            );

            const entries = await journal.getUserEntries(user1.address);
            expect(entries.length).to.equal(1);
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            // Add some entries to accumulate fees
            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });
            await journal.connect(user2).addEntry("E2", "C2", "sad", [], false, { value: entryFee });
        });

        it("Should allow owner to withdraw", async function () {
            const initialBalance = await ethers.provider.getBalance(owner.address);
            const contractBalance = await journal.getBalance();

            const tx = await journal.withdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalBalance = await ethers.provider.getBalance(owner.address);

            expect(finalBalance).to.be.closeTo(
                initialBalance + contractBalance - gasUsed,
                ethers.parseEther("0.0001") // Small tolerance for gas
            );
        });

        it("Should fail if not owner", async function () {
            await expect(
                journal.connect(user1).withdraw()
            ).to.be.revertedWithCustomError(journal, "OwnableUnauthorizedAccount");
        });

        it("Should emit FundsWithdrawn event", async function () {
            await expect(journal.withdraw())
                .to.emit(journal, "FundsWithdrawn");
        });

        it("Should fail if no funds", async function () {
            await journal.withdraw();

            await expect(
                journal.withdraw()
            ).to.be.revertedWith("No funds to withdraw");
        });
    });

    describe("View Functions", function () {
        it("Should get balance correctly", async function () {
            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });

            expect(await journal.getBalance()).to.equal(entryFee);
        });

        it("Should get user entry count", async function () {
            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });
            await journal.connect(user1).addEntry("E2", "C2", "sad", [], false, { value: entryFee });

            expect(await journal.getUserEntryCount(user1.address)).to.equal(2);
        });

        it("Should exclude deleted entries from getUserEntries", async function () {
            await journal.connect(user1).addEntry("E1", "C1", "happy", [], false, { value: entryFee });
            await journal.connect(user1).addEntry("E2", "C2", "sad", [], false, { value: entryFee });

            await journal.connect(user1).deleteEntry(0);

            const entries = await journal.getUserEntries(user1.address);
            expect(entries.length).to.equal(1);
            expect(entries[0].title).to.equal("E2");
        });
    });
});
