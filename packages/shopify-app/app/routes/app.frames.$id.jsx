import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  FooterHelp,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { getFrame, validateFrame } from "../models/Frame.server";

export async function loader({ request, params }) {
  // [START authenticate]
  const { admin } = await authenticate.admin(request);
  // [END authenticate]

  // [START data]
  const env = {
    targetOnchainUrl: process.env.TARGET_ONCHAIN_URL,
  };

  if (params.id === "new") {
    return json({
      frame: {
        title: "",
        image: "",
        button: "",
        products: [],
        matchingCriteria: "ALL",
      },
      env
    });
  }

  return json({
    frame: await getFrame(Number(params.id), admin.graphql),
    env
  });
  // [END data]
}

// [START action]
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (data.action === "delete") {
    await db.frame.delete({ where: { id: Number(params.id) } });
    return redirect("/app/frames/home");
  }

  const errors = validateFrame(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const { products: productsData, ...frameData } = data;

  const frame =
    params.id === "new"
      ? await db.frame.create({ data: frameData })
      : await db.frame.update({ where: { id: Number(params.id) }, data: frameData });

  return redirect(`/app/frames/${frame.id}`);
}
// [END action]

// [START state]
export default function FrameForm() {
  const errors = useActionData()?.errors || {};

  const { frame, env } = useLoaderData();
  const [formState, setFormState] = useState(frame);
  const [cleanFormState, setCleanFormState] = useState(frame);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting =
    nav.state === "submitting" && nav.formData?.get("action") === "delete";
  // [END state]

  const navigate = useNavigate();

  // [START select-products]
  async function selectProducts() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
      // selectionIds: ['gid://shopify/Product/1']
    });

    if (products) {
      setFormState({
        ...formState,
        products,
      });
    }
  }
  // [END select-products]

  // [START save]
  const submit = useSubmit();
  function handleSave() {
    const data = {
      title: formState.title,
      image: formState.image,
      button: formState.button,
      products: formState.products,
      matchingCriteria: formState.matchingCriteria,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }
  // [END save]

  // [START polaris]
  return (
    <Page>
      {/* [START breadcrumbs] */}
      <ui-title-bar title={frame.id ? "Edit Frame" : "Create new Frame"}>
        <button variant="breadcrumb" onClick={() => navigate("/app/frames/home")}>
          Frames
        </button>
      </ui-title-bar>
      {/* [END breadcrumbs] */}
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* [START basic-information] */}
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Basic information
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="Title"
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) => setFormState({ ...formState, title })}
                  error={errors.title}
                />
                <TextField
                  id="image"
                  helpText="Go to 'Content -> Files' to upload your file and then paste the link here"
                  label="Image"
                  autoComplete="off"
                  value={formState.image}
                  onChange={(image) => setFormState({ ...formState, image })}
                  error={errors.image}
                />
                <TextField
                  id="button"
                  helpText="Text for the main Frame button"
                  label="Button"
                  autoComplete="off"
                  value={formState.button}
                  onChange={(button) => setFormState({ ...formState, button })}
                  error={errors.button}
                />
              </BlockStack>
            </Card>
            {/* [END basic-information] */}
            <Card>
              <BlockStack gap="500">
                {/* [START products] */}
                <InlineStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Products
                  </Text>
                  {formState.products.length > 0 ? (
                    <Button variant="plain" onClick={selectProducts}>
                      Change products
                    </Button>
                  ) : null}
                </InlineStack>
                {formState.products.length > 0 ? (
                  <InlineStack blockAlign="center" gap="100">
                    <Text as="span">
                      Selected products:
                    </Text>
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.products.length}
                    </Text>
                  </InlineStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={selectProducts} id="select-products">
                      Select products
                    </Button>
                    {errors.products ? (
                      <InlineError
                        message={errors.products}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </BlockStack>
                )}
                {/* [END products] */}
              </BlockStack>
            </Card>
            {/* [START matching-criteria] */}
            <Card>
              <BlockStack gap="500">
                <Text as={"h2"} variant="headingLg">
                  Matching Criteria
                </Text>
                <ChoiceList
                  title="Choose how to match products"
                  choices={[
                    {
                      label: "Use Receipts.xyz - Running sessions",
                      value: "RECEIPTS_XYZ_ALL_TIME_RUNNING"
                    },
                    {
                      label: "Use Coinbase Onchain Verifications - Country of residence",
                      value: "COINBASE_ONCHAIN_VERIFICATIONS_COUNTRY",
                    },
                    {
                      label: "Use Coinbase Onchain Verifications - Standard account",
                      value: "COINBASE_ONCHAIN_VERIFICATIONS_ACCOUNT",
                    },
                    {
                      label: "Use Coinbase Onchain Verifications - One account",
                      value: "COINBASE_ONCHAIN_VERIFICATIONS_ONE",
                    },
                    {
                      label: "Use user's POAPs owned",
                      value: "POAPS_OWNED",
                    },
                    {
                      label: "Use all onchain criteria at the same time (Experimental)",
                      value: "ALL",
                    },
                  ]}
                  selected={[formState.matchingCriteria]}
                  onChange={(matchingCriteria) =>
                    setFormState({
                      ...formState,
                      matchingCriteria: matchingCriteria[0],
                    })
                  }
                  error={errors.matchingCriteria}
                />
                {formState.matchingCriteria === 'RECEIPTS_XYZ_ALL_TIME_RUNNING' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, products of a specific sport type will be recommended to users who have tracked an activity of the sport type.
                    For example, if a user tracked a running activity lately, running sportswear will be recommended and shown on the user’s frame.
                  </Text>
                ) : null}
                {formState.matchingCriteria === 'COINBASE_ONCHAIN_VERIFICATIONS_COUNTRY' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, products marked for a specific country will be recommended to users who have verified their country of residence using Coinbase Onchain Verification.
                    For example, if a user has verified Canada as his country of residence, Canadian products will be recommended and shown on the user’s frame.
                  </Text>
                ) : null}
                {formState.matchingCriteria === 'COINBASE_ONCHAIN_VERIFICATIONS_ACCOUNT' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, special products marked for Coinbase members will be recommended to them using Coinbase Onchain Verification.
                    For example, if a user is a member of Coinbase, special products will be recommended and shown on the user’s frame.
                  </Text>
                ) : null}
                {formState.matchingCriteria === 'COINBASE_ONCHAIN_VERIFICATIONS_ONE' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, special products marked for Coinbase One members will be recommended to them using Coinbase Onchain Verification.
                    For example, if a user is a member of Coinbase One, special products will be recommended and shown on the user’s frame.
                  </Text>
                ) : null}
                {formState.matchingCriteria === 'POAPS_OWNED' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, products marked for a specific POAP will be recommended to users who have verified their POAPs owned.
                    For example, if a user has verified a specific POAP, products related to the POAP will be recommended and shown on the user’s frame.
                  </Text>
                ) : null}
                {formState.matchingCriteria === 'ALL' ? (
                  <Text as="p" variant="bodyMd">
                    By using this matching criteria, products will be recommended to users based on their onchain data automatically.
                    This is an experimental feature and may not work as expected.
                  </Text>
                ) : null}
              </BlockStack>
            </Card>
            {/* [END matching-criteria] */}
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          {/* [START preview] */}
          <Card>
            <Text as={"h2"} variant="headingLg">
              Frame
            </Text>
            <br />
            {/* {frame ? (
              <EmptyState image={frame.image} imageContained={true} />
            ) : (
              <EmptyState image="">
                Your Frame will appear here after you save
              </EmptyState>
            )} */}
            <BlockStack gap="300">
              {/* <Button
                disabled={!frame?.image}
                url={frame?.image}
                download
                variant="primary"
              >
                Download
              </Button> */}
              <Button
                disabled={!frame.id}
                url={`https://warpcast.com/~/compose?text=Check%20out%20our%20new%20collection!&embeds[]=${env.targetOnchainUrl}/api/frame/${frame.id}/html`}
                target="_blank"
                variant="primary"
              >
                Cast on Warpcast
              </Button>
              <Button
                disabled={!frame.id}
                url={`https://warpcast.com/~/developers/frames?url=${env.targetOnchainUrl}/api/frame/${frame.id}/html?dev=true`}
                target="_blank"
              >
                Live Preview
              </Button>
            </BlockStack>
          </Card>
          {/* [END preview] */}
        </Layout.Section>
        {/* [START actions] */}
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !frame.id || !frame || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () =>
                  submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
        {/* [END actions] */}
      </Layout>
      <FooterHelp>
        Learn more about{' '}
        <Link to={`${env.targetOnchainUrl}/support`} target="_blank">
          frames
        </Link>
      </FooterHelp>
    </Page>
  );
  // [END polaris]
}
