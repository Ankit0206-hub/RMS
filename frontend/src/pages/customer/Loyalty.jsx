import { ArrowLeft, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "../../components/customer/layout/MobileContainer";

const rewards = [
  {
    id: 1,
    title: "Free Dessert",
    points: "500 Points",
  },
  {
    id: 2,
    title: "20% Discount",
    points: "800 Points",
  },
  {
    id: 3,
    title: "Free Beverage",
    points: "300 Points",
  },
];

export default function Loyalty() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-slate-800/50 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">
            Loyalty & Rewards
          </h1>
        </div>

        {/* Reward Card */}
        <div className="p-5">
          <div className="rounded-3xl bg-linear-to-r from-orange-500 to-orange-600 p-6 text-white shadow-lg">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  Your Reward Points
                </p>

                <h2 className="mt-2 text-4xl font-bold">
                  1,250
                </h2>
              </div>

              <Gift size={44} />
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span>Next Reward</span>
                <span>1500 pts</span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-orange-300">
                <div className="h-full w-4/5 rounded-full bg-white dark:bg-slate-900"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Rewards */}
        <div className="px-5 pb-6">

          <h2 className="mb-4 text-lg font-semibold">
            Available Rewards
          </h2>

          <div className="space-y-4">

            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <Star className="text-orange-500" size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {reward.title}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {reward.points}
                    </p>
                  </div>

                </div>

                <button className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600">
                  Redeem
                </button>

              </div>
            ))}

          </div>

        </div>

      </div>
    </MobileContainer>
  );
}