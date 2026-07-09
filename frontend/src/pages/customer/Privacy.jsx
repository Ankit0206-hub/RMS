import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-gray-50">
      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="bg-white shadow-sm px-5 py-4 flex items-center">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Privacy Policy
          </h1>

        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-5">

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

            <section>

              <h2 className="font-semibold text-lg">
                Information We Collect
              </h2>

              <p className="mt-2 text-gray-600 leading-7">
                We collect your basic information such as your name,
                phone number, email address and order history to
                improve your food ordering experience.
              </p>

            </section>

            <section>

              <h2 className="font-semibold text-lg">
                How We Use Your Information
              </h2>

              <p className="mt-2 text-gray-600 leading-7">
                Your information is used to process orders,
                improve our services, provide customer support
                and personalize your experience.
              </p>

            </section>

            <section>

              <h2 className="font-semibold text-lg">
                Data Security
              </h2>

              <p className="mt-2 text-gray-600 leading-7">
                We use appropriate security measures to protect
                your personal information against unauthorized
                access, disclosure or misuse.
              </p>

            </section>

            <section>

              <h2 className="font-semibold text-lg">
                Contact
              </h2>

              <p className="mt-2 text-gray-600 leading-7">
                If you have any questions regarding our Privacy
                Policy, please contact our support team.
              </p>

            </section>

          </div>

        </div>

      </div>
    </PageLayout>
  );
}