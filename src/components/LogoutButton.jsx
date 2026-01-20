"use client";

import Image from "next/image";
import Link from "next/link";

export default function LogoutButton() {
  return (
    <Link
      href="/auth/logout"
      className="w-[50px] md:w-auto bg-[#8a0c0c] flex flex-row p-[5px] md:gap-[5px] rounded-[5px] transition-transform ease-in-out duration-300 hover:scale-105 active:scale-90"
    >
      <p className="text-[#FFFFFF] hidden md:block">Logout</p>
      <Image src="/logout.png" alt="logout" width={50} height={50} className="w-[50px] md:w-[30px]"/>
    </Link>
  );
}