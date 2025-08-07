import React from "react";
import { createClient } from "@/prismicio";
// import Link from "next/link";
// import {PrismicNextLink} from "@prismicio/next";
import NavBar from "./NavBar";

export default async function Header() {
  const client = createClient();
  const settings = await client.getSingle("settings");
  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:relative md:mx-auto md:max-w-7xl">
      <NavBar settings={settings}/>
    </header>
  )
}
