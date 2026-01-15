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
  const [cart, setCart] = useState([]);

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

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      }
    }
  }, []);

  const addToCart = (product) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({
        ...product,
        quantity: 1,
        storeId: store.id,
        storeName: store.name,
      });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
                  {store.city}, {store.state}
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
              <Link
                href="/carrinho"
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
                Carrinho (
                {cart.reduce((total, item) => total + item.quantity, 0)})
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
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Adicionar
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
