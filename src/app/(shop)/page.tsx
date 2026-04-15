import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[var(--tc-blush-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-[var(--tc-black)] leading-tight">
              Beautiful wedding stationery, personalised by you
            </h1>
            <p className="mt-6 text-lg text-[var(--tc-gray-600)] leading-relaxed">
              Choose your design, add your details, and we will print and deliver
              stunning stationery for your special day.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md bg-[var(--tc-black)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--tc-gray-800)] transition-colors"
              >
                Browse Designs
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-[var(--tc-gray-300)] bg-white px-6 py-3 text-sm font-medium text-[var(--tc-black)] hover:bg-[var(--tc-gray-50)] transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-center text-[var(--tc-black)]">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Choose Your Design",
                description:
                  "Browse our collection of beautifully crafted templates across all stationery types.",
              },
              {
                step: "2",
                title: "Personalise It",
                description:
                  "Add your names, details, and choose your colours. See your design come to life instantly.",
              },
              {
                step: "3",
                title: "We Print & Deliver",
                description:
                  "Approve your proof, select your paper and quantity, and we will handle the rest.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tc-sage-light)]">
                  <span className="text-lg font-semibold text-[var(--tc-gray-800)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--tc-black)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--tc-gray-500)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[var(--tc-gray-50)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-center text-[var(--tc-black)]">
            Shop by Category
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group block rounded-lg border border-[var(--tc-gray-200)] bg-white p-8 text-center hover:border-[var(--tc-sage)] hover:shadow-sm transition-all"
              >
                <h3 className="font-heading text-lg font-medium text-[var(--tc-black)] group-hover:text-[var(--tc-sage)]">
                  {cat.label}
                </h3>
                <p className="mt-2 text-sm text-[var(--tc-gray-400)]">
                  View collection
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-semibold text-[var(--tc-black)]">270+</p>
              <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
                5-Star Google Reviews
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--tc-black)]">Award Winning</p>
              <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
                Kent Wedding Studio
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--tc-black)]">Premium Print</p>
              <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
                Luxury Paper Stocks
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
