import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "../../components/customer/layout/MobileContainer";

const items = [
  {
    icon: CircleHelp,
    title: "FAQs",
    subtitle: "Find answers instantly",
  },
  {
    icon: MessageCircle,
    title: "Chat with us",
    subtitle: "We're here to help",
  },
  {
    icon: Phone,
    title: "Call us",
    subtitle: "+91 98765 43210",
  },
  {
    icon: Mail,
    title: "Email us",
    subtitle: "support@tastybites.com",
  },
];

export default function Help() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex h-full flex-col bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">Help &amp; Support</h1>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pt-6">
          <h2 className="text-2xl font-bold text-gray-900">
            How can we help you?
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose one of the options below.
          </p>

          <div className="mt-8 space-y-4">
            {items.map(({ icon: Icon, title, subtitle }) => (
              <button
                key={title}
                className="flex w-full items-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-400"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <Icon size={22} className="text-orange-500" />
                </div>

                <div className="ml-4 flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">{subtitle}</p>
                </div>

                <ChevronRight className="text-gray-400" size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}