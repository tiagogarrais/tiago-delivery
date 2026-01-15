"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function LojasContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesData, setStatesData] = useState({});
  const [cidade, setCidade] = useState(null);
  const [estado, setEstado] = useState(null);

  // Carregar localização do localStorage
  useEffect(() => {
    // Tentar ler do localStorage
    const savedCity = localStorage.getItem("selectedCity");
    const savedState = localStorage.getItem("selectedState");

    if (savedCity && savedState) {
      setCidade(savedCity);
      setEstado(savedState);
    }
  }, []);

  // Carregar dados de estados para converter código em nome
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

  // Buscar lojas
  useEffect(() => {
    const fetchStores = async () => {
      if (!cidade || !estado) return;

      try {
        setLoading(true);
        const response = await fetch("/api/stores");
        if (response.ok) {
          const data = await response.json();

          console.log("Buscando lojas para:", { cidade, estado });
          console.log("Total de lojas no banco:", data.stores?.length);

          // Log de todas as lojas para debug
          data.stores?.forEach((store) => {
            console.log("Loja:", {
              nome: store.name,
              cidade: store.city,
              estado: store.state,
            });
          });

          // Filtrar lojas pela cidade e estado
          const filteredStores =
            data.stores?.filter((store) => {
              const cidadeBanco = store.city?.toLowerCase().trim();
              const cidadeBusca = cidade.toLowerCase().trim();
              const estadoBanco = store.state;

              console.log("Comparando:", {
                loja: store.name,
                cidadeBanco,
                cidadeBusca,
                cidadeMatch: cidadeBanco === cidadeBusca,
                estadoBanco,
                estadoBusca: estado,
                estadoMatch: estadoBanco === estado,
              });

              const cidadeMatch = cidadeBanco === cidadeBusca;
              const estadoMatch = estadoBanco === estado;

              return cidadeMatch && estadoMatch;
            }) || [];

          console.log("Lojas filtradas:", filteredStores.length);
          setStores(filteredStores);
        }
      } catch (error) {
        console.error("Erro ao buscar lojas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [cidade, estado]);

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
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lojas em {cidade}
            </h1>
            <p className="text-gray-600">
              📍 {cidade}, {estadoNome}
            </p>
          </div>
        </div>

        {/* Stores List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Carregando lojas...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhuma loja encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              Ainda não temos lojas cadastradas em {cidade}.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Buscar em outra cidade
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {store.name}
                  </h3>

                  {store.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <span className="mr-2">📍</span>
                      <span>
                        {store.street}, {store.number}
                        {store.neighborhood && ` - ${store.neighborhood}`}
                      </span>
                    </div>

                    {store.phone && (
                      <div className="flex items-center">
                        <span className="mr-2">📞</span>
                        <span>{store.phone}</span>
                      </div>
                    )}

                    {store.minimumOrder && (
                      <div className="flex items-center">
                        <span className="mr-2">💰</span>
                        <span>
                          Pedido mínimo: R$ {store.minimumOrder.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {store.deliveryFee !== null &&
                      store.deliveryFee !== undefined && (
                        <div className="flex items-center">
                          <span className="mr-2">🚚</span>
                          <span>
                            Taxa de entrega:{" "}
                            {store.deliveryFee === 0
                              ? "Grátis"
                              : `R$ ${store.deliveryFee.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                  </div>

                  <Link
                    href={`/lojas/${store.slug}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
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

export default function LojasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg">Carregando...</p>
        </div>
      }
    >
      <LojasContent />
    </Suspense>
  );
}
