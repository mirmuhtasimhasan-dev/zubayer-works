import Studio from "./Studio";

export const dynamic = "force-static";

export const metadata = {
  title: "Zubayer Works Studio",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function StudioPage() {
  return <Studio />;
}
