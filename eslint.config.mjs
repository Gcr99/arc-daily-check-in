import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "artifacts/**",
      "cache/**",
      "node_modules/**",
      "typechain-types/**"
    ]
  },
  ...nextVitals,
  ...nextTypescript
];

export default eslintConfig;
