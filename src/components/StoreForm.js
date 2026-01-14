"use client";

import { useState, useEffect } from "react";
import { IMaskInput } from "react-imask";

export default function StoreForm({
  onSubmit,
  onCancel,
  initialData = null,
  states = {},
  cities = [],
  submitButtonText = "Cadastrar Loja",
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCodeLoading, setZipCodeLoading] = useState(false);

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

  // Sincronizar valores quando initialData muda (para edição)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setCnpj(initialData.cnpj || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setMinimumOrder(initialData.minimumOrder || "");
      setDeliveryFee(initialData.deliveryFee || "");
      setZipCode(initialData.address?.zipCode || "");
      setStreet(initialData.address?.street || "");
      setNumber(initialData.address?.number || "");
      setComplement(initialData.address?.complement || "");
      setNeighborhood(initialData.address?.neighborhood || "");
      setCity(initialData.address?.city || "");
      setState(initialData.address?.state || "");
    }
  }, [initialData]);

  const handleZipCodeChange = async (value) => {
    setZipCode(value);
    const cleanZipCode = value.replace(/\D/g, "");

    if (cleanZipCode.length === 8) {
      setZipCodeLoading(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanZipCode}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          const stateCode = ufToStateCode[data.uf];
          const cityData = cities.find(
            (city) =>
              city.name.toLowerCase() === data.localidade.toLowerCase() &&
              city.state_id.toString() === stateCode
          );

          // Só atualizar se a API retornar valores
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade) {
            setCity(cityData ? cityData.name : data.localidade);
          }
          if (stateCode) setState(stateCode);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setZipCodeLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      category,
      cnpj,
      phone,
      email,
      minimumOrder: minimumOrder ? parseFloat(minimumOrder) : null,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : null,
      address: {
        zipCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      },
    });
  };

  const formContent = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Nome da Loja */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Loja *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o nome da sua loja"
            required
          />
        </div>

        {/* Descrição */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva sua loja (opcional)"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="restaurante">Restaurante</option>
            <option value="lanchonete">Lanchonete</option>
            <option value="pizzaria">Pizzaria</option>
            <option value="sorveteria">Sorveteria</option>
            <option value="padaria">Padaria</option>
            <option value="mercearia">Mercearia</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ *
          </label>
          <IMaskInput
            mask="00.000.000/0000-00"
            value={cnpj}
            onAccept={(value) => setCnpj(value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00.000.000/0000-00"
            required
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <IMaskInput
            mask="(00) 00000-0000"
            value={phone}
            onAccept={(value) => setPhone(value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(11) 99999-9999"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="contato@sualoja.com"
            required
          />
        </div>

        {/* Valor Mínimo de Compras */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor Mínimo de Compras (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minimumOrder}
            onChange={(e) => setMinimumOrder(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Taxa de Entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa de Entrega (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Endereço da Loja */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Endereço da Loja
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          {/* CEP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP *
            </label>
            <div className="relative">
              <IMaskInput
                mask="00000-000"
                value={zipCode}
                onAccept={handleZipCodeChange}
                placeholder="12345-678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {zipCodeLoading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Rua */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rua *
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome da rua"
            />
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número *
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123"
            />
          </div>

          {/* Complemento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complemento
            </label>
            <input
              type="text"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apto 123, Bloco B"
            />
          </div>

          {/* Bairro */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro *
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Centro"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCity(""); // Limpar cidade quando estado muda
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o estado</option>
              {Object.entries(states).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={!state}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {state ? "Selecione a cidade" : "Selecione o estado primeiro"}
              </option>
              {cities
                .filter((cityItem) => cityItem.state_id.toString() === state)
                .map((cityItem) => (
                  <option key={cityItem.id} value={cityItem.name}>
                    {cityItem.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botões */}
      {submitButtonText && (
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            {submitButtonText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );

  if (submitButtonText) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {formContent}
      </form>
    );
  }

  return formContent;
}
