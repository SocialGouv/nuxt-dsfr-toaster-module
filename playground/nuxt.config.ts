export default defineNuxtConfig({
  modules: ["../src/module"],
  dsfrToaster: {
    duration: 3000,
    closeable: false,
  },
  css: [
    "@gouvfr/dsfr/dist/dsfr.min.css",
    "@gouvminint/vue-dsfr/styles",
    "@gouvfr/dsfr/dist/utility/icons/icons.min.css",
  ],
});
