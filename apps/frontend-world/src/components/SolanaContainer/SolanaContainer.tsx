import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolanaPage } from './SolanaPage';

import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

import '@solana/wallet-adapter-react-ui/styles.css';


export default function SolanaContainer() {
    return (
        <ConnectionProvider endpoint='https://api.devnet.solana.com'>
            <WalletProvider wallets={[]}>
                <WalletModalProvider>
                    <SolanaPage />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}