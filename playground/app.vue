<template>
  <div>
    Nuxt module playground!
    <DsfrToaster />
  </div>
</template>

<script setup>
import { DsfrBadge } from "@gouvminint/vue-dsfr";

const toaster = useToaster();
onMounted(() => {
  toaster.info({
    description: "Va disparaître",
    duration: 2500,
  });
  toaster.info({
    title: "title",
    description: "Small",
    small: true,
  });
  toaster.info({
    title: "title",
    description: "Not small",
    small: false,
  });
  toaster.warning({ description: "warning", closeable: false });
  toaster.success({ title: "Opération réussie", description: "success" });
  toaster.error({
    title: "Une erreur est survenue lors de la saubegarde",
    description: "Veuillez considérer un nouvel échantillon",
  });

  toaster.success({
    // Passe la description via en slot
    slots: {
      default: {
        component: DsfrBadge,
        attrs: { label: "Alerte avec un badge" },
      },
    },
  });
  toaster.success("youyou"); // Passe une description uniquement
});
</script>
