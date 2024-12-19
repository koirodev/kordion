import { Kordion } from "./kordion.mjs";
import { KordionCurrent } from "./kordion-current.mjs";
import { KordionContent } from "./kordion-content.mjs";
import { KordionIcon } from "./kordion-icon.mjs";

export { Kordion, KordionCurrent, KordionContent, KordionIcon };

export default {
  install(app) {
    app.component("Kordion", Kordion);
    app.component("KordionCurrent", KordionCurrent);
    app.component("KordionContent", KordionContent);
    app.component("KordionIcon", KordionIcon);
  }
};
