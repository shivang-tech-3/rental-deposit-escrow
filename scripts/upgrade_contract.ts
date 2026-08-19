import { Keypair, Contract, Address, TransactionBuilder, BASE_FEE, rpc, xdr } from "@stellar/stellar-sdk";

/**
 * Script to upgrade Soroban smart contract with new WASM bytecode hash
 */
async function main() {
  const rpcUrl = process.env.RPC_URL || "https://soroban-testnet.stellar.org";
  const networkPassphrase = "Test SDF Network ; September 2015";
  const contractId = process.env.TARGET_CONTRACT_ID;
  const newWasmHashHex = process.env.NEW_WASM_HASH;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!contractId || !newWasmHashHex || !adminSecret) {
    console.error("Usage: TARGET_CONTRACT_ID=... NEW_WASM_HASH=... ADMIN_SECRET=... ts-node upgrade_contract.ts");
    process.exit(1);
  }

  const server = new rpc.Server(rpcUrl);
  const adminKeypair = Keypair.fromSecret(adminSecret);
  const adminAccount = await server.getAccount(adminKeypair.publicKey());

  console.log(`Upgrading Contract: ${contractId} to Wasm Hash: ${newWasmHashHex}`);

  const contract = new Contract(contractId);
  const wasmBytes = Buffer.from(newWasmHashHex, "hex");
  const call = contract.call(
    "upgrade",
    new Address(adminKeypair.publicKey()).toScVal(),
    xdr.ScVal.scvBytes(wasmBytes)
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
  console.log(`Upgrade transaction submitted! Hash: ${res.hash}`);
}

main().catch(console.error);
