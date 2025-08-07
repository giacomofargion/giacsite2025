import { Metadata } from "next";
import clsx from "clsx";
import { Urbanist } from "next/font/google"; // Import Urbanist
import "./globals.css";
import Header from '@/app/components/Header';
import Footer from "./components/Footer";
import { PrismicPreview } from "@prismicio/next";
import { createClient, repositoryName } from "@/prismicio";

const urbanist = Urbanist({
  variable: "--font-urbanist", // Custom CSS variable
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Choose your weights
});

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const settings = await client.getSingle("settings");

  return {
    title: settings.data.meta_title,
    description: settings.data.meta_description,
    // openGraph: {
    //   images: [settings.data.og_image?.url || ""],
    // },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-slate-900 text-slate-100">
      <head>
        {/* Preload 3D models for faster loading */}
        <link rel="preload" href="/models/model-compressed.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />

        {/* Preload critical resources */}
        <link rel="preload" href="/noisetexture.jpg" as="image" />
      </head>
      <body className={clsx(urbanist.className, "relative min-h-screen")}>
        <Header />
        {children}
        <div className="background-gradient absolute inset-0 -z-50 max-h-screen" />
        <div className="pointer-events-none absolute inset-0 -z-40 h-full bg-[url('/noisetexture.jpg')] opacity-20 mix-blend-soft-light"></div>
        <Footer />
      </body>

      <PrismicPreview repositoryName={repositoryName} ></PrismicPreview>
    </html>
  );
}
