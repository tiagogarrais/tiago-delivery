"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [states, setStates] = useState({});
  const [cities, setCities] = useState([]);

  // Carregar localização salva do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("selectedState");
    const savedCity = localStorage.getItem("selectedCity");

    if (savedState && savedCity) {
      setSelectedState(savedState);
      setSelectedCity(savedCity);
    }
  }, []);

  // Salvar localização quando cidade e estado mudarem
  useEffect(() => {
    if (selectedState && selectedCity) {
      // Salvar automaticamente no localStorage
      localStorage.setItem("selectedState", selectedState);
      localStorage.setItem("selectedCity", selectedCity);
    }
  }, [selectedState, selectedCity]);

  // Carregar dados de estados e cidades
  useEffect(() => {
    const loadStatesData = async () => {
      try {
        const response = await fetch("/estados-cidades2.json");
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error("Erro ao carregar dados de estados:", error);
      }
    };

    loadStatesData();
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
              Delivery na sua cidade
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Descubra produtos das melhores lojas da sua região. Faça seu
              pedido com apenas alguns cliques.
            </p>

            {/* Seletor de Localização */}
            <div className="max-w-2xl mx-auto mb-8">
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

                {/* Botão Ver Lojas da Cidade */}
                <div className="text-center">
                  <Link
                    href={selectedCity && selectedState ? "/lojas" : "#"}
                    className={`inline-block px-6 py-3 rounded-xl font-medium text-base transition-all duration-300 transform ${
                      selectedCity && selectedState
                        ? "bg-blue-700 text-white hover:bg-blue-800 hover:scale-105 shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!selectedCity || !selectedState) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Ver lojas da cidade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <div className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2026 Tiago Delivery. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
