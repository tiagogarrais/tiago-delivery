"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Tiago Delivery
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-700">Olá, {session.user?.name}</span>
                <Link
                  href="/painel"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Painel
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
