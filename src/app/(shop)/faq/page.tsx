import { Card } from "@/components/ui/card";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about our wedding stationery.",
};

const faqs = [
  {
    question: "How does personalisation work?",
    answer:
      "Choose your design, click 'Personalise This Design', and you'll be taken to our editor. Add your names, dates, and details. Your changes appear instantly on the preview. When you're happy, proceed to order prints.",
  },
  {
    question: "Is personalisation free?",
    answer:
      "Yes! You can personalise and preview any design for free. You only pay when you order printed copies.",
  },
  {
    question: "What paper stocks do you offer?",
    answer:
      "We offer a range of premium stocks including Cotton 350gsm (soft, tactile finish), Silk 400gsm (smooth with vibrant colours), Textured 300gsm (linen texture for a classic feel), and Recycled 350gsm (eco-friendly option).",
  },
  {
    question: "How long does printing take?",
    answer:
      "Standard production time is 5-7 working days. We offer express 2-3 day production for urgent orders. Delivery is usually 1-2 days after dispatch.",
  },
  {
    question: "Can I see a proof before printing?",
    answer:
      "Absolutely. You can generate a proof PDF at any time during personalisation. We recommend checking your proof carefully before ordering - what you see is what we print.",
  },
  {
    question: "What if I need to make changes after ordering?",
    answer:
      "Please contact us as soon as possible. If your order hasn't entered production, we can usually accommodate changes. Once printing has started, changes are not possible.",
  },
  {
    question: "Do you deliver internationally?",
    answer:
      "Currently we deliver across the United Kingdom. For international orders, please contact us and we'll see what we can arrange.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, Apple Pay, Google Pay, and Klarna through our secure Stripe checkout.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
        Frequently Asked Questions
      </h1>

      <div className="mt-8 space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i}>
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm text-[var(--tc-gray-600)] leading-relaxed">
              {faq.answer}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
