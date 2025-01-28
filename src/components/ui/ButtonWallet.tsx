import { ConnectButton } from "@rainbow-me/rainbowkit";

const ButtonWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full h-10 px-6 py-2 text-lg text-black bg-primary rounded-lg shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  >
                    CONNECT WALLET
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="w-full h-10 px-6 py-2 text-lg text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                  >
                    WRONG NETWORK
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-4">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center space-x-2 text-lg text-white bg-gray-700 rounded-lg px-4 py-2 shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-6 h-6 rounded-full overflow-hidden mr-2"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <span>{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="text-lg text-white bg-gray-800 rounded-lg px-4 py-2 shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ButtonWallet;
