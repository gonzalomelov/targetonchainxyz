import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Badge,
  Box,
  Button,
  Card,
  FooterHelp,
  InlineGrid,
  InlineStack,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import AccountConnectionWrapper from '../components/AccountConnectionWrapper';
import db from "../db.server";

export async function getProducts(rest, session) {
  const response = await rest.resources.ProductListing.all({
    session,
    limit: 250,
  });

  const {
    data: products
  } = response;

  return products;
}

function stripHtmlTags(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// [START action]
export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  
  let clerkDbJwt = null, storefrontAccessToken = null;
  
  if (data.action === "connect") {
    clerkDbJwt = data.clerkDbJwt;

    const response = await admin.rest.resources.StorefrontAccessToken.all({
      // @ts-ignore
      session,
    });
  
    const storefrontAccessTokens = [...response.data.map(n => n.access_token)];

    if (storefrontAccessTokens.length === 0) {
      const newStorefrontAccessToken = new admin.rest.resources.StorefrontAccessToken({
        // @ts-ignore
        session,
      });

      newStorefrontAccessToken.title = "New Storefront Access Token";
      await newStorefrontAccessToken.save({
        update: true,
      });
  
      storefrontAccessToken = newStorefrontAccessToken.access_token;
    } else {
      storefrontAccessToken = storefrontAccessTokens[0];
    }
  }
  
  await db.session.update({
    where: { id: session.id },
    data: { clerkDbJwt, storefrontAccessToken }
  });
  
  return json({});
}
// [END action]

// [START loader]
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const env = {
    shopifyAppUrl: process.env.SHOPIFY_APP_URL,
    targetOnchainUrl: process.env.TARGET_ONCHAIN_URL,
    clerkUrl: process.env.CLERK_URL,
    appName: process.env.APP_NAME,
  };

  const sessionDb = await db.session.findFirst({ where: { id: session.id } });

  if (!sessionDb) {
    throw new Error('Session not found');
  }

  let account;
  if (sessionDb.clerkDbJwt) {
    const response = await fetch(`${env.clerkUrl}/v1/client?__clerk_db_jwt=${sessionDb.clerkDbJwt}`);
    if (!response.ok) {
      await db.session.update({ where: { id: session.id }, data: { clerkDbJwt: null } });
    } else {
      const result = await response.json();
  
      if (result.response.sessions.length === 0) {
        await db.session.update({ where: { id: session.id }, data: { clerkDbJwt: null } });
      } else {
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
      
        account = {
          accountName,
          avatarUrl,
        }
      }
    }
  }

  const products = await getProducts(admin.rest, session);

  await db.product.deleteMany({
    where: {
        shop: session.shop
    }
  });

  const upsertOperations = products.map((product) => {
    const { images, variants } = product;

    const variant = variants?.[0] ?? null;
    const variantId = variant?.id?.toString() ?? null;
    const variantFormattedPrice = variant?.formatted_price ?? null;
    
    const image = images.length > 0 ? images[0] : null;

    const upsertProduct = {
      id: product.product_id.toString(),
      title: product.title,
      description: product.body_html ? stripHtmlTags(product.body_html) : '',
      shop: session.shop,
      handle: product.handle,
      variantId,
      variantFormattedPrice,
      alt: image?.altText ?? '',
      image: image?.src ?? '',
      createdAt: product.created_at,
    };

    return db.product.upsert({
      where: { id: product.product_id.toString() },
      update: upsertProduct,
      create: upsertProduct,
    })
  });

  await db.$transaction(upsertOperations);

  return json({
    products,
    env,
    account,
  });
}
// [END loader]

export default function SetupPage() {
  const { products, env } = useLoaderData();

  return (
    <Page fullWidth>
      <TitleBar title="Target Onchain" />
      <Layout>
        <Layout.AnnotatedSection
          id="targetOnchainAccount"
          title="Target Onchain account"
          description="Connect your Target Onchain account so you can manage and sync with Target Onchain."
        >
          <AccountConnectionWrapper />
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          id="publishing"
          title="Publishing"
          description="Products that are being synced to your catalog, or have errors preventing their sync, are shown here."
        >
          <Card>
            <BlockStack gap="300">
              <InlineGrid columns="1fr auto">
                <Text as="h2" variant="headingMd">
                  Product status
                </Text>
                <Button
                  variant="plain"
                  target="_top"
                  url={`shopify://admin/bulk/product?resource_name=Product&edit=status,product_taxonomy_node_id,vendor,variants.price&selectedView=all&order=title+ascending&return_to=/apps/${env.appName}/app`}
                  accessibilityLabel="Manage availability"
                >
                  Manage availability
                </Button>
              </InlineGrid>
              <InlineStack blockAlign="center" gap="100">
                <Text as="span" fontWeight="semibold">
                  {products.length}
                </Text>
                <Text as="span">
                  products are available to Target Onchain.
                </Text>
              </InlineStack>
              <InlineStack blockAlign="center" gap="100">
                <Badge
                  tone="success"
                  progress="complete"
                  toneAndProgressLabelOverride="Status: Published. Your online store products are synced with Target Onchain."
                >
                  Published
                </Badge>
                <Text as="span" fontWeight="semibold">
                  {products.length}
                </Text>
                <Text as="span">
                  products
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          id="billing"
          title="Billing"
          description="Your Target Onchain commission and billing information."
        >
          <Card>
            <BlockStack gap="300">
              <InlineStack blockAlign="center" gap="100">
                <Text as="span">
                  Commission:
                </Text>
                <Text as="span" fontWeight="semibold">
                  0%
                </Text>
              </InlineStack>
              <Text as="p" variant="bodyMd">
                You won't be charged any commission on sales or fees for using Target Onchain.
              </Text>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
        <FooterHelp>
          Learn more about{' '}
          <Link url={`${env.targetOnchainUrl}/support`} target="_blank">
            Target Onchain
          </Link>
        </FooterHelp>
      </Layout>
    </Page>
  );
}
