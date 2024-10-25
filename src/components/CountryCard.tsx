import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../graphql/queries";
import { Country } from "../types/types";
import { X, Search, ChevronDown } from "lucide-react";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const continents = useMemo((): string[] => {
    if (!data?.countries) return [];
    const uniqueContinents: Set<string> = new Set(
      data.countries.map((country: Country) => country.continent.name)
    );
    return Array.from(uniqueContinents) as string[];
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

  const handleContinentSelect = (continent: string): void => {
    setSelectedContinent(continent);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedContinent("");
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
    <div className="container mx-auto px-4 py-8 relative sm:-mt-11">
      <div className="mb-6 relative" ref={filterRef}>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFilterOpen(true)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-4 z-10">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Filtrar por continente
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {continents.map((continent) => (
                      <button
                        onClick={() => handleContinentSelect(continent)}
                        className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          selectedContinent === continent
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {continent}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedContinent || searchTerm) && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {selectedContinent && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            {selectedContinent}
                            <button
                              onClick={() => setSelectedContinent("")}
                              className="ml-2 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
            <div className="flex items-center ">
              <p className="text-6xl font-bold ml-4">{country.emoji}</p>
              <div className="p-4">
                <h2 className="text-4xl font-bold text-blue-600">
                  {country.name}
                </h2>
                <div className="space-y-2">
                  <p>{country.continent.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } z-50`}
      >
        {selectedCountry && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
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
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {images[selectedCountry.name] && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={images[selectedCountry.name].urls.regular}
                      alt={
                        images[selectedCountry.name].alt_description ||
                        `Imagen de ${selectedCountry.name}`
                      }
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Información General
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Continente
                        </dt>
                        <dd className="text-gray-900">
                          {selectedCountry.continent.name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Capital
                        </dt>
                        <dd className="text-gray-900">
                          {selectedCountry.capital || "No disponible"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Nombre Nativo
                        </dt>
                        <dd className="text-gray-900">
                          {selectedCountry.native || "No disponible"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Moneda
                        </dt>
                        <dd className="text-gray-900">
                          {selectedCountry.currency || "No disponible"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Idiomas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCountry.languages?.map((lang) => (
                        <span
                          key={lang.name}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Estados
                    </h3>
                    <div className="max-h-48 overflow-y-auto pr-2">
                      {selectedCountry.states?.length > 0 ? (
                        <ul className="space-y-1">
                          {selectedCountry.states.map((state) => (
                            <li
                              key={state.name}
                              className="py-1 px-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              {state.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">
                          Este Pais no cuenta con estados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
