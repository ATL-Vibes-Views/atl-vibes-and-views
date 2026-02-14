import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getNeighborhoodsGrouped } from "@/lib/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const exploreData = await getNeighborhoodsGrouped();

  return (
    <>
      <Header exploreData={exploreData} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
