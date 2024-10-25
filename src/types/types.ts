export interface Country {
  name: string;
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
