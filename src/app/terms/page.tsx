import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2026</p>

      <section className="space-y-6 text-sm leading-7 text-gray-300">
        <div>
          <h2 className="text-base font-semibold text-white mb-2">1. Informational Use Only</h2>
          <p>
            QuakePulse provides earthquake data sourced from the USGS for informational purposes
            only. This data must not be used as a basis for emergency response, safety-critical
            decisions, or any application where accuracy is safety-relevant. Always refer to
            official government sources and emergency services in disaster situations.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">2. Data Accuracy</h2>
          <p>
            Earthquake data is provided as-is from the USGS. QuakePulse makes no representations
            regarding the completeness, accuracy, or timeliness of the data displayed.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">3. No Warranty</h2>
          <p>
            This service is provided "as is" without warranty of any kind. We do not guarantee
            continuous availability or absence of errors.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-2">4. Limitation of Liability</h2>
          <p>
            QuakePulse shall not be liable for any damages arising from use of or reliance on the
            information provided on this site.
          </p>
        </div>
      </section>
    </main>
  );
}
