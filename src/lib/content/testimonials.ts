export interface Testimonial {
  couple: string;
  quote: string;
  location?: string;
}

export const testimonials: Testimonial[] = [
  {
    couple: "Tom & Ella",
    quote:
      "Our invitations were the most beautiful part of our wedding correspondence — every guest commented on them. The design process was effortless.",
    location: "Sevenoaks",
  },
  {
    couple: "Harriet & James",
    quote:
      "We matched our save the dates, invitations, and on-the-day stationery seamlessly. The paper quality is exceptional — exactly the heirloom keepsakes we hoped for.",
    location: "Tunbridge Wells",
  },
  {
    couple: "Amelia & George",
    quote:
      "Responsive, thoughtful, and generous with their time. The personalised sample arrived within days and made us confident ordering the full run.",
    location: "Canterbury",
  },
];
