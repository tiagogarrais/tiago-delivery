"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [states, setStates] = useState({});
  const [cities, setCities] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [latestStores, setLatestStores] = useState([]);

  // Carregar localização salva do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("selectedState");
    const savedCity = localStorage.getItem("selectedCity");

    if (savedState && savedCity) {
      setSelectedState(savedState);
      setSelectedCity(savedCity);
    }
  }, []);

  // Atualizar currentLocation e salvar quando cidade e estado mudarem
  useEffect(() => {
    if (selectedState && selectedCity && states.states) {
      const stateName = states.states?.[selectedState] || selectedState;
      setCurrentLocation(`${selectedCity}, ${stateName}`);

      // Salvar automaticamente no localStorage
      localStorage.setItem("selectedState", selectedState);
      localStorage.setItem("selectedCity", selectedCity);
      localStorage.setItem("selectedStateName", stateName);
    }
  }, [selectedState, selectedCity, states]);

  // Carregar dados de estados e cidades
  useEffect(() => {
    const loadStatesData = async () => {
      try {
        const response = await fetch("/estados-cidades2.json");
        const data = await response.json();
        setStates(data);

        // Tentar detectar localização automaticamente apenas se não houver localização salva
        const savedCity = localStorage.getItem("selectedCity");
        if (!savedCity) {
          detectLocation();
        }
      } catch (error) {
        console.error("Erro ao carregar dados de estados:", error);
      }
    };

    loadStatesData();
  }, []);

  // Carregar últimos produtos adicionados
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch("/api/products/latest");
        if (response.ok) {
          const data = await response.json();
          setLatestProducts(data.products || []);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };

    fetchLatestProducts();
  }, []);

  // Carregar últimas lojas adicionadas
  useEffect(() => {
    const fetchLatestStores = async () => {
      try {
        const response = await fetch("/api/stores/latest");
        if (response.ok) {
          const data = await response.json();
          setLatestStores(data.stores || []);
        }
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
      }
    };

    fetchLatestStores();
  }, []);

  // Atualizar cidades quando o estado mudar
  useEffect(() => {
    if (selectedState && states.cities) {
      // Filtrar cidades pelo state_id
      const stateCities = states.cities
        .filter((city) => city.state_id === parseInt(selectedState))
        .map((city) => city.name);

      console.log("Estado selecionado:", selectedState);
      console.log("Cidades encontradas:", stateCities);
      setCities(stateCities);

      // Não resetar cidade se for carregamento do localStorage
      const savedCity = localStorage.getItem("selectedCity");
      if (!savedCity || savedCity !== selectedCity) {
        // Só resetar se não for a cidade salva
        const isCityInList = stateCities.includes(selectedCity);
        if (!isCityInList && savedCity !== selectedCity) {
          setSelectedCity("");
        }
      }
    } else {
      setCities([]);
    }
  }, [selectedState, states]);

  // Função para detectar localização
  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Usar API de geocoding reversa para obter cidade/estado
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            if (data.address) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.municipality ||
                "";
              const state = data.address.state || "";

              if (city && state) {
                setCurrentLocation(`${city}, ${state}`);
              }
            }
          } catch (error) {
            console.error("Erro ao detectar localização:", error);
          }
        },
        (error) => {
          console.error("Erro ao obter geolocalização:", error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Tiago Delivery
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#produtos" className="text-gray-700 hover:text-gray-900">
                Produtos
              </a>
              <a href="#lojas" className="text-gray-700 hover:text-gray-900">
                Lojas
              </a>
              <a href="#sobre" className="text-gray-700 hover:text-gray-900">
                Sobre
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Olá, {session.user?.name}
                  </span>
                  <Link
                    href="/painel"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Painel
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Entrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Delivery Rápido e Confiável
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Descubra produtos deliciosos das melhores lojas da sua região.
              Faça seu pedido com apenas alguns cliques.
            </p>

            {/* Seletor de Localização */}
            <div className="max-w-2xl mx-auto mb-8">
              {currentLocation && (
                <div className="text-center mb-4 flex items-center justify-center gap-3">
                  <p className="text-lg">
                    📍 Você está em:{" "}
                    <span className="font-semibold">{currentLocation}</span>
                  </p>
                  <button
                    onClick={() => {
                      setSelectedState("");
                      setSelectedCity("");
                      setCurrentLocation("");
                      localStorage.removeItem("selectedState");
                      localStorage.removeItem("selectedCity");
                      localStorage.removeItem("selectedStateName");
                    }}
                    className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                    title="Mudar localização"
                  >
                    Mudar
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-gray-900 font-semibold text-lg mb-4 text-center">
                  Selecione sua localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Seletor de Estado */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Estado
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Selecione o estado</option>
                      {states.states &&
                        Object.entries(states.states).map(([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Seletor de Cidade */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Cidade
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedState}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedState
                          ? "Selecione a cidade"
                          : "Primeiro selecione o estado"}
                      </option>
                      {Array.isArray(cities) &&
                        cities.map((city, index) => (
                          <option key={index} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={
                  selectedCity && selectedState
                    ? `/lojas?cidade=${encodeURIComponent(
                        selectedCity
                      )}&estado=${selectedState}`
                    : "#"
                }
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  selectedCity && selectedState
                    ? "bg-white text-blue-600 hover:bg-gray-100"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!selectedCity || !selectedState) {
                    e.preventDefault();
                  }
                }}
              >
                Ver Lojas
              </Link>
              <Link
                href={
                  selectedCity && selectedState
                    ? `/produtos?cidade=${encodeURIComponent(
                        selectedCity
                      )}&estado=${selectedState}`
                    : "#"
                }
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  selectedCity && selectedState
                    ? "border-2 border-white text-white hover:bg-white hover:text-blue-600"
                    : "border-2 border-gray-400 text-gray-400 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!selectedCity || !selectedState) {
                    e.preventDefault();
                  }
                }}
              >
                Ver Produtos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Últimos Produtos Adicionados */}
      <section id="produtos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Últimos Produtos Adicionados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum produto disponível no momento</p>
              </div>
            ) : (
              latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
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
                    <h4 className="font-semibold text-lg mb-2 text-gray-900">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-1">
                      🏪 {product.store.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      📍 {product.store.city},{" "}
                      {product.store.state.length === 2 &&
                      isNaN(product.store.state)
                        ? product.store.state.toUpperCase()
                        : {
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
                          }[product.store.state] || product.store.state}
                    </p>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </span>
                      <Link
                        href={`/products?storeId=${product.store.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Ver Loja
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Últimas Lojas Adicionadas */}
      <section id="lojas" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Últimas Lojas Adicionadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestStores.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma loja disponível no momento</p>
              </div>
            ) : (
              latestStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-1 text-gray-900">
                    {store.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {store.city},{" "}
                    {store.state.length === 2 && isNaN(store.state)
                      ? store.state.toUpperCase()
                      : {
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
                        }[store.state] || store.state}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{store.category}</span>
                  </p>
                  {store.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {store.description}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 font-medium mb-4">
                    {store._count.products}{" "}
                    {store._count.products === 1
                      ? "produto disponível"
                      : "produtos disponíveis"}
                  </p>
                  <Link
                    href={`/products?storeId=${store.id}`}
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Ver Produtos
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Tiago Delivery</h4>
              <p className="text-gray-400">
                Conectando você aos melhores produtos das melhores lojas.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Links Úteis</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Para Lojas</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Cadastrar Loja
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Central do Vendedor
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Taxas
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <ul className="space-y-2 text-gray-400">
                <li>📧 contato@delivery.com</li>
                <li>📞 (11) 9999-9999</li>
                <li>📍 São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Tiago Delivery. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
