import { Keypair, Contract, Address, TransactionBuilder, BASE_FEE, rpc } from "@stellar/stellar-sdk";

/**
 * Node script to register arbiters and configure contract parameters after deployment
 */
async function main() {
  const rpcUrl = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
  const networkPassphrase = "Test SDF Network ; September 2015";
  const arbiterContractId = process.env.ARBITRATION_CONTRACT_ID;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!arbiterContractId || !adminSecret) {
    console.error("Please provide ARBITRATION_CONTRACT_ID and ADMIN_SECRET env vars");
    process.exit(1);
  }

  const server = new rpc.Server(rpcUrl);
  const adminKeypair = Keypair.fromSecret(adminSecret);
  const adminAccount = await server.getAccount(adminKeypair.publicKey());

  console.log(`Configuring Arbitration Contract: ${arbiterContractId}`);
  console.log(`Admin Address: ${adminKeypair.publicKey()}`);

  const contract = new Contract(arbiterContractId);
  const call = contract.call(
    "register_arbiter",
    new Address(adminKeypair.publicKey()).toScVal(),
    new Address(adminKeypair.publicKey()).toScVal(),
    true,
    250 // 2.5% fee
  );

  const tx = new TransactionBuilder(adminAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(call)
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);

  const res = await server.sendTransaction(prepared);
  console.log(`Arbiter registered! Tx Hash: ${res.hash}`);
}

main().catch(console.error);
