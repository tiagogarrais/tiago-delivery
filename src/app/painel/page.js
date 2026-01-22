"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { IMaskInput } from "react-imask";
import AddressForm from "../../components/AddressForm";

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    whatsapp: "",
    whatsappCountryCode: "55", // Padrão Brasil
    whatsappConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    isPrimary: false,
  });
  const [states, setStates] = useState({});
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showStoreForm, setShowStoreForm] = useState(false);

  // Ler parâmetro tab da URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["personal", "addresses", "stores"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [editingStore, setEditingStore] = useState(null);
  const [storeFormData, setStoreFormData] = useState({
    name: "",
    description: "",
    category: "",
    cnpj: "",
    phone: "",
    email: "",
    minimumOrder: "",
    deliveryFee: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });
  const [storeZipCodeLoading, setStoreZipCodeLoading] = useState(false);
  const [storeFilteredCities, setStoreFilteredCities] = useState([]);
  const [stores, setStores] = useState([]);

  // Mapeamento de UF para código de estado
  const ufToStateCode = {
    RO: "11",
    AC: "12",
    AM: "13",
    RR: "14",
    PA: "15",
    AP: "16",
    TO: "17",
    MA: "21",
    PI: "22",
    CE: "23",
    RN: "24",
    PB: "25",
    PE: "26",
    AL: "27",
    SE: "28",
    BA: "29",
    MG: "31",
    ES: "32",
    RJ: "33",
    SP: "35",
    PR: "41",
    SC: "42",
    RS: "43",
    MS: "50",
    MT: "51",
    GO: "52",
    DF: "53",
  };

  // Mapeamento reverso: código de estado para UF
  const stateCodeToUf = Object.fromEntries(
    Object.entries(ufToStateCode).map(([uf, code]) => [code, uf])
  );

  // Buscar lista de países
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries);
        }
      } catch (error) {
        console.error("Erro ao buscar países:", error);
      }
    };
    fetchCountries();
  }, []);

  // Buscar dados de estados e cidades
  useEffect(() => {
    const fetchStatesAndCities = async () => {
      try {
        const res = await fetch("/estados-cidades2.json");
        if (res.ok) {
          const data = await res.json();
          setStates(data.states);
          setCities(data.cities);
        }
      } catch (error) {
        console.error("Erro ao buscar estados e cidades:", error);
      }
    };
    fetchStatesAndCities();
  }, []);

  // Buscar lojas do usuário
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/stores");
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas lojas do proprietário
          const myStores = (data.stores || []).filter((store) => store.isOwner);
          setStores(myStores);
        }
      } catch (error) {
        console.error("Erro ao buscar lojas:", error);
      }
    };

    if (session) {
      fetchStores();
    }
  }, [session, successMessage]);

  // Buscar endereços
  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");

    // Buscar dados do perfil via API
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.user.fullName || "",
            birthDate: data.user.birthDate || "",
            cpf: data.user.cpf || "",
            whatsapp: data.user.whatsapp || "",
            whatsappCountryCode: data.user.whatsappCountryCode || "55",
            whatsappConsent: data.user.whatsappConsent || false,
          });
        } else {
          // Se não conseguir buscar, usar dados da sessão como fallback
          setFormData({
            fullName: "",
            birthDate: session.user.birthDate
              ? new Date(session.user.birthDate).toISOString().split("T")[0]
              : "",
            cpf: session.user.cpf || "",
            whatsapp: session.user.whatsapp || "",
            whatsappCountryCode: session.user.whatsappCountryCode || "55",
            whatsappConsent: session.user.whatsappConsent || false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        // Fallback para dados da sessão
        setFormData({
          fullName: "",
          birthDate: session.user.birthDate
            ? new Date(session.user.birthDate).toISOString().split("T")[0]
            : "",
          cpf: session.user.cpf || "",
          whatsapp: session.user.whatsapp || "",
          whatsappConsent: session.user.whatsappConsent || false,
        });
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]); // Limpar erros anteriores

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccessMessage("Perfil salvo com sucesso!");
    } else {
      try {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else {
          setErrors(["Erro ao salvar perfil. Tente novamente."]);
        }
      } catch {
        setErrors(["Erro ao salvar perfil. Tente novamente."]);
      }
    }
    setLoading(false);
  };

  // Filtrar cidades baseado no estado selecionado
  useEffect(() => {
    if (addressFormData.state) {
      const stateCities = cities.filter(
        (city) => city.state_id.toString() === addressFormData.state
      );
      setFilteredCities(stateCities);
    } else {
      setFilteredCities([]);
    }
  }, [addressFormData.state, cities]);

  // Filtrar cidades da loja baseado no estado selecionado
  useEffect(() => {
    if (storeFormData.address.state) {
      const stateCities = cities.filter(
        (city) => city.state_id.toString() === storeFormData.address.state
      );
      setStoreFilteredCities(stateCities);
    } else {
      setStoreFilteredCities([]);
    }
  }, [storeFormData.address.state, cities]);

  // Funções para gerenciar endereços
  const handleAddressSubmit = async (formData) => {
    const url = editingAddress ? "/api/addresses" : "/api/addresses";
    const method = editingAddress ? "PUT" : "POST";
    const data = editingAddress
      ? { ...formData, id: editingAddress.id }
      : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressFormData({
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
          isPrimary: false,
        });
      } else {
        alert("Erro ao salvar endereço");
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      alert("Erro ao salvar endereço");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isPrimary: address.isPrimary,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Tem certeza de que deseja remover este endereço?")) {
      return;
    }

    try {
      const res = await fetch(`/api/addresses?id=${addressId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAddresses();
      } else {
        alert("Erro ao remover endereço");
      }
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      alert("Erro ao remover endereço");
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressFormData({
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      isPrimary: false,
    });
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await fetch("/api/stores", {
        method: editingStore ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeFormData),
      });

      if (response.ok) {
        setSuccessMessage(
          editingStore
            ? "Loja atualizada com sucesso!"
            : "Loja cadastrada com sucesso!"
        );
        setShowStoreForm(false);
        setEditingStore(null);
        setStoreFormData({
          name: "",
          description: "",
          category: "",
          cnpj: "",
          phone: "",
          email: "",
          minimumOrder: "",
          deliveryFee: "",
          address: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
          },
        });
        // Aqui você pode adicionar lógica para recarregar a lista de lojas
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || ["Erro ao salvar loja"]);
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro interno do servidor"]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelStoreForm = () => {
    setShowStoreForm(false);
    setEditingStore(null);
    setStoreFormData({
      name: "",
      description: "",
      category: "",
      cnpj: "",
      phone: "",
      email: "",
      minimumOrder: "",
      deliveryFee: "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Tem certeza que deseja remover sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Conta removida com sucesso!");
        await signOut({ callbackUrl: "/" });
      } else {
        alert("Erro ao remover conta. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao remover conta:", error);
      alert("Erro ao remover conta. Tente novamente.");
    }
    setLoading(false);
  };

  const handleZipCodeChange = async (value) => {
    // Atualizar o valor do CEP
    setAddressFormData({ ...addressFormData, zipCode: value });

    // Remover caracteres não numéricos
    const cleanZipCode = value.replace(/\D/g, "");

    // Se o CEP tiver 8 dígitos, buscar dados do ViaCEP
    if (cleanZipCode.length === 8) {
      setZipCodeLoading(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanZipCode}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          // Mapear UF para código de estado
          const stateCode = ufToStateCode[data.uf];

          // Encontrar a cidade na lista
          const cityData = cities.find(
            (city) =>
              city.name.toLowerCase() === data.localidade.toLowerCase() &&
              city.state_id.toString() === stateCode
          );

          // Preencher os campos automaticamente
          setAddressFormData((prev) => ({
            ...prev,
            zipCode: value,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: cityData ? cityData.name : data.localidade || prev.city,
            state: stateCode || prev.state,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setZipCodeLoading(false);
      }
    }
  };

  const handleStoreZipCodeChange = async (value) => {
    // Atualizar o valor do CEP
    setStoreFormData((prev) => ({
      ...prev,
      address: { ...prev.address, zipCode: value },
    }));

    // Remover caracteres não numéricos
    const cleanZipCode = value.replace(/\D/g, "");

    // Se o CEP tiver 8 dígitos, buscar dados do ViaCEP
    if (cleanZipCode.length === 8) {
      setStoreZipCodeLoading(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanZipCode}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          // Mapear UF para código de estado
          const stateCode = ufToStateCode[data.uf];

          // Encontrar a cidade na lista
          const cityData = cities.find(
            (city) =>
              city.name.toLowerCase() === data.localidade.toLowerCase() &&
              city.state_id.toString() === stateCode
          );

          // Preencher os campos automaticamente
          setStoreFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              zipCode: value,
              street: data.logradouro || prev.address.street,
              neighborhood: data.bairro || prev.address.neighborhood,
              city: cityData
                ? cityData.name
                : data.localidade || prev.address.city,
              state: stateCode || prev.address.state,
            },
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP da loja:", error);
      } finally {
        setStoreZipCodeLoading(false);
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
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
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Início
              </Link>
              <Link href="#profile" className="text-blue-600 font-semibold">
                Painel
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Meu Painel
            </h1>
            <p className="text-gray-600">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Este e-mail foi validado durante o login e não pode ser alterado.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("personal")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "personal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Meus Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "addresses"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Meus endereços
              </button>
              <button
                onClick={() => setActiveTab("stores")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "stores"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Minhas lojas
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "personal" && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Dados Pessoais
                </h2>
                <Link
                  href="/painel/edit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Editar Dados
                </Link>
              </div>

              {/* Informações Pessoais - Visualização */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nome Completo
                      </label>
                      <p className="text-lg text-gray-900">
                        {formData.fullName || "Não informado"}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        E-mail
                      </label>
                      <p className="text-lg text-gray-900">
                        {session?.user?.email || "Não informado"}
                      </p>
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Data de Nascimento
                      </label>
                      <p className="text-lg text-gray-900">
                        {formData.birthDate
                          ? new Date(
                              formData.birthDate + "T00:00:00"
                            ).toLocaleDateString("pt-BR")
                          : "Não informado"}
                      </p>
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        CPF
                      </label>
                      <p className="text-lg text-gray-900">
                        {formData.cpf || "Não informado"}
                      </p>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        WhatsApp
                      </label>
                      <p className="text-lg text-gray-900">
                        {formData.whatsapp
                          ? `+${formData.whatsappCountryCode} ${formData.whatsapp}`
                          : "Não informado"}
                      </p>
                    </div>

                    {/* Consentimento WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Comunicações via WhatsApp
                      </label>
                      <p className="text-lg text-gray-900">
                        {formData.whatsappConsent ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Aceito
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            Não aceito
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div>
              <div className="mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Meus Endereços
                  </h2>
                  <p className="text-gray-600">
                    Gerencie seus endereços de entrega
                  </p>
                </div>
              </div>

              {/* Lista de Endereços */}
              <div className="space-y-4 mb-8">
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum endereço cadastrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Adicione seu primeiro endereço para facilitar suas
                      compras.
                    </p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {address.isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                              ⭐ Endereço Principal
                            </span>
                          )}
                          <p className="text-lg font-semibold text-gray-900">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-gray-600">
                            {address.neighborhood}, {address.city} -{" "}
                            {stateCodeToUf[address.state] || address.state}
                          </p>
                          <p className="text-gray-600">
                            CEP: {address.zipCode}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link
                            href={`/painel/addresses?id=${address.id}`}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Editar endereço"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Remover endereço"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Botão Novo Endereço - Centralizado */}
              <div className="flex justify-center">
                <Link
                  href="/painel/addresses"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl inline-block"
                >
                  + Novo Endereço
                </Link>
              </div>
            </div>
          )}

          {/* Stores Tab */}
          {activeTab === "stores" && (
            <div>
              <div className="mb-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Minhas Lojas
                  </h2>
                  <p className="text-gray-600">
                    Gerencie suas lojas e estabelecimentos
                  </p>
                </div>
              </div>

              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma loja cadastrada
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Você ainda não possui lojas cadastradas. Crie sua primeira
                    loja para começar a vender.
                  </p>
                  <Link
                    href="/store"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Cadastrar Loja
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {store.name}
                          </h3>
                          {store.description && (
                            <p className="text-gray-600 mt-1">
                              {store.description}
                            </p>
                          )}
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {store.category}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push(`/store?id=${store.id}`)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Editar</span>
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>CNPJ:</strong> {store.cnpj}
                          </p>
                          <p className="text-gray-600">
                            <strong>Telefone:</strong> {store.phone}
                          </p>
                          <p className="text-gray-600">
                            <strong>Email:</strong> {store.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>Endereço:</strong>
                          </p>
                          <p className="text-gray-600">
                            {store.street}, {store.number}
                            {store.complement && ` - ${store.complement}`}
                          </p>
                          <p className="text-gray-600">
                            {store.neighborhood} - {store.city}/
                            {stateCodeToUf[store.state] || store.state}
                          </p>
                          <p className="text-gray-600">CEP: {store.zipCode}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() =>
                            router.push(`/produtos?storeId=${store.id}`)
                          }
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="font-semibold">
                            Gerenciar Produtos
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="text-center mt-8">
                    <Link
                      href="/store"
                      className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Cadastrar Nova Loja
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Zona de Perigo */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Zona de Perigo
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Esta ação não pode ser desfeita. Todos os seus dados serão
              permanentemente removidos.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Removendo..." : "Remover Conta"}
            </button>
          </div>
        </div>
      </main>

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
                  <a href="/" className="hover:text-white">
                    Página Inicial
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="hover:text-white">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#suporte" className="hover:text-white">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Conta</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#profile" className="hover:text-white">
                    Meu Painel
                  </a>
                </li>
                <li>
                  <a href="#pedidos" className="hover:text-white">
                    Meus Pedidos
                  </a>
                </li>
                <li>
                  <a href="#favoritos" className="hover:text-white">
                    Favoritos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <ul className="space-y-2 text-gray-400">
                <li>📧 contato@tiagodelivery.com</li>
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

export default function Profile() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg">Carregando...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
