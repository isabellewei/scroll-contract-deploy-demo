import { ContractTransaction } from "ethers";
import { ethers } from "hardhat";

async function waitTxSuccess(tx: ContractTransaction){
  const txReceipt = await tx.wait();
  if (txReceipt.status !== 1) {
    console.error("tx failed :(")
  }
  return txReceipt
}

async function main() {
  // default is account1
  const [account1, account2, account3] = await ethers.getSigners()

  // deploy contracts
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const OurToken = await ethers.getContractFactory("OurToken");
  const multiSigWallet = await MultiSigWallet.deploy([account1.address, account2.address, account3.address], 2)
  await multiSigWallet.deployed();
  const ourToken = await OurToken.deploy()
  await ourToken.deployed()
  console.log(`MultiSigWallet contract deployed to ${multiSigWallet.address}`);
  console.log(`OurToken contract deployed to ${ourToken.address}`);

  // transfer ownership of OurToken to multisig
  const transferTx = await ourToken.transferOwnership(multiSigWallet.address)
  await waitTxSuccess(transferTx)
  console.log("transferred ownership of NFT contract to multisig")

  // create and submit minting tx to multisig
  const mintTx = await ourToken.populateTransaction.safeMint(account3.address, 1)
  const multisigTx = await multiSigWallet.submitTransaction(mintTx.to || ourToken.address, 0, mintTx.data!)
  const multisigTxReceipt = await waitTxSuccess(multisigTx)
  const multisigTxId = multisigTxReceipt.events?.find(event => event.event === 'Submission')?.args?.transactionId
  console.log("submitted mint transaction to multisig")

  // vote to approve transaction
  const approveTx = await multiSigWallet.connect(account2).confirmTransaction(multisigTxId)
  await waitTxSuccess(approveTx)
  console.log("voted in multisig to approve transaction")

  // mint NFT
  const doMintTx = await multiSigWallet.executeTransaction(multisigTxId, {gasLimit: 8000000})
  await waitTxSuccess(doMintTx)
  console.log("congrats! NFT minted through multisig")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
