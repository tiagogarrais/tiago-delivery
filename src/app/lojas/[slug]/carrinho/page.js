"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CarrinhoLojaPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [store, setStore] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState([]);

  // Mapeamento de códigos numéricos para siglas de UF
  const stateCodeToUF = {
    11: "RO",
    12: "AC",
    13: "AM",
    14: "RR",
    15: "PA",
    16: "AP",
    17: "TO",
    21: "MA",
    22: "PI",
    23: "CE",
    24: "RN",
    25: "PB",
    26: "PE",
    27: "AL",
    28: "SE",
    29: "BA",
    31: "MG",
    32: "ES",
    33: "RJ",
    35: "SP",
    41: "PR",
    42: "SC",
    43: "RS",
    50: "MS",
    51: "MT",
    52: "GO",
    53: "DF",
  };

  const getStateDisplay = (state) => {
    if (state && state.length === 2 && isNaN(state)) {
      return state.toUpperCase();
    }
    return stateCodeToUF[state] || state;
  };

  // Carregar dados da loja
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;

      try {
        const storeResponse = await fetch(
          `/api/stores?slug=${encodeURIComponent(slug)}`
        );
        if (!storeResponse.ok) {
          throw new Error("Loja não encontrada");
        }

        const storeData = await storeResponse.json();
        const foundStore = storeData.stores?.find((s) => s.slug === slug);

        if (!foundStore) {
          throw new Error("Loja não encontrada");
        }

        setStore(foundStore);
      } catch (err) {
        console.error("Erro ao carregar dados da loja:", err);
        setErrors([err.message]);
      }
    };

    fetchStoreData();
  }, [slug]);

  // Buscar carrinho quando a loja for carregada
  useEffect(() => {
    if (store) {
      fetchCart();
    }
  }, [store]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        // Verificar se o carrinho é desta loja
        if (data.cart && data.cart.storeId === store.id) {
          setCart(data.cart);
        } else {
          setCart(null);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error);
      setErrors(["Erro ao carregar carrinho"]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        setSuccessMessage("Quantidade atualizada!");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        const errorData = await response.json();
        setErrors([errorData.error || "Erro ao atualizar quantidade"]);
        setTimeout(() => setErrors([]), 3000);
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro interno do servidor"]);
      setTimeout(() => setErrors([]), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm("Remover este item do carrinho?")) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.storeId === store.id) {
          setCart(data.cart);
        } else {
          setCart(null);
        }
        setSuccessMessage("Item removido do carrinho!");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        const errorData = await response.json();
        setErrors([errorData.error || "Erro ao remover item"]);
        setTimeout(() => setErrors([]), 3000);
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro interno do servidor"]);
      setTimeout(() => setErrors([]), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!confirm("Limpar todo o carrinho?")) return;

    try {
      setUpdating(true);
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (response.ok) {
        setCart(null);
        setSuccessMessage("Carrinho limpo!");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        const errorData = await response.json();
        setErrors([errorData.error || "Erro ao limpar carrinho"]);
        setTimeout(() => setErrors([]), 3000);
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro interno do servidor"]);
      setTimeout(() => setErrors([]), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + parseFloat(item.product.price) * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <Link
            href="/lojas"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ver todas as lojas
          </Link>
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
              {session ? (
                <>
                  <span className="text-gray-700">
                    Olá, {session.user?.name}
                  </span>
                  <Link
                    href="/painel"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Painel
                  </Link>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/lojas/${slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Voltar para {store.name}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Carrinho - {store.name} 🛒
          </h1>
          <p className="text-gray-600">
            Revise seus itens antes de finalizar o pedido
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-6">
              Adicione produtos de {store.name} ao carrinho para fazer um pedido
            </p>
            <Link
              href={`/lojas/${slug}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Store Info */}
              <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      🏪 {store.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📍 {store.city}, {getStateDisplay(store.state)}
                    </p>
                  </div>
                  <Link
                    href={`/lojas/${slug}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    + Adicionar mais itens
                  </Link>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 pt-3 border-t">
                  {store.minimumOrder && (
                    <div>
                      <span className="font-medium">Pedido mínimo:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        R$ {parseFloat(store.minimumOrder).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {store.deliveryFee !== null &&
                    store.deliveryFee !== undefined && (
                      <div>
                        <span className="font-medium">Taxa de entrega:</span>{" "}
                        <span className="text-green-600 font-semibold">
                          {store.deliveryFee === 0
                            ? "Grátis"
                            : `R$ ${parseFloat(store.deliveryFee).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex">
                    {/* Product Image */}
                    {item.product.image ? (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-3xl">🍽️</span>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.product.name}
                          </h3>
                          {item.product.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.product.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-700 p-2 disabled:opacity-50"
                          title="Remover item"
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
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={updating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={updating}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            R$ {parseFloat(item.product.price).toFixed(2)} cada
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            R${" "}
                            {(
                              parseFloat(item.product.price) * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                disabled={updating}
                className="w-full py-3 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
              >
                Limpar Carrinho
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Resumo do Pedido
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal ({cart.items.length}{" "}
                      {cart.items.length === 1 ? "item" : "itens"})
                    </span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>

                  {store.deliveryFee !== null &&
                    store.deliveryFee !== undefined && (
                      <div className="flex justify-between text-gray-600">
                        <span>Taxa de entrega</span>
                        <span>
                          {store.deliveryFee === 0
                            ? "Grátis"
                            : `R$ ${parseFloat(store.deliveryFee).toFixed(2)}`}
                        </span>
                      </div>
                    )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-green-600">
                        R${" "}
                        {(
                          calculateTotal() +
                          (store.deliveryFee ? parseFloat(store.deliveryFee) : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {store.minimumOrder &&
                    calculateTotal() < parseFloat(store.minimumOrder) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Valor mínimo de pedido: R${" "}
                          {parseFloat(store.minimumOrder).toFixed(2)}
                          <br />
                          Faltam: R${" "}
                          {(
                            parseFloat(store.minimumOrder) - calculateTotal()
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}
                </div>

                <button
                  disabled={
                    store.minimumOrder &&
                    calculateTotal() < parseFloat(store.minimumOrder)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    alert("Funcionalidade de checkout em desenvolvimento")
                  }
                >
                  Finalizar Pedido
                </button>

                <Link
                  href={`/lojas/${slug}`}
                  className="block w-full text-center py-3 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
