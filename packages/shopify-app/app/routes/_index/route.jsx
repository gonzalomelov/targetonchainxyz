import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import indexStyles from "./style.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
}

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className="index">
      <div className="content">
        <h1>Onchain Hyper-Personalized Commerce</h1>
        <p>Deliver personalized products to your users based on their onchain data.</p>
        {showForm && (
          <Form method="post" action="/auth/login">
            <label>
              <span>Shop domain</span>
              <input type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button type="submit">Log in</button>
          </Form>
        )}
        <ul>
          <li>
            <strong>Hyper-Personalization</strong>. Use onchain data to deliver tailored product recommendations to each customer.
          </li>
          <li>
            <strong>Seamless Integration</strong>. Easily sync and manage personalized frames within your Shopify store.
          </li>
          <li>
            <strong>Enhanced Marketing</strong>. Boost engagement and sales with targeted, relevant product suggestions.
          </li>
        </ul>
      </div>
    </div>
  );
}
