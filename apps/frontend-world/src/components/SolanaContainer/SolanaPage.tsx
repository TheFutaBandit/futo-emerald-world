import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import useAirdrop from '../../hook/useAirdrop';
import { useWallet } from '@solana/wallet-adapter-react';
import { InventorySection } from './InventorySection';
import { useEffect } from 'react';
import { EventBus } from '../../game/EventBus';
import '../styles/solanaContainerStyles.css'



export function SolanaPage() {
    
    const { publicKey } = useWallet();

    useEffect(() => {
        if(publicKey){
            EventBus.emit('user-wallet', {publicKey: publicKey});
        }
    }, [publicKey])

    return (
        <>
            {publicKey ? 
                (<div className = "solana-inventory-button-container" style = {{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px 0px",
                }}>
                    <InventorySection />
                    <WalletDisconnectButton />
                </div>)
                : 
                (<div className = "multibutton-container">
                    <div className = "wallet-text-above">An Homage to Emerald.</div>
                    <div className = "wallet-text-below">An Homage to Childhood.</div>
                    <div className = "wallet-text-main">Please connect your wallet to play.</div>
                    <WalletMultiButton className="wallet-button"/>
                </div>)
            }
            
            
        </>
    );
}