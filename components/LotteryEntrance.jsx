import { useEffect, useState } from "react";
import {
    useWeb3Contract,
    useMoralis,
    /* useMoralisSubscription, */
    /* useMoralisQuery, */
} from "react-moralis";
import { contractAddresses, abi } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0x0");
    const [notification, setNotification] = useState("");

    const dispatch = useNotification();

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numberOfPlayersFromCall = (await getPlayersNumber()).toString();
        const recentWinnerFromCall = await getRecentWinner();
        setEntranceFee(entranceFeeFromCall);
        setNumberOfPlayers(numberOfPlayersFromCall);
        setRecentWinner(recentWinnerFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled && raffleAddress) {
            updateUI();
        }
    }, [isWeb3Enabled, raffleAddress]);

    // const {
    //     data: winnerPickedData,
    //     error: winnerPickedError,
    //     isLoading: winnerPickedIsLoading,
    // } = useMoralisQuery("WinnerPicked", (query) => query, [], {
    //     live: true,
    // });

    // useMoralisSubscription("WinnerPicked", (q) => q, [], {
    //     onCreate: (data) => console.log("data", data),
    //     // onUpdate: (data) => console.log(data),
    //     // onEnter: (data) => console.log(data),
    //     enabled: true,
    // });

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        setNotification("Winner will be selected after 30 seconds");
        updateUI();
    };

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        });
    };

    return (
        <div className="p-5">
            <h1 className="py-4 font-bold text-3xl">Lottery</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto mb-3"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                                onComplete: () =>
                                    setNotification("Waiting for transaction confirmation."),
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="px-7">
                                <div className="animate-spin spinner-border h-6 w-6 border-b-2 rounded-full"></div>
                            </div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee:{ethers.utils.formatUnits(entranceFee, "ether")} ETH </div>
                    <div>Number of Players: {numberOfPlayers} </div>
                    <div>Recent Winner: {recentWinner} </div>
                    <p className="font-bold text-green-700 pt-5">{notification}</p>
                </>
            ) : (
                <div className="font-bold text-green-700">Only Rinkeby Tesnet is supported.</div>
            )}
        </div>
    );
}
