import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I upload my test results?",
    answer: "You don't! Results are automatically uploaded by your healthcare provider when you provide your Member ID during testing. This ensures authenticity and security. Simply create an account, get your Member ID, and provide it to your partnered clinic when you get tested."
  },
  {
    question: "What if my clinic isn't partnered with MyHealthStatus?",
    answer: "We're constantly expanding our network of partnered clinics. You can request your clinic join our platform through our partnership page. We're actively working with healthcare providers nationwide to make MyHealthStatus available everywhere. Contact us if you'd like to help bring MyHealthStatus to your preferred clinic."
  },
  {
    question: "How long does it take to receive results?",
    answer: "Most results appear in your account within 24-48 hours of testing, depending on the lab processing time. You'll receive an instant notification as soon as your healthcare provider uploads your results to your MyHealthStatus account."
  },
  {
    question: "Is my information really secure?",
    answer: "Yes. We use bank-level encryption, are fully HIPAA compliant, and never sell or share your data. All results are encrypted both at rest and in transit. You have complete control over who sees your results and for how long. Every access to your shared results is logged and tracked."
  },
  {
    question: "Can I share results from other sources?",
    answer: "Currently, only results from partnered healthcare providers appear in MyHealthStatus to ensure verification and prevent tampering. This guarantees that every result is authentic and traceable to its source. We're exploring verified upload options for existing results in the future."
  },
  {
    question: "How does my partner verify results?",
    answer: "When you share via QR code or encrypted link, your partner can instantly verify the results are authentic. They'll see when you were tested, what tests were performed, the results, and confirmation that the data came directly from a licensed healthcare provider. Your unique Member ID ensures complete authenticity."
  },
  {
    question: "What happens if I lose access to my account?",
    answer: "You can easily recover your account through our secure recovery process. Your results and Member ID remain safe in our encrypted system. We use multi-factor authentication and other security measures to ensure only you can access your account."
  },
  {
    question: "Can I revoke access to shared results?",
    answer: "Absolutely. You have complete control over your shared results. You can revoke access at any time, set expiration dates (from 1 hour to 30 days), and track exactly when and where your results were accessed. Your data, your control."
  },
  {
    question: "What is the pilot program?",
    answer: "Our pilot program allows the first 100 users to access MyHealthStatus with lifetime premium benefits while helping us refine the platform. Pilot members get exclusive features, priority support, and direct input on our roadmap. Spots are limited to ensure quality and personalized support."
  },
  {
    question: "What happens after the pilot is full?",
    answer: "Once we reach 100 pilot members, new interested users will be notified when additional spots become available. We'll send notifications as we expand capacity to ensure everyone gets access to our platform."
  },
  {
    question: "What do Founding Members get?",
    answer: "Founding Members receive free lifetime premium access (normally $99/year), exclusive badges, priority support, early access to new features, and direct input on our product roadmap through quarterly feedback sessions."
  },
  {
    question: "Where does the statistics data come from?",
    answer: "Our statistics are compiled from CDC reports, WHO data, and state health departments. All data is publicly available and cited. We update our dashboards quarterly to reflect the latest public health information."
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
            <ChevronDown
              size={24}
              className={`text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {openIndex === index && (
            <div className="px-6 pb-6">
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed mt-4">{faq.answer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
