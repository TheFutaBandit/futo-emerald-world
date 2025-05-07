import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import useAirdrop from '../../hook/useAirdrop';
import { useWallet } from '@solana/wallet-adapter-react';
import { InventorySection } from './InventorySection';

export function SolanaPage() {
    const { requestAirdropFunction, loading, err, tx } = useAirdrop()
    const { publicKey } = useWallet();
    return (
        <div>
            {publicKey ? 
                (<div>
                    <button onClick = {requestAirdropFunction} disabled = {loading} >Send Shi</button>
                    {err && <div>error seen</div>}
                    {tx && <div>Hey I have a transcation!</div>}
                    <InventorySection />
                    <WalletDisconnectButton />
                </div>)
                : 
                (<div>
                    <WalletMultiButton />
                </div>)
            }
            
            
        </div>
    );
}