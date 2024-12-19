import { h, defineComponent } from "vue";

export const KordionIcon = defineComponent({
  name: "KordionIcon",
  props: {
    icons: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: "sprite.svg#icon"
    }
  },
  setup(props) {
    return () => h("svg", {
      "data-kordion-icon": props.icons,
      class: "kordion__icon"
    }, [
      h("use", {
        "xlink:href": props.value
      })
    ]);
  }
});
