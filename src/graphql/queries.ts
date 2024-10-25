import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
  query {
    countries {
      name
      emoji
      continent {
        name
      }
      currencies
      capital
      languages {
        name
      }
      native
      currency
      states {
        name
      }
    }
  }
`;
