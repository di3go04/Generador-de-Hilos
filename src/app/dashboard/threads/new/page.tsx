import DashboardShell from "@/components/dashboard/DashboardShell";
import ThreadGeneratorNew from "@/components/thread-generator/ThreadGeneratorNew";

export const metadata = { title: "Nuevo Hilo — Urban" };

export default function NewThreadPage() {
  return (
    <DashboardShell>
      <ThreadGeneratorNew />
    </DashboardShell>
  );
}
