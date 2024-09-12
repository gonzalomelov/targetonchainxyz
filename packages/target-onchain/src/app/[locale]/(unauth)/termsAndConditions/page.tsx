import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'TermsAndConditions',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function TermsAndConditions() {
  // const t = useTranslations('TermsAndConditions');

  return (
    <>
      <h1 className="text-3xl font-bold">Terms and Conditions</h1>
      <p>Last Updated: 18/6/2024</p>
      <p>
        Welcome to the Onchain Hyper-Personalization Shopify App. Please read
        these Terms and Conditions (&quot;Terms&quot;) carefully before using
        services. By using our app, you agree to be bound by these Terms.
      </p>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Onchain Hyper-Personalization Shopify App (the
        &quot;Service&quot;), you agree to comply with and be bound by these
        Terms and all applicable laws and regulations. If you do not agree with
        these Terms, you are prohibited from using or accessing this Service.
      </p>
      <h2>2. Description of Service</h2>
      <p>
        The Service allows Shopify merchants to create and cast personalized
        product recommendation frames on Farcaster, using onchain data to tailor
        the recommendations to individual users.
      </p>
      <h2>3. Eligibility</h2>
      <p>
        You must be at least 18 years old to use the Service. By using the
        Service, you represent and warrant that you are at least 18 years old
        and have the legal capacity to enter into these Terms.
      </p>
      <h2>4. Account Registration</h2>
      <p>
        To access certain features of the Service, you may be required to
        register for an account. You agree to provide accurate, current, and
        complete information during the registration process and to update such
        information to keep it accurate, current, and complete. You are
        responsible for safeguarding your account password and for all
        activities that occur under your account.
      </p>
      <h2>5. Use of the Service</h2>
      <p>
        You agree to use the Service only for lawful purposes and in accordance
        with these Terms. You agree not to:
      </p>
      <p>
        Use the Service in any way that violates any applicable federal, state,
        local, or international law or regulation.
      </p>
      <p>
        Engage in any conduct that restricts or inhibits anyone&apos;s use or
        enjoyment of the Service, or which, as determined by us, may harm the
        Service or users of the Service, or expose them to liability.
      </p>
      <p>
        Use the Service in any manner that could disable, overburden, damage, or
        impair the Service or interfere with any other party&apos;s use of the
        Service.
      </p>
      <h2>6. Fees and Payments</h2>
      <p>
        Certain features of the Service may be provided for a fee. You agree to
        pay all applicable fees as described on our website in connection with
        such features. We reserve the right to change our fees at any time.
      </p>
      <h2>7. Intellectual Property</h2>
      <p>
        The Service and its entire contents, features, and functionality
        (including but not limited to all information, software, text, displays,
        images, video, and audio, and the design, selection, and arrangement
        thereof) are owned by Onchain Hyper-Personalization, its licensors, or
        other providers of such material and are protected by international
        copyright, trademark, patent, trade secret, and other intellectual
        property or proprietary rights laws.
      </p>
      <h2>8. Privacy</h2>
      <p>
        Your use of the Service is also governed by our Privacy Policy. Please
        review our Privacy Policy, which also governs the Service and informs
        users of our data collection practices.
      </p>
      <h2>9. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the Service
        immediately, without prior notice or liability, under our sole
        discretion, for any reason whatsoever and without limitation, including
        but not limited to a breach of the Terms.
      </p>
      <h2>10. Limitation of Liability</h2>
      <p>
        In no event shall Onchain Hyper-Personalization, nor its directors,
        employees, partners, agents, suppliers, or affiliates, be liable for any
        indirect, incidental, special, consequential, or punitive damages,
        including without limitation, loss of profits, data, use, goodwill, or
        other intangible losses, resulting from (i) your use or inability to use
        the Service; (ii) any unauthorized access to or use of our servers
        and/or any personal information stored therein; (iii) any interruption
        or cessation of transmission to or from the Service; (iv) any bugs,
        viruses, trojan horses, or the like that may be transmitted to or
        through our Service by any third party; (v) any errors or omissions in
        any content or for any loss or damage incurred as a result of the use of
        any content posted, emailed, transmitted, or otherwise made available
        through the Service; and/or (vi) any other matter related to the
        Service.
      </p>
      <h2>11. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws
        of Uruguay, without regard to its conflict of law provisions.
      </p>
      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. If a revision is material, we will provide at least
        30 days&apos; notice prior to any new terms taking effect. What
        constitutes a material change will be determined at our sole discretion.
      </p>
      <h2>13. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at
        gonzalomelov@gmail.com.
      </p>
      <h3>
        By using the Onchain Hyper-Personalization Shopify App, you acknowledge
        that you have read, understood, and agree to be bound by these Terms of
        Service.
      </h3>

      {/* <p>{t('terms_and_conditions_paragraph')}</p> */}

      {/* <div className="mt-2 text-center text-sm">
        {`${t('translation_powered_by')} `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://l.crowdin.com/next-js"
          target="_blank"
        >
          Crowdin
        </a>
      </div>

      <a href="https://l.crowdin.com/next-js" target="_blank">
        <Image
          className="mx-auto mt-2"
          src="https://support.crowdin.com/assets/logos/core-logo/svg/crowdin-core-logo-cDark.svg"
          alt="Crowdin Translation Management System"
          width={130}
          height={112}
        />
      </a> */}
    </>
  );
}
