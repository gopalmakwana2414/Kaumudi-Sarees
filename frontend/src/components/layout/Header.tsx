"use client";

import Link from "next/link";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex gap-8 font-medium">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="flex gap-5">
            <Search className="w-5 h-5 cursor-pointer" />

            <Heart className="w-5 h-5 cursor-pointer" />

            <ShoppingBag className="w-5 h-5 cursor-pointer" />

            <User className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
}