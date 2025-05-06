import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import useAirdrop from '../../hook/useAirdrop';

export function SolanaPage() {
    const { requestAirdropFunction, loading, err, tx } = useAirdrop()
    return (
        <div>
            <WalletMultiButton />
            <WalletDisconnectButton />
            <button onClick = {requestAirdropFunction} disabled = {loading} >Send Shi</button>
            {err && <div>error seen</div>}
            {tx && <div>Hey I have a transcation!</div>}
        </div>
    );
}