import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | UniFyd NG" },
      { name: "description", content: "The rules for using UniFyd NG: student accounts, ID verification, paid listings, prohibited items, meet-ups and payments." },
      { property: "og:title", content: "Terms and Conditions | UniFyd NG" },
      { property: "og:description", content: "The rules for using the UniFyd NG student marketplace." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://uni-nest-market.lovable.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://uni-nest-market.lovable.app/terms" }],
  }),
  component: Terms,
});

const sections = [
  {
    h: "1. Who can use UniFyd NG",
    p: [
      "UniFyd NG is for students of the University of Ilorin, Al-Hikmah University and Kwara State University. You must be at least 16 years old and use your own details to register.",
      "One person may hold one account. Accounts created with false names, false matric numbers or another student's ID may be suspended without refund.",
    ],
  },
  {
    h: "2. Student ID verification",
    p: [
      "You may browse without verification. To publish a listing you must upload a photo of a valid student ID card. Our team reviews submissions manually and may approve, reject or request a clearer photo.",
      "Verification confirms that a document was submitted and reviewed. It is not a guarantee of a seller's honesty, and it does not make UniFyd NG a party to any sale.",
    ],
  },
  {
    h: "3. Listings and paid plans",
    p: [
      "Listing plans are paid per listing: Basic at ₦200, Featured at ₦500, and Graduation Clearance at ₦1,500. A listing stays visible for 30 days from the date it goes live, after which it expires and can be reactivated with a new payment.",
      "Listing fees pay for placement on the platform. They are not commissions on your sale, and they are not refundable once a listing is live, including where an item does not sell or where you remove the listing yourself.",
      "A listing that breaks these terms may be removed without refund.",
    ],
  },
  {
    h: "4. Items you may not list",
    p: [
      "You may not list stolen goods, weapons, drugs, prescription medicine, alcohol, tobacco, live animals, examination materials, academic work for sale, counterfeit products, adult content, financial accounts, or anything you are not legally allowed to sell.",
      "Listings must describe the actual item you hold, use your own photographs, and state the condition honestly.",
    ],
  },
  {
    h: "5. Transactions between students",
    p: [
      "UniFyd NG is a place to find each other. Every sale happens directly between buyer and seller. We do not hold funds, escrow money, inspect items, arrange delivery, or take responsibility for whether an item matches its description.",
      "Meet in a public place on campus during the day. Inspect and test an item before paying. Do not send money in advance to someone you have not met.",
    ],
  },
  {
    h: "6. Conduct",
    p: [
      "Harassment, threats, hate speech, spam, price manipulation, off-platform scam attempts and impersonation are not allowed. Use the report option on any listing or profile that breaks these rules.",
      "We may suspend or remove an account that repeatedly breaks these terms, and we may keep records of the breach.",
    ],
  },
  {
    h: "7. Ratings and reviews",
    p: [
      "Reviews must reflect a real transaction. Do not buy, trade or exchange reviews. We may remove reviews that are fabricated or abusive.",
    ],
  },
  {
    h: "8. Liability",
    p: [
      "UniFyd NG is provided as it is. To the extent the law allows, we are not liable for loss, damage or injury arising from a transaction, meeting or message between users, or from an interruption of the service.",
    ],
  },
  {
    h: "9. Changes and contact",
    p: [
      "We may update these terms as the platform grows. Continued use after an update means you accept the revised terms.",
      "Questions about these terms can be sent to support@unifyd.ng.",
    ],
  },
];

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Terms and Conditions</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated 7 September 2026</p>
        <p className="mt-6 text-muted-foreground">
          These terms cover your use of UniFyd NG. By creating an account you agree to them.
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-xl font-semibold">{s.h}</h2>
              {s.p.map((t) => (
                <p key={t} className="mt-3 text-muted-foreground">{t}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
