import { Link, AccountConnection } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useLoaderData, useSubmit } from "@remix-run/react";

function AccountConnectionWrapper() {
  const { env, account } = useLoaderData();
  
  const [connected, setConnected] = useState(!!account);
  const [accountName, setAccountName] = useState(account ? account.accountName : '');
  const [avatarUrl, setAvatarUrl] = useState(account ? account.avatarUrl : '');

  const submit = useSubmit();

  const handleAction = useCallback(() => {
    if (connected) {
      submit({ action: "disconnect" }, { method: "post" });

      setAccountName('');
      setAvatarUrl('');
      setConnected(false);
      
      return;
    }

    const width = 600;
    const height = 400;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popWin = window.open(
      `${env.targetOnchainUrl}/sign-in`,
      'merchantWindow',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popWin) {
      const receiveMessage = async (event) => {
        if (event.origin === env.shopifyAppUrl) {
          if (event.data.source === 'target-onchain' && event.data.token) {
            try {
              const response = await fetch(`${env.clerkUrl}/v1/client?__clerk_db_jwt=${event.data.token}`);
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              const result = await response.json();

              const accountName = result.response.sessions[0].public_user_data.identifier
                ? result.response.sessions[0].public_user_data.identifier
                : result.response.sessions[0].public_user_data.first_name
                  ? result.response.sessions[0].public_user_data.first_name
                  : result.response.sessions[0].user.web3_wallets
                    ? result.response.sessions[0].user.web3_wallets.web3_wallet
                    : '';

              const avatarUrl = result.response.sessions[0].public_user_data.has_image
                ? result.response.sessions[0].public_user_data.image_url
                : '';

              setAccountName(accountName);
              setAvatarUrl(avatarUrl);
              setConnected(true);

              submit({ action: "connect", clerkDbJwt: event.data.token }, { method: "post" });

              popWin.close();
              window.removeEventListener("message", receiveMessage);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          } else {
            console.log('Invalid event data:', event.data);
          }
        } else {
          console.log('Invalid origin:', event.origin);
        }
      };

      window.addEventListener("message", receiveMessage);

      popWin.onbeforeunload = () => {
        window.removeEventListener("message", receiveMessage);
      };
    } else {
      throw new Error('Failed to open popup window');
    }
  }, [connected]);

  const buttonText = connected ? 'Disconnect' : 'Connect';
  const details = connected ? 'Account connected' : 'No account connected';
  const terms = connected ? null : (
    <p>
      By clicking <strong>Connect</strong>, you agree to accept Target Onchain’s{' '}
      <Link url={`${env.targetOnchainUrl}/termsAndConditions`} target="_blank">terms and conditions</Link>.
    </p>
  );

  return (
    <AccountConnection
      accountName={accountName}
      avatarUrl={avatarUrl}
      connected={connected}
      title="Target Onchain"
      action={{
        content: buttonText,
        onAction: handleAction,
      }}
      details={details}
      termsOfService={terms}
    />
  );
}

export default AccountConnectionWrapper;
