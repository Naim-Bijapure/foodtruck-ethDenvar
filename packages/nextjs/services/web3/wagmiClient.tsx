import { createClient } from "wagmi";
import { appChains, wagmiConnectors } from "~~/services/web3/wagmiConnectors";
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";

// export const wagmiClient = createClient(
//   //@ts-ignore
//   getDefaultClient({
//     autoConnect: false,
//     // connectors: wagmiConnectors,
//     chains: appChains.chains,
//     provider: appChains.provider,
//   }),
// );

export const wagmiClient = createClient({
  autoConnect: false,
  connectors: wagmiConnectors,
  provider: appChains.provider,
});
