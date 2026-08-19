import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import { StellarNetwork } from "@/types/stellar";

class WalletKitService {
  private kit: StellarWalletsKit | null = null;

  public init(network: StellarNetwork) {
    const kitNetwork =
      network === "MAINNET"
        ? WalletNetwork.PUBLIC
        : network === "FUTURENET"
        ? WalletNetwork.FUTURENET
        : WalletNetwork.TESTNET;

    this.kit = new StellarWalletsKit({
      network: kitNetwork,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }

  public getKit(): StellarWalletsKit {
    if (!this.kit) {
      this.init("TESTNET");
    }
    return this.kit!;
  }

  public async openModal(
    onConnect: (address: string, walletName: string) => void,
    onError: (err: any) => void
  ) {
    const kit = this.getKit();
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            onConnect(address, option.name);
          } catch (err) {
            onError(err);
          }
        },
      });
    } catch (err) {
      onError(err);
    }
  }

  public async signTransaction(xdr: string): Promise<string> {
    const kit = this.getKit();
    const { signedXDR } = await kit.sign({
      xdr,
    });
    return signedXDR;
  }
}

export const walletKit = new WalletKitService();
