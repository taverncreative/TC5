export const metadata = {
  title: "About Us",
  description: "Award-winning wedding stationery studio based in Kent.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
        About Tavern Creative
      </h1>

      <div className="mt-8 prose prose-lg text-[var(--tc-gray-600)] leading-relaxed space-y-6">
        <p>
          We are an award-winning wedding stationery studio based in Kent,
          crafting beautiful printed stationery for couples who care about the
          details.
        </p>
        <p>
          Every piece is designed with intention and printed on premium paper
          stocks. From save the dates to thank you cards, we handle the entire
          journey.
        </p>
        <p>
          Our personalisation tool lets you customise your stationery online,
          see an instant preview, and order with confidence knowing that what
          you see is exactly what you will receive.
        </p>

        <h2 className="font-heading text-xl font-semibold text-[var(--tc-black)] !mt-12">
          How We Work
        </h2>
        <ol className="space-y-4 list-decimal list-inside">
          <li>
            <strong>Choose a design</strong> from our curated collection.
          </li>
          <li>
            <strong>Personalise it</strong> with your names, dates, and details.
          </li>
          <li>
            <strong>Approve your proof</strong> to make sure everything is
            perfect.
          </li>
          <li>
            <strong>We print and deliver</strong> your stationery on beautiful
            paper.
          </li>
        </ol>

        <h2 className="font-heading text-xl font-semibold text-[var(--tc-black)] !mt-12">
          Our Promise
        </h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>Premium paper stocks only</li>
          <li>What you see is what you get - our proofs are accurate</li>
          <li>Fast, careful delivery across the UK</li>
          <li>5-star service from start to finish</li>
        </ul>
      </div>
    </div>
  );
}
