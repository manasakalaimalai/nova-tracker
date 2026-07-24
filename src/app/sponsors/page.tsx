import { prisma } from "@/lib/prisma";
import SponsorTable from "@/components/SponsorTable";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedSponsors = sponsors.map((s) => ({
    ...s,
    committedAmount: (s.committedAmount as unknown as Decimal).toNumber(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-fraunces text-3xl font-bold text-nova-text">
            Sponsors
          </h1>
          <p className="text-nova-text/40 text-sm mt-1">
            Track sponsor commitments and payment status
          </p>
        </div>
        <SponsorTable sponsors={serializedSponsors} />
      </div>
    </main>
  );
}
