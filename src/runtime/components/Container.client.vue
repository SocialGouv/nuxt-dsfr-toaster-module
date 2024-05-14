<script setup>
import { DsfrAlert } from "@gouvminint/vue-dsfr";
import { isToastSlotOptions, useToaster } from "../composables/useToaster";

const { toasts: instances } = useToaster();
const toasts = computed(() => instances.map((i) => i.options));

function resolvedClosed(id) {
  const toast = instances.find((i) => i.options.id === id);
  toast?.options.close?.();
  toast.destroy();
}
</script>

<template>
  <div class="toast-container toast-container--top">
    <DsfrAlert
      v-for="toast in toasts"
      :key="toast.id"
      v-bind="{
        ...(typeof toast.attrs === 'object' ? toast.attrs : {}),
      }"
      @close="() => resolvedClosed(toast.id)"
    >
      <template v-for="(slot, key) in toast.slots" #[key] :key="key">
        <component
          :is="slot.component"
          v-if="isToastSlotOptions(slot)"
          v-bind="slot.attrs"
        />
        <component :is="slot" v-else />
      </template>
    </DsfrAlert>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2em;
  overflow: hidden;
  z-index: 9999;
  pointer-events: none;
}

.toast-container--top {
  flex-direction: column;
}

.fr-alert {
  background-color: white;
  align-self: flex-end;

  display: grid;
  align-items: center;
  animation-duration: 150ms;
  pointer-events: auto;
  min-height: 3em;
  cursor: pointer;
  word-break: break-word;
}
</style>
