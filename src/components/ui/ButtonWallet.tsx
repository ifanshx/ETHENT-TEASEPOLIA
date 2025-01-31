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
                    className="w-full h-12 px-8 py-3 text-xl text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
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
                    className="w-full h-12 px-8 py-3 text-xl text-white bg-gradient-to-r from-red-500 to-red-700 rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300"
                  >
                    WRONG NETWORK
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-6">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center space-x-3 text-xl text-white bg-gray-700 rounded-xl px-6 py-3 shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden mr-3"
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
                    <span className="text-lg font-medium">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="text-xl text-white bg-gray-800 rounded-xl px-6 py-3 shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300"
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
