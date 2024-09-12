import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function Index() {
  return (
    <>
      <p>
        Looking to REALLY sell your products on Farcaster?{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://apps.shopify.com/target-onchain"
        >
          onchaintarget.xyz
        </a>{' '}
        can help you achieve it.
      </p>
      <p>
        Follow{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://warpcast.com/gonzalomelov.eth"
          target="_blank"
        >
          @gonzalomelov on Warpcast
        </a>{' '}
        for updates and more information about new features.
      </p>
      {/* <p>
        Our sponsors&apos; exceptional support has made this project possible.
        Their services integrate seamlessly with the boilerplate, and we
        recommend trying them out.
      </p>
      <h2 className="mt-5 text-2xl font-bold">Sponsors</h2>
      <Sponsors /> */}
      <h2 className="mt-5 text-2xl font-bold">
        What is Onchain Hyper-Personalization?
      </h2>
      <p className="text-base">
        <span role="img" aria-label="rocket">
          🚀
        </span>{' '}
        Onchain Hyper-Personalization leverages onchain data to deliver
        personalized product recommendations. Our Shopify App allows you to cast
        hyper-personalized Farcaster frames, ensuring your products reach the
        right audience at the right time.{' '}
        {/* <span role="img" aria-label="zap">
          ⚡️
        </span>{' '}
        Made with developer experience first: Next.js, TypeScript, ESLint,
        Prettier, Husky, Lint-Staged, Jest (replaced by Vitest), Testing
        Library, Commitlint, VSCode, PostCSS, Tailwind CSS, Authentication with{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://clerk.com?utm_source=github&amp;utm_medium=sponsorship&amp;utm_campaign=nextjs-boilerplate"
          target="_blank"
        >
          Clerk
        </a>
        , Database with DrizzleORM (SQLite, PostgreSQL, and MySQL) and{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://turso.tech/?utm_source=nextjsstarterbp"
          target="_blank"
        >
          Turso
        </a>
        , Error Monitoring with{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://sentry.io/for/nextjs/?utm_source=github&amp;utm_medium=paid-community&amp;utm_campaign=general-fy25q1-nextjs&amp;utm_content=github-banner-nextjsboilerplate-logo"
          target="_blank"
        >
          Sentry
        </a>
        , Logging with Pino.js and Log Management with{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://betterstack.com/?utm_source=github&amp;utm_medium=sponsorship&amp;utm_campaign=next-js-boilerplate"
          target="_blank"
        >
          Better Stack
        </a>
        , Monitoring as Code with Checkly, Storybook, Multi-language (i18n), and
        more. */}
      </p>
      {/*
        We are using <img> here because next/image cannot be
        used in server-side code within ImageResponse. This
        is necessary to generate dynamic images on the server.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mt-5"
        src="https://i.imgur.com/HwF6LA3.gif"
        alt="Onchain Hyper-Personalization"
      />
      <h2 className="mt-5 text-2xl font-bold">How It Works</h2>
      <ul className="ml-5 list-disc">
        <li>
          Track Activity: Users track their activities on platforms like Strava.
        </li>
        <li>
          Attest Onchain: They use Receipts.xyz to attest to their activities
          onchain using EAS.
        </li>
        <li>
          Create Frames: Merchants use our Shopify App to create and cast
          personalized Farcaster frames based on users&apos; onchain activity.
        </li>
        <li>
          Personalized Recommendations: Users see these frames on Farcaster,
          showcasing products tailored to their interests and activities.
        </li>
      </ul>
      <h2 className="mt-5 text-2xl font-bold">Real-World Example</h2>
      <p className="text-base">
        <span role="img" aria-label="rocket">
          👩‍💻
        </span>{' '}
        Imagine Alice from Nike launching a new line of fitness products. Using
        Target Onchain, Alice creates a frame in the Shopify Admin, selects the
        products that will be recommended their customers, and finally cast it
        on Farcaster.{' '}
      </p>
      {/*
        We are using <img> here because next/image cannot be
        used in server-side code within ImageResponse. This
        is necessary to generate dynamic images on the server.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mt-5"
        src="https://i.imgur.com/gl0jFpZ.gif"
        alt="Onchain Hyper-Personalization"
      />
      <p className="text-base">
        <span role="img" aria-label="rocket">
          🎯
        </span>{' '}
        Bob, a loyal customer and runner, tracks his runs on Strava and attests
        to them onchain using Receipts.xyz. Nike uses the Onchain
        Hyper-Personalization Shopify App to create a Farcaster frame showcasing
        their latest running shoes. When Bob checks Farcaster, he sees a
        personalized recommendation for running shoes based on his onchain data.{' '}
      </p>
      {/*
        We are using <img> here because next/image cannot be
        used in server-side code within ImageResponse. This
        is necessary to generate dynamic images on the server.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mt-5"
        src="https://i.imgur.com/0ovFAvg.gif"
        alt="Onchain Hyper-Personalization"
      />
      <h2 className="mt-5 text-2xl font-bold">Key Features</h2>
      <ul className="ml-5 list-disc">
        <li>
          Customizable Frames: Create and customize Farcaster frames from your
          Shopify admin panel.
        </li>
        <li>
          Onchain Data Integration: Use onchain activity data to tailor product
          recommendations.
        </li>
        <li>
          Real-Time Updates: Ensure recommendations are up-to-date with
          users&apos; latest onchain activities.
        </li>
        <li>
          Analytics Dashboard: Track frame performance and understand customer
          engagement.
        </li>
      </ul>
      <h2 className="mt-5 text-2xl font-bold">
        Why Choose Onchain Hyper-Personalization?
      </h2>
      <ul className="ml-5 list-disc">
        <li>
          Increased Engagement: Show customers the products they are most likely
          to be interested in.
        </li>
        <li>
          Higher Conversion Rates: Personalized recommendations lead to better
          conversion rates.
        </li>
        <li>
          Enhanced Customer Experience: Provide a tailored shopping experience
          for your users.
        </li>
      </ul>
      <h2 className="mt-5 text-2xl font-bold">Get Started</h2>
      <p>Ready to take your product recommendations to the next level? </p>
      <button
        className="text-blue-700 hover:border-b-2 hover:border-blue-700"
        type="button"
      >
        <a
          href="https://apps.shopify.com/target-onchain"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Target Onchain
        </a>
      </button>
      <p>
        Have questions or need help? Reach out to us at{' '}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="mailto:gonzalomelov@gmail.com"
        >
          Email us!
        </a>
      </p>
    </>
  );
}
