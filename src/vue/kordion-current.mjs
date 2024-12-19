import { h, defineComponent } from "vue";

export const KordionCurrent = defineComponent({
  name: "KordionCurrent",
  props: {
    selector: {
      type: String,
      default: "div"
    },
    attributes: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { slots }) {
    return () => h(props.selector, {
      "data-kordion-current": "",
      class: "kordion__current",
      ...props.attributes
    }, slots.default?.());
  }
});
