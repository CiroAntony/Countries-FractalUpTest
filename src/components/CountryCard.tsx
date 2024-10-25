import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../graphql/queries";
import { Country } from "../types/types";
import { X } from "lucide-react";

const UNSPLASH_ACCESS_KEY = "OXfJlrHssvKavR0Dj7UKnnLK0tRacGT5zDhGDooOclQ";

interface UnsplashImage {
  urls: {
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

const CountryCard: React.FC = () => {
  const { data, loading, error } = useQuery(GET_COUNTRIES);
  const [images, setImages] = useState<Record<string, UnsplashImage>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchCountryImage = async (countryName: string) => {
    console.log("Iniciando búsqueda para:", countryName);
    console.log("Access Key utilizada:", UNSPLASH_ACCESS_KEY);
    try {
      const url = `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${encodeURIComponent(
        countryName
      )}&orientation=landscape`;
      console.log("URL de la petición:", url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
      console.log("Status de la respuesta:", response.status);
      const data = await response.json();
      console.log("Datos recibidos:", data);
      if (data.results && data.results.length > 0) {
        console.log("Imagen encontrada:", data.results[0].urls.regular);
        setImages((prev) => ({
          ...prev,
          [countryName]: data.results[0],
        }));
      } else {
        console.log("No se encontraron imágenes para:", countryName);
      }
    } catch (error) {
      console.error("Error completo:", error);
    }
  };

  const continents = useMemo(() => {
    if (!data?.countries) return [];
    const uniqueContinents = new Set(
      data.countries.map((country: Country) => country.continent.name)
    );
    return Array.from(uniqueContinents);
  }, [data]);

  const filteredCountries = useMemo(() => {
    if (!data?.countries) return [];
    return data.countries.filter((country: Country) => {
      const matchesSearch = country.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesContinent =
        !selectedContinent || country.continent.name === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [data, searchTerm, selectedContinent]);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedCountry(null);
  };

  React.useEffect(() => {
    if (data?.countries) {
      data.countries.forEach((country: Country) => {
        if (!images[country.name]) {
          fetchCountryImage(country.name);
        }
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Filtros */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <input
          type="text"
          placeholder="Buscar país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedContinent}
          onChange={(e) => setSelectedContinent(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los continentes</option>
          {continents.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de países */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((country: Country) => (
          <div
            key={country.name}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
            onClick={() => handleCountryClick(country)}
          >
            <div className="h-48 overflow-hidden relative bg-gray-100">
              {images[country.name] ? (
                <>
                  <img
                    src={images[country.name].urls.regular}
                    alt={
                      images[country.name].alt_description ||
                      `Imagen de ${country.name}`
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Cargando imagen...</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                {country.name}
              </h2>
              <div className="space-y-2">
                <p>{country.continent.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } z-50`}
      >
        {selectedCountry && (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-600">
                  {selectedCountry.name}
                </h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {images[selectedCountry.name] && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={images[selectedCountry.name].urls.regular}
                      alt={
                        images[selectedCountry.name].alt_description ||
                        `Imagen de ${selectedCountry.name}`
                      }
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Continente
                    </h3>
                    <p className="text-gray-600">
                      {selectedCountry.continent.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default CountryCard;
