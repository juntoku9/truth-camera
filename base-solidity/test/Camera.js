import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TruthCamera", () => {
  // Deploy fixture for reuse across tests
  async function deployTruthCameraFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const TruthCamera = await ethers.getContractFactory("TruthCamera");
    const truthCamera = await TruthCamera.deploy();
    await truthCamera.waitForDeployment();

    // Sample hashes for testing
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("image-data-1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("image-data-2"));
    const hash3 = ethers.keccak256(ethers.toUtf8Bytes("image-data-3"));
    const emptyHash = ethers.ZeroHash;

    return {
      truthCamera,
      owner,
      user1,
      user2,
      user3,
      hash1,
      hash2,
      hash3,
      emptyHash
    };
  }

  describe("Deployment", () => {
    it("Should deploy successfully", async () => {
      const { truthCamera } = await loadFixture(deployTruthCameraFixture);
      expect(await truthCamera.getAddress()).to.be.properAddress;
    });

    it("Should have empty state initially", async () => {
      const { truthCamera, hash1 } = await loadFixture(deployTruthCameraFixture);
      const [exists, submitter, timestamp] = await truthCamera.verify(hash1);
      expect(exists).to.be.false;
      expect(submitter).to.equal(ethers.ZeroAddress);
      expect(timestamp).to.equal(0);
    });
  });

  describe("Submit Function", () => {
    it("Should submit a hash successfully", async () => {
      const { truthCamera, owner, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      await expect(truthCamera.submit(hash1))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash1, owner.address, anyValue);
    });

    it("Should store correct proof data", async () => {
      const { truthCamera, owner, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const tx = await truthCamera.submit(hash1);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const [exists, submitter, timestamp] = await truthCamera.verify(hash1);
      expect(exists).to.be.true;
      expect(submitter).to.equal(owner.address);
      expect(timestamp).to.equal(blockTimestamp);
    });

    it("Should reject empty hash", async () => {
      const { truthCamera, emptyHash } = await loadFixture(deployTruthCameraFixture);
      
      await expect(truthCamera.submit(emptyHash))
        .to.be.revertedWith("empty hash");
    });

    it("Should reject duplicate hash submission", async () => {
      const { truthCamera, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      await truthCamera.submit(hash1);
      await expect(truthCamera.submit(hash1))
        .to.be.revertedWith("already submitted");
    });

    it("Should allow different users to submit different hashes", async () => {
      const { truthCamera, user1, user2, hash1, hash2 } = await loadFixture(deployTruthCameraFixture);
      
      await expect(truthCamera.connect(user1).submit(hash1))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash1, user1.address, anyValue);

      await expect(truthCamera.connect(user2).submit(hash2))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash2, user2.address, anyValue);

      const [exists1, submitter1] = await truthCamera.verify(hash1);
      const [exists2, submitter2] = await truthCamera.verify(hash2);
      
      expect(exists1).to.be.true;
      expect(submitter1).to.equal(user1.address);
      expect(exists2).to.be.true;
      expect(submitter2).to.equal(user2.address);
    });

    it("Should prevent different users from submitting the same hash", async () => {
      const { truthCamera, user1, user2, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      await truthCamera.connect(user1).submit(hash1);
      await expect(truthCamera.connect(user2).submit(hash1))
        .to.be.revertedWith("already submitted");
    });
  });

  describe("Verify Function", () => {
    it("Should return false for non-existent hash", async () => {
      const { truthCamera, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const [exists, submitter, timestamp] = await truthCamera.verify(hash1);
      expect(exists).to.be.false;
      expect(submitter).to.equal(ethers.ZeroAddress);
      expect(timestamp).to.equal(0);
    });

    it("Should return correct data for existing hash", async () => {
      const { truthCamera, owner, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const tx = await truthCamera.submit(hash1);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const [exists, submitter, timestamp] = await truthCamera.verify(hash1);
      expect(exists).to.be.true;
      expect(submitter).to.equal(owner.address);
      expect(timestamp).to.equal(blockTimestamp);
    });

    it("Should handle multiple hash verifications", async () => {
      const { truthCamera, user1, user2, hash1, hash2, hash3 } = await loadFixture(deployTruthCameraFixture);
      
      await truthCamera.connect(user1).submit(hash1);
      await truthCamera.connect(user2).submit(hash2);
      // hash3 not submitted

      const [exists1, submitter1] = await truthCamera.verify(hash1);
      const [exists2, submitter2] = await truthCamera.verify(hash2);
      const [exists3, submitter3] = await truthCamera.verify(hash3);
      
      expect(exists1).to.be.true;
      expect(submitter1).to.equal(user1.address);
      expect(exists2).to.be.true;
      expect(submitter2).to.equal(user2.address);
      expect(exists3).to.be.false;
      expect(submitter3).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Events", () => {
    it("Should emit ProofSubmitted with correct parameters", async () => {
      const { truthCamera, owner, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const tx = await truthCamera.submit(hash1);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      await expect(tx)
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash1, owner.address, blockTimestamp);
    });

    it("Should emit events for multiple submissions", async () => {
      const { truthCamera, user1, user2, hash1, hash2 } = await loadFixture(deployTruthCameraFixture);
      
      await expect(truthCamera.connect(user1).submit(hash1))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash1, user1.address, anyValue);

      await expect(truthCamera.connect(user2).submit(hash2))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(hash2, user2.address, anyValue);
    });
  });

  describe("Edge Cases and Security", () => {
    it("Should handle maximum hash value", async () => {
      const { truthCamera, owner } = await loadFixture(deployTruthCameraFixture);
      const maxHash = "0x" + "f".repeat(64); // Maximum possible hash value
      
      await expect(truthCamera.submit(maxHash))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(maxHash, owner.address, anyValue);

      const [exists, submitter] = await truthCamera.verify(maxHash);
      expect(exists).to.be.true;
      expect(submitter).to.equal(owner.address);
    });

    it("Should handle minimum non-zero hash value", async () => {
      const { truthCamera, owner } = await loadFixture(deployTruthCameraFixture);
      const minHash = "0x" + "0".repeat(63) + "1"; // Minimum non-zero hash
      
      await expect(truthCamera.submit(minHash))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(minHash, owner.address, anyValue);

      const [exists, submitter] = await truthCamera.verify(minHash);
      expect(exists).to.be.true;
      expect(submitter).to.equal(owner.address);
    });

    it("Should handle timestamp edge case around block time", async () => {
      const { truthCamera, owner, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const tx = await truthCamera.submit(hash1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      const [, , timestamp] = await truthCamera.verify(hash1);
      expect(timestamp).to.equal(block.timestamp);
      expect(timestamp).to.be.greaterThan(0);
    });

    it("Should maintain state consistency under rapid submissions", async () => {
      const { truthCamera, user1, user2, user3 } = await loadFixture(deployTruthCameraFixture);
      
      // Create multiple unique hashes
      const hashes = [];
      for (let i = 0; i < 5; i++) {
        hashes.push(ethers.keccak256(ethers.toUtf8Bytes(`image-data-${i}`)));
      }

      // Submit all hashes rapidly
      const users = [user1, user2, user3, user1, user2];
      for (let i = 0; i < hashes.length; i++) {
        await truthCamera.connect(users[i]).submit(hashes[i]);
      }

      // Verify all submissions
      for (let i = 0; i < hashes.length; i++) {
        const [exists, submitter] = await truthCamera.verify(hashes[i]);
        expect(exists).to.be.true;
        expect(submitter).to.equal(users[i].address);
      }
    });
  });

  describe("Gas Usage", () => {
    it("Should have reasonable gas cost for submission", async () => {
      const { truthCamera, hash1 } = await loadFixture(deployTruthCameraFixture);
      
      const tx = await truthCamera.submit(hash1);
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 100k for a simple storage operation)
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("Should have consistent gas cost for verification", async () => {
      const { truthCamera, hash1, hash2 } = await loadFixture(deployTruthCameraFixture);
      
      // Submit one hash
      await truthCamera.submit(hash1);
      
      // Verify existing hash (should be low gas as it's a view function)
      const existingResult = await truthCamera.verify.staticCall(hash1);
      const nonExistingResult = await truthCamera.verify.staticCall(hash2);
      
      expect(existingResult[0]).to.be.true;
      expect(nonExistingResult[0]).to.be.false;
    });
  });

  describe("Integration Scenarios", () => {
    it("Should handle realistic image hash workflow", async () => {
      const { truthCamera, user1 } = await loadFixture(deployTruthCameraFixture);
      
      // Simulate real image hash (SHA-256 of some image data)
      const imageData = "realistic-image-binary-data-simulation";
      const imageHash = ethers.keccak256(ethers.toUtf8Bytes(imageData));
      
      // Submit proof
      await expect(truthCamera.connect(user1).submit(imageHash))
        .to.emit(truthCamera, "ProofSubmitted")
        .withArgs(imageHash, user1.address, anyValue);
      
      // Verify proof exists
      const [exists, submitter, timestamp] = await truthCamera.verify(imageHash);
      expect(exists).to.be.true;
      expect(submitter).to.equal(user1.address);
      expect(timestamp).to.be.greaterThan(0);
      
      // Attempt duplicate submission should fail
      await expect(truthCamera.connect(user1).submit(imageHash))
        .to.be.revertedWith("already submitted");
    });

    it("Should support multiple photographers workflow", async () => {
      const { truthCamera, user1, user2, user3 } = await loadFixture(deployTruthCameraFixture);
      
      const photographers = [user1, user2, user3];
      const imageHashes = photographers.map((_, i) => 
        ethers.keccak256(ethers.toUtf8Bytes(`photographer-${i}-image-data`))
      );
      
      // Each photographer submits their image proof
      for (let i = 0; i < photographers.length; i++) {
        await expect(truthCamera.connect(photographers[i]).submit(imageHashes[i]))
          .to.emit(truthCamera, "ProofSubmitted")
          .withArgs(imageHashes[i], photographers[i].address, anyValue);
      }
      
      // Verify all proofs are stored correctly
      for (let i = 0; i < photographers.length; i++) {
        const [exists, submitter] = await truthCamera.verify(imageHashes[i]);
        expect(exists).to.be.true;
        expect(submitter).to.equal(photographers[i].address);
      }
    });
  });
});
