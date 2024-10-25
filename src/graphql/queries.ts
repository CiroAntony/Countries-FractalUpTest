import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
  query {
    countries {
      name
      continent {
        name
      }
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
