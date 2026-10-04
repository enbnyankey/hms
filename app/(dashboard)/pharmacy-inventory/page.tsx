import PharmacyHeader from "@/components/pharmacy/PharmacyHeader";
import PharmacyKpis from "@/components/pharmacy/PharmacyKpis";
import IngestionQueue from "@/components/pharmacy/IngestionQueue";
import PrescriptionDetail from "@/components/pharmacy/PrescriptionDetail";
import PharmacySidebar from "@/components/pharmacy/PharmacySidebar";

export default function PharmacyInventoryPage() {
  return (
    <div>
      <PharmacyHeader />

      <div className="mt-5">
        <PharmacyKpis />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr_280px]">
        <IngestionQueue />
        <PrescriptionDetail />
        <PharmacySidebar />
      </div>
    </div>
  );
}
