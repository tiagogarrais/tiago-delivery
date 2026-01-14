"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const productId = searchParams.get("id");
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    available: true,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
  }, [session, status, router]);

  // Buscar dados da loja
  useEffect(() => {
    const fetchStore = async () => {
      if (!storeId) return;

      try {
        const response = await fetch("/api/stores");
        if (response.ok) {
          const data = await response.json();
          const foundStore = data.stores?.find((s) => s.id === storeId);
          setStore(foundStore);
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      }
    };

    if (session) {
      fetchStore();
    }
  }, [storeId, session]);

  // Buscar dados do produto
  useEffect(() => {
    const fetchProduct = async () => {
      if (!storeId || !productId) return;

      setLoadingProduct(true);
      try {
        const response = await fetch(`/api/products?storeId=${storeId}`);
        if (response.ok) {
          const data = await response.json();
          const product = data.products?.find((p) => p.id === productId);

          if (product) {
            setFormData({
              name: product.name,
              description: product.description || "",
              price: product.price.toString(),
              image: product.image || "",
              available: product.available,
            });
          } else {
            setErrors(["Produto não encontrado"]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setErrors(["Erro ao carregar dados do produto"]);
      } finally {
        setLoadingProduct(false);
      }
    };

    if (session) {
      fetchProduct();
    }
  }, [storeId, productId, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          ...formData,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Produto atualizado com sucesso!");
        setTimeout(() => {
          router.push(`/products?storeId=${storeId}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || ["Erro ao atualizar produto"]);
      }
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro interno do servidor"]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/products?storeId=${storeId}`);
  };

  if (status === "loading" || loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (!storeId || !productId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Informações incompletas
          </h1>
          <Link
            href="/painel?tab=stores"
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar para lojas
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
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Início
              </Link>
              <Link
                href="/painel"
                className="text-gray-700 hover:text-gray-900"
              >
                Painel
              </Link>
              <Link
                href={`/products?storeId=${storeId}`}
                className="text-blue-600 font-semibold"
              >
                Produtos
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {session?.user?.name}</span>
              <Link
                href={`/products?storeId=${storeId}`}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Store Info */}
        {store && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {store.name}
            </h2>
            {store.description && (
              <p className="text-gray-600">{store.description}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Editar Produto
            </h1>
            <p className="text-gray-600">Atualize as informações do produto</p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Por favor, corrija os seguintes erros:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Redirecionando...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Pizza Margherita"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="available"
                className="ml-2 block text-sm text-gray-900"
              >
                Produto disponível para venda
              </label>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? "Atualizando..." : "Atualizar Produto"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
