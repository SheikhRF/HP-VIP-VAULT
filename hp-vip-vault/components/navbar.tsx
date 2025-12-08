"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from  "./ui/navigation-menu";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 z-50 w-[90%] max-w-5xl -translate-x-1/2 rounded-full border border-neutral-700 bg-neutral-800/80 px-6 py-2 backdrop-blur shadow-lg">
      <div className="flex h-12 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-500">
            HP-VIP Vault
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {["Home", "Contact", "About","Cars",].map((item) => (
              <NavigationMenuItem key={item}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-white"
                  >
                    {item}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <input
          type="text"
          placeholder="search"
          className="ml-4 hidden rounded-full bg-neutral-700 px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none sm:block"
        />
      </div>
    </nav>
  )
}