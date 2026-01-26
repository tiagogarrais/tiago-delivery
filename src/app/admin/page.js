"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { formatPrice } from "../../lib/utils";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchAdminData();
    }
  }, [status, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin");

      if (response.status === 403) {
        setError("Acesso negado. Você não é administrador do sistema.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados de administração");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      delivering: "Entregando",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      delivering: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-red-500 text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Acesso Restrito
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Voltar para Início
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Painel de Administração
            </h1>
            <p className="text-gray-600">
              Bem-vindo, {session?.user?.name || session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/sales-logs")}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Ver Logs de Vendas</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Usuários */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data?.stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total de Lojas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total de Lojas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data?.stats?.totalStores || 0}
                </p>
                <p className="text-xs text-gray-400">
                  {data?.stats?.openStores || 0} abertas /{" "}
                  {data?.stats?.closedStores || 0} fechadas
                </p>
              </div>
            </div>
          </div>

          {/* Total de Produtos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data?.stats?.totalProducts || 0}
                </p>
                <p className="text-xs text-gray-400">
                  {data?.stats?.availableProducts || 0} disponíveis
                </p>
              </div>
            </div>
          </div>

          {/* Total de Pedidos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data?.stats?.totalOrders || 0}
                </p>
                <p className="text-xs text-gray-400">
                  {data?.stats?.ordersByStatus?.pending || 0} pendentes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Receita Total */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Receita Total</p>
              <p className="text-4xl font-bold">
                {formatPrice(data?.stats?.totalRevenue || 0)}
              </p>
              <p className="text-green-100 text-sm mt-1">
                Baseado em pedidos não cancelados
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid de Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pedidos Recentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Pedidos Recentes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loja
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.recentOrders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.storeName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.customerName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lojas Recentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Lojas Recentes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.recentStores?.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {store.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {store.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {store.city}/{store.state}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            store.isOpen
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {store.isOpen ? "Aberta" : "Fechada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentStores || data.recentStores.length === 0) && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhuma loja encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usuários Recentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Usuários Recentes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cadastro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.recentUsers?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentUsers || data.recentUsers.length === 0) && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo de Pedidos por Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Pedidos por Status
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    Pendentes
                  </span>
                  <span className="font-semibold">
                    {data?.stats?.ordersByStatus?.pending || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    Concluídos
                  </span>
                  <span className="font-semibold">
                    {data?.stats?.ordersByStatus?.completed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    Cancelados
                  </span>
                  <span className="font-semibold">
                    {data?.stats?.ordersByStatus?.cancelled || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    Outros
                  </span>
                  <span className="font-semibold">
                    {data?.stats?.ordersByStatus?.other || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
