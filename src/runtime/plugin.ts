import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { create } from "./composables/useToaster";

export default defineNuxtPlugin((nuxtApp) => {
  const options = useRuntimeConfig().public.dsfrToaster;
  const toaster = create(options);
  nuxtApp.vueApp.use(toaster);
});
