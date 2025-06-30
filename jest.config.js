/** @type {import('jest').Config} */
const config = {
  transform: {
    "^.+\\.tsx?$": [ 
      "esbuild-jest", 
      {
        format: "esm",
        target: "es2022",
      }     
    ]
  }
};

export default config;