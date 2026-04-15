import Image from "next/image";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { testimonials } from "@/lib/content/testimonials";

const categoryImages: Record<string, string> = {
  "save-the-date": "/images/brand/cat-save-the-date.webp",
  invitation: "/images/brand/cat-invitation.webp",
  "on-the-day": "/images/brand/cat-on-the-day.webp",
  "thank-you": "/images/brand/cat-thank-you.webp",
};

export default function HomePage() {
  const featuredTestimonial = testimonials[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative -mt-16 h-[82vh] min-h-[560px] max-h-[820px] w-full overflow-hidden">
        <Image
          src="/images/brand/hero-main.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft scrim — warm cream fading to transparent */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--tc-white)]/85 via-[var(--tc-white)]/35 to-transparent" />

        <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16">
          <div className="max-w-2xl">
            <span className="tc-divider mb-6" />
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--tc-black)] leading-[1.05]">
              Beautiful wedding stationery, personalised by you
            </h1>
            <p className="mt-6 text-base md:text-lg text-[var(--tc-gray-700)] leading-relaxed max-w-xl">
              Choose your design, add your details, and we&apos;ll print and
              deliver stunning stationery for your special day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md bg-[var(--tc-black)] px-7 py-3 text-sm font-medium text-white shadow-[var(--tc-shadow-sm)] hover:shadow-[var(--tc-shadow-md)] hover:bg-[var(--tc-gray-800)] transition-all duration-300"
              >
                Browse Designs
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-[var(--tc-gray-300)] bg-white/80 backdrop-blur-sm px-7 py-3 text-sm font-medium text-[var(--tc-black)] hover:border-[var(--tc-black)] hover:bg-white transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="tc-divider mb-4" />
            <h2 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
              How It Works
            </h2>
            <p className="mt-3 text-sm text-[var(--tc-gray-500)] max-w-md mx-auto">
              From first spark to printed proof — a process designed around you.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4">
            {/* Hairline connector — desktop only */}
            <div
              className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-[var(--tc-sage)]/30"
              aria-hidden
            />

            {[
              {
                step: "01",
                title: "Choose your design",
                description:
                  "Browse our collection of beautifully crafted templates across every piece of wedding stationery.",
                icon: <IconBrowse />,
              },
              {
                step: "02",
                title: "Personalise it",
                description:
                  "Add your names, date, and colours — watch your design come to life as you type.",
                icon: <IconPencil />,
              },
              {
                step: "03",
                title: "We print & deliver",
                description:
                  "Approve your proof, pick your paper and quantity, and we'll handle the rest.",
                icon: <IconEnvelope />,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center px-4">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white border border-[var(--tc-sage-light)] shadow-[var(--tc-shadow-sm)]">
                  <div className="text-[var(--tc-sage)]">{item.icon}</div>
                  <span className="absolute -top-2 right-0 bg-[var(--tc-black)] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full tracking-wider">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-lg font-semibold text-[var(--tc-black)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--tc-gray-500)] leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category — image tiles */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tc-divider mb-4" />
            <h2 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative block overflow-hidden rounded-lg aspect-[4/5]"
              >
                <Image
                  src={categoryImages[cat.slug] || "/images/brand/cat-invitation.webp"}
                  alt={cat.label}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/55" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between text-white">
                  <h3 className="font-heading text-lg font-semibold tracking-wide">
                    {cat.label}
                  </h3>
                  <span className="text-xs font-medium opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 md:py-28 bg-[var(--tc-blush-light)]/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <svg
            className="mx-auto w-8 h-8 text-[var(--tc-sage)] mb-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 7H4a1 1 0 00-1 1v3a1 1 0 001 1h3v1a3 3 0 01-3 3 1 1 0 100 2 5 5 0 005-5V8a1 1 0 00-1-1zm13 0h-3a1 1 0 00-1 1v3a1 1 0 001 1h3v1a3 3 0 01-3 3 1 1 0 100 2 5 5 0 005-5V8a1 1 0 00-1-1z" />
          </svg>
          <blockquote className="font-heading text-xl md:text-2xl italic text-[var(--tc-black)] leading-relaxed">
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-medium text-[var(--tc-gray-700)]">
            {featuredTestimonial.couple}
            {featuredTestimonial.location && (
              <>
                <span className="mx-2 text-[var(--tc-gold)]">·</span>
                <span className="text-[var(--tc-gray-500)] font-normal">
                  {featuredTestimonial.location}
                </span>
              </>
            )}
          </p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <TrustItem
              icon={<IconAward />}
              title="Award Winning"
              subtitle="Kent Wedding Studio"
            />
            <TrustItem
              icon={<IconStar />}
              title="270+ Reviews"
              subtitle="Five stars on Google"
            />
            <TrustItem
              icon={<IconLeaf />}
              title="Premium Paper"
              subtitle="FSC certified, UK printed"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 flex items-center justify-center text-[var(--tc-gold)]">
        {icon}
      </div>
      <p className="mt-3 text-base font-semibold text-[var(--tc-black)] font-heading">
        {title}
      </p>
      <p className="mt-1 text-xs text-[var(--tc-gray-500)]">{subtitle}</p>
    </div>
  );
}

/* ——— Icons (inline SVG, no external dep) ——— */

function IconBrowse() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <circle cx="7" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="9.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      <path d="M15 5l3 3" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 8-6 14-14 14 0-8 6-14 14-14z" />
      <path d="M6 18c2-3 5-6 9-9" />
    </svg>
  );
}
