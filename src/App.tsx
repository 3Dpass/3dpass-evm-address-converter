import React, { useCallback, useState, useMemo } from "react";
import logo from "./logo.svg";
import "./App.css";
import "./toggle-button.css";
import * as polkadotCryptoUtils from "@polkadot/util-crypto";
import * as polkadotUtils from "@polkadot/util";

interface NetworkOption {
  name: string;
  prefix: number;
}

const NETWORKS: NetworkOption[] = [
  { name: "3dpass - The Ledger of Things Mainnet", prefix: 71 },
  { name: "3dpass - The Ledger of Things Testnet", prefix: 72 }
];

function App() {
  const [addressType, setAddressType] = useState<"H160" | "SS58">("SS58");
  const [addressInput, setAddressInput] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(NETWORKS[0]);
  const [copied, setCopied] = useState(false);

  const plmToEvm = useCallback(() => {
    if (
      addressInput &&
      addressType === "SS58" &&
      polkadotCryptoUtils.checkAddress(addressInput, selectedNetwork.prefix)[0]
    ) {
      return polkadotUtils.u8aToHex(
        polkadotCryptoUtils.addressToEvm(addressInput, true)
      );
    } else {
      return "invalid";
    }
  }, [addressInput, addressType, selectedNetwork.prefix]);

  const evmToPlm = useCallback(() => {
    if (
      addressInput &&
      addressType === "H160" &&
      polkadotCryptoUtils.isEthereumAddress(addressInput)
    ) {
      return polkadotCryptoUtils.evmToAddress(addressInput, selectedNetwork.prefix);
    } else {
      return "invalid";
    }
  }, [addressInput, selectedNetwork.prefix, addressType]);

  const resultAddress = useMemo(() => {
    if (!addressInput) return "";
    if (addressType === "H160") return evmToPlm();
    else return plmToEvm();
  }, [evmToPlm, plmToEvm, addressType, addressInput]);

  const handleCopy = () => {
    if (resultAddress && resultAddress !== "invalid") {
      navigator.clipboard.writeText(resultAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <img src={logo} className="App-logo" alt="logo" />
          <a
            href="https://github.com/3Dpass/3dpass-evm-address-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <title>GitHub Repository</title>
              <path
                fill="#fff"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
        </div>
        <div className="converter-container">
          <div className="converter-section">
            <h1>3Dpass to EVM converter</h1>
          </div>
          <div className="converter-section">
            <h2>Network</h2>
            <select
              value={selectedNetwork.name}
              onChange={(e) => {
                const network = NETWORKS.find(n => n.name === e.target.value);
                if (network) setSelectedNetwork(network);
              }}
              className="network-select"
            >
              {NETWORKS.map(network => (
                <option key={network.name} value={network.name}>
                  {network.name} (prefix: {network.prefix})
                </option>
              ))}
            </select>
          </div>

          <div className="converter-section">
            <div className="title-switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={() => {
                    if (addressType === "H160") setAddressType("SS58");
                    else setAddressType("H160");
                  }}
                />
                <span className="slider round"></span>
              </label>
              <h2>{addressType === "H160" ? "H160 (EVM) → SS58 (Native)" : "SS58 (Native) → H160 (EVM)"}</h2>
            </div>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="address-input"
              placeholder={addressType === "H160" ? "Enter EVM address" : "Enter Native 3Dpass address"}
            />
          </div>

          <div className="converter-section">
            <h2>Result</h2>
            <div className="result-input-wrapper">
              <input
                type="text"
                className="result-input"
                value={resultAddress}
                readOnly
                tabIndex={-1}
                placeholder="Converted address will appear here"
              />
              <button
                className="copy-btn-inside"
                onClick={handleCopy}
                disabled={resultAddress === "invalid" || !resultAddress}
                aria-label="Copy converted address"
                tabIndex={0}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
