"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Footer from "../../../../components/Footer";

export default function MeusPedidosPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const statusLabels = {
    pending: { label: "Aguardando Confirmação", color: "yellow" },
    confirmed: { label: "Confirmado", color: "blue" },
    preparing: { label: "Em Preparação", color: "purple" },
    delivering: { label: "Saiu para Entrega", color: "indigo" },
    completed: { label: "Concluído", color: "green" },
    cancelled: { label: "Cancelado", color: "red" },
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do pedido");
      }

      // Atualizar lista de pedidos
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error("Erro ao atualizar pedido:", err);
      alert("Erro ao atualizar status do pedido");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getAllOrderSteps = (currentStatus) => {
    const steps = [
      { label: "Receber Pedido", status: "confirmed", color: "blue" },
      { label: "Confirmar Pagamento", status: "preparing", color: "purple" },
      {
        label: "Pedido em Rota de Entrega",
        status: "delivering",
        color: "indigo",
      },
      { label: "Pedido Finalizado", status: "completed", color: "green" },
    ];

    const statusOrder = {
      pending: 0,
      confirmed: 1,
      preparing: 2,
      delivering: 3,
      completed: 4,
      cancelled: -1,
    };

    const currentStepIndex = statusOrder[currentStatus] || 0;

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index < currentStepIndex,
      isCurrent: index === currentStepIndex,
      isAvailable: index === currentStepIndex,
      stepNumber: index + 1,
    }));
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case "pending":
        return [
          { label: "Receber Pedido", status: "confirmed", color: "blue" },
        ];
      case "confirmed":
        return [
          {
            label: "Confirmar forma de pagamento",
            status: "preparing",
            color: "purple",
          },
        ];
      case "preparing":
        return [
          {
            label: "Confirmar pedido em Rota de Entrega",
            status: "delivering",
            color: "indigo",
          },
        ];
      case "delivering":
        return [
          {
            label: "Finalizar Pedido",
            status: "completed",
            color: "green",
          },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !session) return;

      try {
        setLoading(true);

        // Buscar loja
        const storeResponse = await fetch(
          `/api/stores?slug=${encodeURIComponent(slug)}`,
        );
        if (!storeResponse.ok) {
          throw new Error("Loja não encontrada");
        }

        const storeData = await storeResponse.json();
        const foundStore = storeData.stores?.find((s) => s.slug === slug);

        if (!foundStore) {
          throw new Error("Loja não encontrada");
        }

        // Verificar se é o dono da loja
        if (!foundStore.isOwner) {
          throw new Error("Você não tem permissão para ver esta página");
        }

        setStore(foundStore);

        // Buscar pedidos da loja
        const ordersResponse = await fetch(
          `/api/orders?storeId=${foundStore.id}&asStore=true`,
        );
        if (!ordersResponse.ok) {
          throw new Error("Erro ao carregar pedidos");
        }

        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErrors([err.message]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Faça login para ver os pedidos
          </h1>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
            <div className="text-red-700 mb-6">
              <ul className="list-disc text-left pl-5 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
            <Link
              href={`/lojas/${slug}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Voltar à Loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Tiago Delivery
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {session.user?.name}</span>
              <Link
                href="/painel"
                className="text-blue-600 hover:text-blue-800"
              >
                Painel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/lojas/${slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Voltar para {store?.name}
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meus Pedidos 📋
          </h1>
          <p className="text-gray-600">Pedidos recebidos em {store?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Aguardando Confirmação</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Em Andamento</p>
            <p className="text-2xl font-bold text-blue-600">
              {
                orders.filter(
                  (o) =>
                    o.status === "confirmed" ||
                    o.status === "preparing" ||
                    o.status === "delivering",
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Concluídos</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum pedido ainda
            </h2>
            <p className="text-gray-600">
              Sua loja ainda não recebeu nenhum pedido
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const statusInfo =
                statusLabels[order.status] || statusLabels.pending;
              const availableActions = getAvailableActions(order.status);
              const isUpdating = updatingOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Cliente: {order.customerName || "Não informado"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Pedido em{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Itens do Pedido:
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantidade: {item.quantity} × R${" "}
                              {item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>R$ {order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Taxa de entrega:</span>
                          <span>R$ {order.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                        <span>Total:</span>
                        <span className="text-green-600">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact */}
                  {order.customerPhone && (
                    <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Contato do cliente:</span>{" "}
                        {order.customerPhone}
                      </p>
                    </div>
                  )}

                  {/* Order Status Steps */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Status do Pedido
                      </h4>
                      <div className="flex flex-col space-y-4 relative">
                        {getAllOrderSteps(order.status).map((step, index) => (
                          <div
                            key={step.status}
                            className="flex items-start relative"
                          >
                            {/* Step Circle */}
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0 z-10 ${
                                step.isCompleted
                                  ? "bg-green-600 text-white"
                                  : step.isCurrent
                                    ? `bg-${step.color}-600 text-white`
                                    : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {step.isCompleted ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                step.stepNumber
                              )}
                            </div>

                            {/* Step Label */}
                            <div className="ml-3 flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  step.isCompleted
                                    ? "text-green-600"
                                    : step.isCurrent
                                      ? `text-${step.color}-600`
                                      : "text-gray-500"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>

                            {/* Vertical Connector Line */}
                            {index <
                              getAllOrderSteps(order.status).length - 1 && (
                              <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-300">
                                {step.isCompleted && (
                                  <div className="w-full h-full bg-green-600" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {availableActions && availableActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {availableActions.map((action) => (
                          <button
                            key={action.status}
                            onClick={() =>
                              updateOrderStatus(order.id, action.status)
                            }
                            disabled={isUpdating}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              isUpdating
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : action.color === "blue"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : action.color === "purple"
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : action.color === "indigo"
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                      : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isUpdating ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Atualizando...
                              </span>
                            ) : (
                              action.label
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
