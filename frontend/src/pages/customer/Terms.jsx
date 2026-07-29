import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50">
      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="bg-white dark:bg-slate-900 shadow-sm px-5 py-4 flex items-center">

          <button onClick={() => navigate('/customer/settings')}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Terms & Conditions
          </h1>

        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-5">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 space-y-6">

            <section>

              <h2 className="text-lg font-semibold">
                1. User Responsibilities
              </h2>

              <p className="mt-2 text-gray-600 dark:text-slate-400 leading-7">
                Users must provide accurate information while placing
                orders and use the application responsibly.
              </p>

            </section>

            <section>

              <h2 className="text-lg font-semibold">
                2. Ordering Policy
              </h2>

              <p className="mt-2 text-gray-600 dark:text-slate-400 leading-7">
                Orders placed through TastyBites are sent directly to
                the restaurant and are processed as quickly as possible.
              </p>

            </section>

            <section>

              <h2 className="text-lg font-semibold">
                3. Payments
              </h2>

              <p className="mt-2 text-gray-600 dark:text-slate-400 leading-7">
                Customers may pay using Cash, UPI, Cards, Wallets or
                Net Banking depending on restaurant availability.
              </p>

            </section>

            <section>

              <h2 className="text-lg font-semibold">
                4. Cancellation & Refunds
              </h2>

              <p className="mt-2 text-gray-600 dark:text-slate-400 leading-7">
                Orders can only be cancelled before preparation begins.
                Refund eligibility depends on the restaurant's policy.
              </p>

            </section>

            <section>

              <h2 className="text-lg font-semibold">
                5. Limitation of Liability
              </h2>

              <p className="mt-2 text-gray-600 dark:text-slate-400 leading-7">
                TastyBites acts as a digital ordering platform. Product
                quality, preparation time and food safety remain the
                responsibility of the restaurant.
              </p>

            </section>

          </div>

        </div>

      </div>

    </PageLayout>
  );
}