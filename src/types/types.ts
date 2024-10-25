export interface Country {
  name: string;
  emoji: string;
  continent: Continent;
  capital: string;
  languages: Language[];
  native: string;
  currency: string;
  states: State[];
}

export interface Continent {
  name: string;
}

export interface Language {
  name: string;
}

export interface State {
  name: string;
}

export interface UnsplashImage {
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
