import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-col sm:flex-row">
            <h1 className="py-4 font-bold text-3xl"> Decentralized Lottery</h1>
            <div className="ml-0 sm:ml-auto py-2 pl-0 sm:px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
