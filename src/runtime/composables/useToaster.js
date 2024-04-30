import { markRaw, shallowReactive, nextTick, reactive } from "vue";

const toasterSymbol = Symbol("toaster");

let activeToaster;

const setActiveToaster = (toaster) => (activeToaster = toaster);

export function create(_options = {}) {
  const toasts = shallowReactive([]);

  const toaster = markRaw({
    install(app) {
      app.provide(toasterSymbol, toaster);
      app.config.globalProperties.$toaster = toaster;
    },
    toasts,
    get(toastId) {
      return toasts.find((toast) => toast.value.id?.value === toastId);
    },
    alert: (options) => useToast({ ..._options, role: "alert", ...options }),
    info: (options) => toaster.alert({ ...options, type: "info" }),
    warning: (options) => toaster.alert({ ...options, type: "warning" }),
    success: (options) =>
      toaster.alert({ ...options, "aria-live": "polite", type: "success" }),
    error: (options) =>
      toaster.alert({ ...options, "aria-live": "polite", type: "error" }),
    destroy(toastId) {
      return toaster.get(toastId).destroy();
    },
    destroyAll() {
      return Promise.allSettled(
        toasts.reduce((acc, toast) => {
          const promise = toast?.value.close();
          if (promise) acc.push(promise);
          return acc;
        }, []),
      );
    },
  });

  setActiveToaster(toaster);
  return toaster;
}

export function useToaster() {
  return activeToaster;
}

function withMarkRaw(options) {
  const { slots: innerSlots, duration, close, ...attrs } = options;

  const slots =
    typeof innerSlots === "undefined"
      ? {}
      : Object.fromEntries(
          Object.entries(innerSlots).map(([name, maybeComponent]) => {
            if (typeof maybeComponent === "string")
              return [name, maybeComponent];

            if (isToastSlotOptions(maybeComponent)) {
              return [
                name,
                {
                  ...maybeComponent,
                  component: markRaw(maybeComponent.component),
                },
              ];
            }

            return [name, markRaw(maybeComponent)];
          }),
        );

  return {
    attrs,
    duration,
    close,
    slots,
  };
}

function useToast(_options) {
  const options = reactive({
    id: Symbol("useToast"),
    ...withMarkRaw(_options),
  });

  if (activeToaster) {
    activeToaster.toasts.push(options);
  } else {
    nextTick(() => {
      const toaster = useToaster();
      toaster?.toasts.push(options);
    });
  }

  if (options.duration) {
    setTimeout(() => {
      destroy();
    }, options.duration);
  }

  function destroy() {
    const toaster = useToaster();
    const index = toaster.toasts.indexOf(options);
    if (index !== -1) toaster.toasts.splice(index, 1);
  }

  return {
    options,
    destroy,
  };
}

export function isToastSlotOptions(value) {
  if (typeof value === "object" && value !== null) return "component" in value;
  else return false;
}
