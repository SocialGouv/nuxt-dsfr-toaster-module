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
    alert: (options) => {
      if (typeof options !== "object") {
        options = { description: options };
      }
      const opts = { ..._options, ...options };
      const toast = useToast(opts);

      if (
        (opts["type"] === "success" || opts["type"] === "error") &&
        _options.maxToasts > 0
      ) {
        toasts
          .slice(0, -_options.maxToasts)
          .filter((toast) => toast.countdown.duration === undefined)
          .forEach((toast) => {
            const duration = options.durationCountdown ?? 5000;
            const id = setTimeout(() => {
              toast.destroy();
            }, duration);
            toast.countdown.destroyId = id;
            toast.countdown.duration = duration;
          });
      }

      return toast;
    },
    info: (options) => {
      if (typeof options !== "object") {
        options = { description: options };
      }
      return toaster.alert({ ...options, "aria-live": "polite", type: "info" });
    },
    warning: (options) => {
      if (typeof options !== "object") {
        options = { description: options };
      }
      return toaster.alert({
        ...options,
        "aria-live": "polite",
        type: "warning",
      });
    },
    success: (options) => {
      if (typeof options !== "object") {
        options = { description: options };
      }
      return toaster.alert({
        ...options,
        role: "alert",
        type: "success",
      });
    },
    error: (options) => {
      if (typeof options !== "object") {
        options = { description: options };
      }
      return toaster.alert({
        ...options,
        role: "alert",
        type: "error",
      });
    },
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
  const countdown = {};

  const options = reactive({
    id: Symbol("useToast"),
    ...withMarkRaw(_options),
  });
  if (options.duration) {
    const id = setTimeout(() => {
      destroy();
    }, options.duration);
    countdown.destroyId = id;
    countdown.duration = options.duration;
  }

  function destroy() {
    const toaster = useToaster();
    const index = toaster.toasts.findIndex((t) => t.options.id === options.id);
    if (index !== -1) toaster.toasts.splice(index, 1);
  }

  if (activeToaster) {
    activeToaster.toasts.push({
      options,
      destroy,
      countdown,
    });
  } else {
    nextTick(() => {
      const toaster = useToaster();
      toaster?.toasts.push({ options, destroy, countdown });
    });
  }

  return {
    options,
    countdown,
    destroy,
  };
}

export function isToastSlotOptions(value) {
  if (typeof value === "object" && value !== null) return "component" in value;
  else return false;
}
