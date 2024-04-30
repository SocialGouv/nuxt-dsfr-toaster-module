import { defu } from "defu";

import {
  defineNuxtModule,
  addPlugin,
  addComponent,
  createResolver,
  addImports,
} from "@nuxt/kit";

export interface ModuleOptions {
  closeable?: boolean;
  duration?: number;
  append?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@socialgouv/nuxt-dsfr-toaster",
    configKey: "dsfrToaster",
  },
  defaults: {
    closeable: true,
    duration: 0,
  },
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.dsfrToaster = defu(
      nuxt.options.runtimeConfig.public.dsfrToaster as Required<ModuleOptions>,
      options,
    );

    const resolver = createResolver(import.meta.url);

    addPlugin(
      { src: resolver.resolve("./runtime/plugin"), mode: "client" },
      options,
    );

    addComponent({
      name: "DsfrToaster",
      filePath: resolver.resolve("./runtime/components/Container.client"),
      mode: "client",
    });

    addImports([
      {
        name: "useToaster",
        from: resolver.resolve("runtime/composables/useToaster"),
      },
    ]);
  },
});
