import type { NextPage } from "next";
import Head from "next/head";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useSigner, useProvider, useAccount, useToken } from "wagmi";
import { fetchBalance } from "@wagmi/core";

import { Wallet, Contract, utils, Provider, Web3Provider, EIP712Signer } from "zksync-web3";
import axios from "axios";

import AddressInput from "../components/scaffold-eth/AddressInput";

import { toast } from "react-hot-toast";
import Balance from "../components/scaffold-eth/Balance";
// import { ConnectKitButton } from "connectkit";

const ERC20ABI =
  '[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]';

const BUILD_TOKEN_ADDRESS = "0xf551954D449eA3Ae4D6A2656a42d9B9081B137b4";
const PAYMASTER_ADDRESS = "0x7F904e350F27aF4D4A70994AE1f3bBC1dAfEe665";
const vendors = ["0x7EBa38e027Fa14ecCd87B8c56a49Fa75E04e7B6e"];

const Home: NextPage = () => {
  const { data: signer } = useSigner();
  const provider = useProvider();
  const { address } = useAccount();

  const [vendorAddress, setVendorAddress] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<number>();
  const [buildTokenBalance, setBuildTokenBalance] = useState<number>();
  const [orderId, setOrderId] = useState<string>("");
  const [refreshBalance, setRefreshBalance] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // const provider = useProvider();
  useEffect(() => {
    const getBalance = async () => {
      const balance = await fetchBalance({
        address: address ? address : "",
        token: BUILD_TOKEN_ADDRESS,
        chainId: 280,
      });
      console.log(`n-🔴 => getBalance => balance`, balance.formatted);
      setBuildTokenBalance(+balance.formatted);
    };
    if (address) {
      getBalance();
    }
  }, [address, refreshBalance]);

  const onSend = async () => {
    //@ts-ignore
    const zksyncProvider = new Web3Provider(window.ethereum);

    const buidlTokenContract = new Contract(BUILD_TOKEN_ADDRESS, ERC20ABI, zksyncProvider.getSigner());

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    const amountFormatted = tokenAmount ? tokenAmount * 100 : 0;

    console.log(`n-🔴 => onSend => buidlTokenContract`, buidlTokenContract);
    try {
      const receipt = await (
        await buidlTokenContract.transfer(vendors[0], amountFormatted, {
          // paymaster info
          customData: {
            paymasterParams,
          },
        })
      ).wait();
      console.log(`n-🔴 => onSend => receipt`, receipt);

      setTokenAmount(0);
      setVendorAddress("");
      toast.success("Token send successfully");
    } catch (error) {
      console.log("Something ent wrong", error);
    }
  };

  const onClaim = async () => {
    setIsClaiming(true);
    const signMsgResult = await axios.post("/api/claimSignMsg", { orderId });
    console.log(`n-🔴 => signMsgResult`, signMsgResult.data);
    if (signMsgResult.data["error"]) {
      toast.error(signMsgResult.data["error"]["message"]);
      return;
    }

    const messageToSign = signMsgResult.data["data"]["messageToSign"];
    console.log(`n-🔴 => messageToSign`, messageToSign);

    const signature = await signer?.signMessage(messageToSign);
    console.log(`n-🔴 => onClick={ => signature`, signature);

    const result = await axios.post("/api/claimOrder", { publicAddress: address, signature, orderId });
    console.log(`n-🔴 => onClick={ => result`, result.data);

    setTimeout(() => {
      toast.success("Successfully claimed !");
      setOrderId("");
      setRefreshBalance(!refreshBalance);
      setIsClaiming(false);
    }, 5000);
  };

  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="m-2 ">
          <div className="stats shadow text-center">
            <div className="stat">
              <div className="stat-title">BuildXX Tokens</div>
              <div className="stat-value">{buildTokenBalance}</div>
              <div className="stat-desc">Spend only with vendors</div>
            </div>
          </div>
        </div>
        <div>
          <Balance address={address ? address : ""} />
        </div>
        <div className="m-2 xl:w-[22%] ">
          <AddressInput
            placeholder="Enter vendor address"
            value={vendorAddress}
            onChange={value => setVendorAddress(value)}
          />
        </div>
        {/* amount input */}
        <div className="text-sm m-2">
          <label className="input-group ">
            <input
              // type="number"
              placeholder="Enter Amount"
              className="input-sm input-bordered input-primary border"
              value={tokenAmount}
              onChange={event => setTokenAmount(+event.target.value)}
            />
            <span className="text-sm">BUILD</span>
          </label>
        </div>
        {/* send  */}
        <div>
          <button className="btn btn-primary" onClick={onSend} disabled={!vendorAddress || !tokenAmount}>
            Send tokens
          </button>
        </div>

        <div className="m-4">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Claim your build token !!</h2>
              <input
                type="text"
                className="input input-bordered "
                placeholder="Enter order Id"
                value={orderId}
                onChange={event => setOrderId(event.target.value)}
              />
              {isClaiming && <progress className="progress progress-primary w-[100%]"></progress>}
              <p className="text-sm text-gray-500">Each day you will get 2 tokens</p>
              <div className="card-actions justify-end">
                <button disabled={!orderId || isClaiming} className="btn btn-primary" onClick={onClaim}>
                  Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
