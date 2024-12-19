import { h, defineComponent } from "vue";

export const KordionContent = defineComponent({
  name: "KordionContent",
  setup(_, { slots }) {
    return () => h("div", {
      "data-kordion-hidden": "",
      class: "kordion__hidden"
    }, [
      h("div", {
        "data-kordion-content": "",
        class: "kordion__content"
      }, slots.default?.())
    ]);
  }
});
