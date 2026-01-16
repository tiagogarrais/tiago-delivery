"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LojaPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);

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
    if (!state) return "";
    // Se já é uma sigla (2 letras), retorna em maiúsculas
    if (state.length === 2 && isNaN(state)) {
      return state.toUpperCase();
    }
    // Se é código numérico, converte para sigla
    return stateCodeToUF[state] || state;
  };

  // Carregar dados da loja
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Buscar loja pelo slug
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

        // Buscar produtos da loja
        const productsResponse = await fetch(
          `/api/products?storeId=${foundStore.id}`
        );
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da loja:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [slug]);

  // Carregar contagem do carrinho
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!store) return;

      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          if (data.cart && data.cart.storeId === store.id) {
            const count = data.cart.items.reduce(
              (total, item) => total + item.quantity,
              0
            );
            setCartItemCount(count);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      }
    };

    fetchCartCount();
  }, [store]);

  const addToCart = async (product) => {
    // Verificar se o usuário está logado
    if (!session) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    try {
      setAddingToCart(product.id);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart && data.cart.storeId === store.id) {
          const count = data.cart.items.reduce(
            (total, item) => total + item.quantity,
            0
          );
          setCartItemCount(count);
        }
        // Redirecionar para o carrinho da loja
        router.push(`/lojas/${slug}/carrinho`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao adicionar ao carrinho");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao adicionar ao carrinho");
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
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

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      {/* Header da Loja */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mt-2">{store.description}</p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {store.category}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {store.city}, {getStateDisplay(store.state)}
                </span>
                {store.minimumOrder && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Pedido mínimo: {formatPrice(store.minimumOrder)}
                    </span>
                  </>
                )}
                {store.deliveryFee && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Taxa de entrega: {formatPrice(store.deliveryFee)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botão Minhas Compras / Meus Pedidos */}
              {session && (
                <Link
                  href={
                    store.isOwner
                      ? `/lojas/${slug}/meus-pedidos`
                      : `/lojas/${slug}/minhas-compras`
                  }
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {store.isOwner ? "Meus Pedidos" : "Minhas Compras"}
                </Link>
              )}
              <Link
                href={`/lojas/${slug}/carrinho`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Carrinho ({cartItemCount})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Produtos</h2>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum produto disponível
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Esta loja ainda não cadastrou produtos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={
                        addingToCart === product.id || !product.available
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product.id ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-1"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          ...
                        </span>
                      ) : (
                        "Adicionar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
