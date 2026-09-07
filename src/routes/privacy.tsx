import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | UniFyd NG" },
      { name: "description", content: "What UniFyd NG collects, how student ID photos are stored and reviewed, who can see your details, and how to delete your account." },
      { property: "og:title", content: "Privacy Policy | UniFyd NG" },
      { property: "og:description", content: "How UniFyd NG handles student data and ID verification photos." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://uni-nest-market.lovable.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://uni-nest-market.lovable.app/privacy" }],
  }),
  component: Privacy,
});

const sections = [
  {
    h: "1. What we collect",
    p: [
      "Account details you give us: full name, email address, phone number, university, department, level and matric number.",
      "Verification documents: the photo of the student ID card you upload for review.",
      "Listing content: titles, descriptions, prices, photos, category, condition and the campus or hostel area you select.",
      "Activity: messages and offers you send through the platform, listings you save, reviews you write, reports you file, and records of listing payments.",
    ],
  },
  {
    h: "2. Why we collect it",
    p: [
      "To run your account, show your listings to other students, let buyers and sellers reach each other, confirm that sellers are real students, take payment for listing plans, review reports, and remove accounts that break our rules.",
    ],
  },
  {
    h: "3. Who can see what",
    p: [
      "Public to signed-in students: your name, profile photo, university, ratings and your active listings.",
      "Private to you: your email address, phone number, matric number and saved listings. Your phone number is not shown on listings; buyers reach you through in-app chat.",
      "Restricted: your student ID photo is stored in a private area and is readable only by you and our verification reviewers. It is never shown on your profile or in listings.",
    ],
  },
  {
    h: "4. Storage and processors",
    p: [
      "Data is stored in our managed database and file storage, protected by row-level access rules so that a signed-in student can only read what they are permitted to read.",
      "We use Paystack to process listing payments. Card details are handled by Paystack, not by us, and we only receive the status and reference of a payment.",
    ],
  },
  {
    h: "5. How long we keep it",
    p: [
      "Account and listing data is kept while your account is open. Student ID photos are kept for as long as your seller verification is valid, so that a report can be investigated.",
      "When you delete your account we remove your profile, listings and ID photo. We may keep payment records where record-keeping law requires it.",
    ],
  },
  {
    h: "6. Your choices",
    p: [
      "You can edit your profile details at any time, delete a listing, and ask us to delete your account and ID photo by writing to privacy@unifyd.ng.",
      "You can ask for a copy of the data held about you, and ask us to correct anything inaccurate.",
    ],
  },
  {
    h: "7. Cookies",
    p: [
      "We use only the storage needed to keep you signed in and remember your session. We do not run advertising trackers.",
    ],
  },
  {
    h: "8. Children",
    p: [
      "UniFyd NG is not intended for anyone under 16. If we learn that an account belongs to a child under 16 we will remove it.",
    ],
  },
  {
    h: "9. Contact",
    p: ["Privacy questions and data requests go to privacy@unifyd.ng."],
  },
];

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated 7 September 2026</p>
        <p className="mt-6 text-muted-foreground">
          This policy explains what UniFyd NG collects from students, why, and what control you have over it.
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
