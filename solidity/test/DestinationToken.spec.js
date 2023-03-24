const { expect } = require('chai')

const { ethers } = require('hardhat')

// Import utilities from Test Helpers
const {
  BN,
  expectEvent,
  expectRevert,
  constants,
} = require('@openzeppelin/test-helpers')

let tokenFactory, qWARCContract, owner, bridge, user2, user3

const NAME = 'WrappedARC'
const SYMBOL = 'WARC'

// Start test block
describe('WrappedARC contract', function () {
  before(async function () {
    tokenFactory = await ethers.getContractFactory('WrappedARC')
    ;[owner, bridge, user2, user3] = await ethers.getSigners()
    // deploy contract with bridge address
    qWARCContract = await tokenFactory.deploy(bridge.address)
    await qWARCContract.deployed()
  })

  it('has a name', async function () {
    expect(await qWARCContract.name()).to.be.equal(NAME)
  })

  it('has a symbol', async function () {
    expect(await qWARCContract.symbol()).to.be.equal(SYMBOL)
  })

  // it('Stores bridge address on deploy', async function () {
  //   expect(await qWARCContract.bridge()).to.be.equal(
  //     bridge.address
  //   )
  // })

  it('Prevents mint method to be called', async function () {
    await expect(
      qWARCContract.connect(user2).mint(user2.address, 1000)
    ).to.be.revertedWith(
      'WARC: only the bridge can trigger this method!'
    )
  })

  it('Prevents burnFrom method to be called', async function () {
    await expect(
      qWARCContract.connect(user2).burnFrom(user2.address, 1000)
    ).to.be.revertedWith(
      'WARC: only the bridge can trigger this method!'
    )
  })

  it('Allows bridge to mint tokens for users', async function () {
    await qWARCContract.connect(bridge).mint(user2.address, 100000)
    expect(
      await qWARCContract.connect(user2).balanceOf(user2.address)
    ).to.be.equal(100000)
  })

  it('Prevents bridge from burning not-allowed tokens', async function () {
    await expect(
      qWARCContract.connect(bridge).burnFrom(user2.address, 4)
    ).to.be.revertedWith('ERC20: insufficient allowance')
  })

  it('Allows bridge to burn allowed tokens from users address', async function () {
    await qWARCContract.connect(bridge).mint(user3.address, 10)

    // allows bridge to burn
    await qWARCContract.connect(user3).approve(bridge.address, 5)

    await qWARCContract.connect(bridge).burnFrom(user3.address, 5)

    expect(
      await qWARCContract.connect(bridge).balanceOf(user3.address)
    ).to.be.equal(5)
  })
})
