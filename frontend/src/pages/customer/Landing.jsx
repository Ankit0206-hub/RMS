import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageLayout className="bg-white flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-5 py-1">

        <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-8">

          {/* Heading */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Welcome to
            </p>

            <h1 className="mt-1 text-4xl font-bold italic text-orange-500">
              TastyBites
            </h1>

            <p className="mt-1 text-[10px] uppercase tracking-[4px] text-gray-400">
              Restaurant
            </p>
          </div>

          {/* QR Code */}
          <div className="mt-8 flex justify-center">
            <div className="rounded-2xl bg-white p-3 border border-gray-100 shadow-sm">

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=TastyBites"
                alt="QR Code"
                className="h-40 w-40"
              />

            </div>
          </div>

          {/* Description */}
          <p className="mt-6 text-center text-sm leading-6 text-gray-500">
            Scan the QR code on your table
            <br />
            to begin your dining experience
          </p>

          {/* Table Number */}
          <div className="mt-7 text-center">
            <p className="text-sm text-gray-500">
              Table Number
            </p>

            <h2 className="mt-2 text-4xl font-bold text-orange-500">
              12
            </h2>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => navigate("/customer/customer")}
            className="mt-8 h-11 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Continue
          </button>

        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />

    </PageLayout>
  );
}