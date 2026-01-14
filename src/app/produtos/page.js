"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function ProdutosPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesData, setStatesData] = useState({});
  const [cidade, setCidade] = useState(null);
  const [estado, setEstado] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  // Carregar localização dos parâmetros ou localStorage
  useEffect(() => {
    const cidadeParam = searchParams.get("cidade");
    const estadoParam = searchParams.get("estado");

    if (cidadeParam && estadoParam) {
      setCidade(cidadeParam);
      setEstado(estadoParam);
    } else {
      // Tentar ler do localStorage
      const savedCity = localStorage.getItem("selectedCity");
      const savedState = localStorage.getItem("selectedState");

      if (savedCity && savedState) {
        setCidade(savedCity);
        setEstado(savedState);
      }
    }
  }, [searchParams]);

  // Carregar dados de estados
  useEffect(() => {
    const loadStatesData = async () => {
      try {
        const response = await fetch("/estados-cidades2.json");
        const data = await response.json();
        setStatesData(data);
      } catch (error) {
        console.error("Erro ao carregar dados de estados:", error);
      }
    };

    loadStatesData();
  }, []);

  // Buscar lojas e produtos da cidade
  useEffect(() => {
    const fetchData = async () => {
      if (!cidade || !estado) return;

      try {
        setLoading(true);

        // Buscar todas as lojas
        const storesResponse = await fetch("/api/stores");
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();

          // Filtrar lojas pela cidade
          const filteredStores =
            storesData.stores?.filter((store) => {
              const cidadeMatch =
                store.city?.toLowerCase().trim() ===
                cidade.toLowerCase().trim();
              const estadoMatch = store.state === estado;
              return cidadeMatch && estadoMatch;
            }) || [];

          setStores(filteredStores);

          // Buscar produtos de cada loja filtrada
          const allProducts = [];
          for (const store of filteredStores) {
            try {
              const productsResponse = await fetch(
                `/api/products?storeId=${store.id}`
              );
              if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                const productsWithStore =
                  productsData.products?.map((product) => ({
                    ...product,
                    storeName: store.name,
                    storeId: store.id,
                  })) || [];
                allProducts.push(...productsWithStore);
              }
            } catch (error) {
              console.error(
                `Erro ao buscar produtos da loja ${store.name}:`,
                error
              );
            }
          }

          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cidade, estado]);

  const addToCart = async (productId, storeId) => {
    // Verificar se o usuário está logado
    if (!session) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
      return;
    }

    try {
      setAddingToCart(productId);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setCartMessage("Produto adicionado ao carrinho!");
        setTimeout(() => setCartMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setCartMessage(errorData.error || "Erro ao adicionar ao carrinho");
        setTimeout(() => setCartMessage(""), 3000);
      }
    } catch (error) {
      console.error("Erro:", error);
      setCartMessage("Erro ao adicionar ao carrinho");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setAddingToCart(null);
    }
  };

  const isOwner = (storeId) => {
    if (!session?.user?.email) return false;
    const store = stores.find((s) => s.id === storeId);
    return store?.isOwner === true;
  };

  if (!cidade || !estado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Localização não selecionada
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Voltar para página inicial
          </Link>
        </div>
      </div>
    );
  }

  const estadoNome = statesData.states?.[estado] || estado;

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
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Início
              </Link>
              <Link href="/produtos" className="text-blue-600 font-semibold">
                Produtos
              </Link>
              <Link
                href="/carrinho"
                className="text-gray-700 hover:text-gray-900"
              >
                🛒 Carrinho
              </Link>
            </nav>
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
                  href="/"
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
        {/* Location Info */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Voltar para página inicial
          </Link>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Produtos em {cidade}
            </h1>
            <p className="text-gray-600">
              📍 {cidade}, {estadoNome}
            </p>
            {stores.length > 0 && (
              <p className="text-gray-600 mt-2">
                {stores.length}{" "}
                {stores.length === 1 ? "loja encontrada" : "lojas encontradas"}
              </p>
            )}
          </div>
        </div>

        {/* Cart Message */}
        {cartMessage && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              cartMessage.includes("Erro") || cartMessage.includes("outra loja")
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                cartMessage.includes("Erro") ||
                cartMessage.includes("outra loja")
                  ? "text-red-800"
                  : "text-green-800"
              }`}
            >
              {cartMessage}
            </p>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              {stores.length === 0
                ? `Ainda não temos lojas cadastradas em ${cidade}.`
                : `As lojas de ${cidade} ainda não cadastraram produtos.`}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Buscar em outra cidade
              </Link>
              {stores.length > 0 && (
                <Link
                  href={`/lojas?cidade=${encodeURIComponent(
                    cidade
                  )}&estado=${estado}`}
                  className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Ver Lojas
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
                  !product.available ? "opacity-60" : ""
                }`}
              >
                {/* Imagem do Produto */}
                {product.image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">🍽️</span>
                  </div>
                )}

                <div className="p-4">
                  {/* Nome do Produto */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>

                  {/* Descrição */}
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Nome da Loja */}
                  <p className="text-xs text-gray-500 mb-3">
                    🏪 {product.storeName}
                  </p>

                  {/* Preço e Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {!product.available && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Indisponível
                      </span>
                    )}
                  </div>

                  {/* Botões */}
                  {product.available && (
                    <button
                      onClick={() => addToCart(product.id, product.storeId)}
                      disabled={
                        addingToCart === product.id || isOwner(product.storeId)
                      }
                      className={`w-full mb-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-md text-sm ${
                        isOwner(product.storeId)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
                      }`}
                      title={
                        isOwner(product.storeId)
                          ? "Você é o proprietário deste produto"
                          : "Adicionar ao carrinho"
                      }
                    >
                      {addingToCart === product.id ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
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
                          Adicionando...
                        </span>
                      ) : isOwner(product.storeId) ? (
                        "🛒 Seu Produto"
                      ) : (
                        "🛒 Adicionar ao Carrinho"
                      )}
                    </button>
                  )}
                  <Link
                    href={`/products?storeId=${product.storeId}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    Ver Loja
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg">Carregando...</p></div>}>
      <ProdutosPageContent />
    </Suspense>
  );
}
