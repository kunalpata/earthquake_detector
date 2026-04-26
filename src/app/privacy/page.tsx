import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quakepulse.com";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {today}</p>

      <section className="space-y-6 text-sm leading-7 text-gray-300">
        <div>
          <h2 className="text-base font-semibold text-white mb-2">1. Information We Collect</h2>
          <p>
            QuakePulse does not collect or store any personally identifiable information. The site
            displays publicly available earthquake data from the United States Geological Survey
            (USGS) and does not require account creation.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">2. Third-Party Advertising</h2>
          <p>
            We use Google AdSense to display advertisements. Google may use cookies and similar
            technologies to serve ads based on your prior visits to this site and other sites on the
            Internet. You may opt out of personalised advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Google Ad Settings
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">3. Cookies</h2>
          <p>
            Google AdSense and analytics tools may place cookies on your device. These cookies are
            used to deliver relevant advertisements and measure their performance. You can disable
            cookies in your browser settings at any time.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">4. Data Sources</h2>
          <p>
            All earthquake data is sourced from the{" "}
            <a
              href="https://earthquake.usgs.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              USGS Earthquake Hazards Program
            </a>{" "}
            and is subject to their terms of use.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">5. Contact</h2>
          <p>
            For privacy-related questions, contact us at the address listed on our site at{" "}
            <a href={siteUrl} className="text-blue-400 underline">
              {siteUrl}
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
