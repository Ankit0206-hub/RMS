import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "../../components/customer/layout/MobileContainer";

export default function Logout() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex h-full flex-col items-center justify-center bg-white dark:bg-slate-900 px-8">

        {/* Icon */}
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-gray-200 dark:border-slate-700">
          <LogOut size={54} className="text-gray-700 dark:text-slate-300" />
        </div>

        {/* Text */}
        <h2 className="mt-10 text-2xl font-semibold text-gray-900 dark:text-white">
          Are you sure you want
          <br />
          to logout?
        </h2>

        <p className="mt-4 text-center text-sm leading-6 text-gray-500 dark:text-slate-400">
          You'll need to sign in again to access
          <br />
          your account.
        </p>

        {/* Buttons */}
        <div className="mt-12 w-full space-y-4">

          <button
            className="w-full rounded-xl bg-red-500 py-3 text-base font-semibold text-white transition hover:bg-red-600"
            onClick={() => {
              // TODO: Clear auth and redirect to splash/login
              navigate("/customer/splash");
            }}
          >
            Yes, Logout
          </button>

          <button
            onClick={() => navigate('/customer/profile')}
            className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-3 text-base font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
          >
            Cancel
          </button>

        </div>

      </div>
    </MobileContainer>
  );
}