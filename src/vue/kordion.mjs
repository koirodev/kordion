import { h, defineComponent, ref, provide, onMounted, onBeforeUnmount } from "vue";
import KordionCore from "../kordion.mjs";

const KORDION_INJECTION_KEY = "kordion";

export const Kordion = defineComponent({
  name: "Kordion",
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { slots, emit }) {
    const kordionRef = ref(null);
    const instance = ref(null);

    provide(KORDION_INJECTION_KEY, {
      kordionRef,
      instance
    });

    onMounted(() => {
      if (kordionRef.value) {
        const id = `kordion-${Math.random().toString(36).substr(2, 9)}`;
        kordionRef.value.id = id;
        
        const events = {};
        
        if (emit) {
          events.on = {
            show: () => emit("show"),
            hide: () => emit("hide")
          };
          
          events.before = {
            show: () => emit("before-show"),
            hide: () => emit("before-hide")
          };
          
          events.after = {
            show: () => emit("after-show"),
            hide: () => emit("after-hide")
          };
        }

        const finalOptions = {
          ...props.options,
          ...(Object.keys(events).length > 0 ? { events } : {})
        };

        try {
          instance.value = new KordionCore(`#${id}`, finalOptions);
        } catch (error) {
          console.error("Failed to initialize Kordion:", error);
        }
      }
    });

    onBeforeUnmount(() => {
      if (instance.value) {
        instance.value.destroy();
      }
    });

    return () => h("div", {
      ref: kordionRef,
      class: "kordion"
    }, slots.default?.());
  }
});
