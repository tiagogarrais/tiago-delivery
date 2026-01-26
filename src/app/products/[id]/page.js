"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { formatPrice, getStateDisplay } from "../../../lib/utils";

// Componente de Carrossel de Imagens
function ImageCarousel({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  if (images.length === 1) {
    return (
      <img src={images[0]} alt={alt} className="w-full h-96 object-cover" />
    );
  }

  return (
    <div className="relative w-full h-96">
      <img
        src={images[currentIndex]}
        alt={`${alt} - Imagem ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Setas de navegação */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Carregar dados do produto
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setLoading(true);

        // Buscar produto
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error("Produto não encontrado");
        }

        const productData = await productResponse.json();
        setProduct(productData.product);

        // Buscar loja do produto
        const storeResponse = await fetch(
          `/api/stores?id=${productData.product.storeId}`,
        );
        if (storeResponse.ok) {
          const storeData = await storeResponse.json();
          const foundStore = storeData.stores?.find(
            (s) => s.id === productData.product.storeId,
          );
          setStore(foundStore);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do produto:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const addToCart = async () => {
    if (!product || !store) return;

    setAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Produto adicionado ao carrinho!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Erro ao adicionar ao carrinho");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao adicionar produto ao carrinho");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produto não encontrado
          </h1>
          <Link href="/lojas" className="text-blue-600 hover:text-blue-700">
            Voltar para lojas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Store Info */}
        {store && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <Link
              href={`/lojas/${store.slug}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Voltar para {store.name}
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {store.name}
            </h2>
            {store.description && (
              <p className="text-gray-600">{store.description}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Product Images Carousel */}
            <div className="md:w-1/2 relative">
              {product.images && product.images.length > 0 ? (
                <ImageCarousel images={product.images} alt={product.name} />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    product.available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.available ? "Disponível" : "Indisponível"}
                </span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={
                  addingToCart || !product.available || (store && !store.isOpen)
                }
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {addingToCart ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
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
                ) : (
                  "Adicionar ao Carrinho"
                )}
              </button>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Store Status */}
              {store && !store.isOpen && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Esta loja está fechada no momento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
