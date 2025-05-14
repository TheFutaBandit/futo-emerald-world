import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  BraveWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, useEffect } from 'react';
import { SolanaPage } from './SolanaPage';

import '@solana/wallet-adapter-react-ui/styles.css';

// Debug component to help diagnose wallet connection issues
const WalletDebugger = () => {
  const wallet = useWallet();
  
  useEffect(() => {
    console.log("Wallet state:", {
      connecting: wallet.connecting,
      connected: wallet.connected,
      wallet: wallet.wallet?.adapter.name,
      publicKey: wallet.publicKey?.toString(),
    });
    
    if (wallet.connecting) {
      console.log("Wallet is currently connecting...");
    }
    
    if (wallet.error) {
      console.error("Wallet connection error:", wallet.error);
    }
  }, [wallet.connecting, wallet.connected, wallet.error, wallet.wallet, wallet.publicKey]);
  
  return null; // This component doesn't render anything
};

export default function SolanaContainer() {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => 'https://api.devnet.solana.com', []);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(
    () => {
      const adapters = [
        new PhantomWalletAdapter({ network }),
        new SolflareWalletAdapter({ network }),
        new BackpackWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new BraveWalletAdapter()
      ];
      
      console.log("Available wallet adapters:", adapters.map(a => a.name));
      return adapters;
    },
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <WalletDebugger />
          <SolanaPage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}