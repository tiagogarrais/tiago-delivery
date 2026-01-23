"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo centralizado no topo */}
        <div className="text-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Tiago Delivery
          </Link>
        </div>

        {/* Menu inferior */}
        <div className="flex justify-center items-center pb-4">
          {session ? (
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 text-sm">
                  Olá, {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                >
                  Sair
                </button>
              </div>
              <Link
                href="/painel"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Meu Painel
              </Link>
            </div>
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
    </header>
  );
}
