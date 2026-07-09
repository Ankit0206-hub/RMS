import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";

const coupons = [
  {
    code: "FLAT20",
    title: "Get 20% OFF on all orders above ₹300",
    expiry: "Valid till 31 May 2024",
    bg: "from-orange-50 to-amber-100",
  },
  {
    code: "WELCOME10",
    title: "Get 10% OFF on your first order",
    expiry: "Valid till 31 May 2024",
    bg: "from-pink-50 to-purple-100",
  },
  {
    code: "FREEDESSERT",
    title: "Get free dessert on orders above ₹700",
    expiry: "Valid till 31 May 2024",
    bg: "from-slate-100 to-gray-200",
  },
];

export default function Offers() {
  return (
    <PageLayout>
      <div className="flex h-full flex-col bg-white">
        {/* Title */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Offers & Coupons
          </h1>
        </div>

        {/* Coupons */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className={`rounded-3xl bg-linear-to-r ${coupon.bg} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold tracking-wide text-gray-900">
                    {coupon.code}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {coupon.title}
                  </p>

                  <p className="mt-5 text-xs text-gray-500">
                    {coupon.expiry}
                  </p>
                </div>

                <button className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    </PageLayout>
  );
}