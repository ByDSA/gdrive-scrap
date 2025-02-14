// @ts-check

import { Dependencies } from "daproj";
import { generateConfigs } from "daproj/eslint/index.mjs";

const generatedConfigs = generateConfigs( {
  [Dependencies.Jest]: true,
  [Dependencies.Eslint]: true,
  [Dependencies.Prettier]: true,
  [Dependencies.TypeScript]: true,
  [Dependencies.Node]: true,
} );
const infrastructureConfig = [
];

export default [
  ...generatedConfigs,
  ...infrastructureConfig,
];
