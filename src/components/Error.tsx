import React from "react";
import { ApolloError } from "@apollo/client";

interface ErrorProps {
  error: ApolloError;
}

const Error: React.FC<ErrorProps> = ({ error }) => (
  <div className="p-4 bg-red-100 text-red-700 rounded">
    <p>Error: {error.message}</p>
  </div>
);

export default Error;
