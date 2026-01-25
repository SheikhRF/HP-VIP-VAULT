import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "./ui/navigation-menu";

export default async function Navbar() {
    const { sessionClaims } = await auth();
    // Supporting both 'Role' and 'role' for safety
    const isAdmin = sessionClaims?.Role === "admin" || sessionClaims?.role === "admin";

    const navItems = ["Home", "Cars", "About", "Contact"];
    if (isAdmin) navItems.push("Admin");

    return (
        <nav className="fixed top-6 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-full border border-white/10 bg-neutral-900/60 px-8 py-3 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="flex items-center justify-between">
                
                {/* Logo Branding */}
                <Link href="/" className="group flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <span className="text-lg font-black italic tracking-tighter uppercase text-white group-hover:text-orange-500 transition-colors">
                        HP.VIP <span className="text-orange-500">Vault</span>
                    </span>
                </Link>

                <NavigationMenu>
                    <NavigationMenuList className="flex gap-1 md:gap-4">
                        {navItems.map((item) => {
                            const isSpecial = item === "Admin";
                            return (
                                <NavigationMenuItem key={item}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                                            className={`
                                                relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                                                ${isSpecial 
                                                    ? "text-orange-500 hover:text-white border border-orange-500/30 rounded-full bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                                                    : "text-gray-400 hover:text-white"
                                                }
                                            `}
                                        >
                                            {item}
                                            {/* Hover underline effect for standard items */}
                                            {!isSpecial && (
                                                <span className="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-orange-500 transition-all duration-300 group-hover:w-1/2" />
                                            )}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Status Indicator (Replacing Search) */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500 leading-none">Access Level</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white leading-none mt-1">
                            {isAdmin ? "Admin" : "Standard"}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}