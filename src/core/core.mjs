class Kordion {
  constructor(kordion, options = {}) {
    if (!kordion) {
      console.error("No kordion selector provided!");
      return;
    }

    // Default accordion settings
    const defaultOptions = {
      content: "[data-kordion-content]",
      hidden: "[data-kordion-hidden]",
      current: "[data-kordion-current]",
      icon: "[data-kordion-icon]",
      notClose: "[data-kordion-not-close]",
      container: ["[data-kordion-container]", ".section"],
      activeClass: "js-kordion-active",
      iconClass: ".icon",
      speed: 350,
      iconPath: "/sprite.svg#",
      scrollTo: false,
    };

    this.settings = { ...defaultOptions, ...options };
    this.kordion = kordion;

    // Initializing Accordions
    this.initKordions();
  }

  initKordions() {
    const kordions = document.querySelectorAll(this.kordion);
    if (!kordions.length) return;

    kordions.forEach((element) => {
      const kordionInstance = this.createKordionInstance(element);

      if (this.settings.speed != 350) {
        element.style.setProperty("--kordion-speed", `${this.settings.speed / 1000}s`);
      }

      kordionInstance.current.addEventListener("click", () => {
        this.handleKordionClick(kordionInstance, element);
      });

      if (element.classList.contains(this.settings.activeClass)) {
        kordionInstance.show();
      }
    });
  }

  // Creating an Accordion Instance
  createKordionInstance(element) {
    const kordionInstance = {
      kordion: element,
      hidden: element.querySelector(this.settings.hidden),
      content: element.querySelector(this.settings.content),
      current: element.querySelector(this.settings.current),
      kordionIcon: null,
      iconHidden: null,
      iconShow: null
    };

    // Setting up the icon if present
    if (kordionInstance.current.querySelector(this.settings.icon)) {
      kordionInstance.kordionIcon = kordionInstance.current.querySelector(this.settings.icon);
      let iconList = kordionInstance.kordionIcon.getAttribute(this.settings.icon.match(/\[([^\]]+)\]/)[1]);
      iconList = iconList.substring(1, iconList.length - 1);
      const iconArray = iconList.split(",");
      if (iconArray.length === 2) {
        kordionInstance.iconHidden = iconArray[0].trim();
        kordionInstance.iconShow = iconArray[1].trim();
      } else {
        console.error("Invalid data-kordion-icon attribute");
      }

      // Cancel default action when clicking on icon
      kordionInstance.kordionIcon.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }
    return kordionInstance;
  }

  // Handling a click on an accordion
  handleKordionClick(kordionInstance, element) {
    if (kordionInstance.current.closest(this.settings.content)) {
      const parentContent = kordionInstance.current.closest(this.settings.hidden);
      if (element.classList.contains(this.settings.activeClass)) {
        this.hideKordion(kordionInstance);
        parentContent.style.height = `${parentContent.clientHeight - kordionInstance.content.clientHeight}px`;
      } else {
        this.showKordion(kordionInstance);
        parentContent.style.height = `${parentContent.clientHeight + kordionInstance.content.clientHeight}px`;
      }
      return;
    }

    // If the accordion does not close when clicking on certain elements
    if (kordionInstance.current.closest(this.settings.notClose)) {
      this.toggleKordion(kordionInstance);
      return;
    }

    // If the accordion is in a container that covers all accordions
    const containerElement = this.settings.container.find((selector) => kordionInstance.current.closest(selector));
    if (containerElement) {
      this.hideAllKordions(kordionInstance.current.closest(containerElement));
    }

    // Show or hide the accordion
    this.toggleKordion(kordionInstance);
    this.hideNestedKordions(element);
  }

  // Show accordion
  showKordion(kordionInstance) {
    kordionInstance.hidden.style.height = `${kordionInstance.content.clientHeight}px`;
    kordionInstance.kordion.classList.add(this.settings.activeClass);

    // Scroll to accordion
    if (this.settings.scrollTo) {
      kordionInstance.content.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }

    // Replacing the icon
    setTimeout(() => {
      this.replaceIcon(kordionInstance, false);
    }, this.settings.speed / 2);
  }

  // Hide accordion
  hideKordion(kordionInstance) {
    kordionInstance.hidden.style.removeProperty("height");
    kordionInstance.kordion.classList.remove(this.settings.activeClass);

    setTimeout(() => {
      this.replaceIcon(kordionInstance, true);
    }, this.settings.speed / 2);
  }

  // Toggle accordion
  toggleKordion(kordionInstance) {
    // Scroll to accordion
    if (!kordionInstance.kordion.classList.contains(this.settings.activeClass) && this.settings.scrollTo) {
      kordionInstance.content.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }

    kordionInstance.kordion.classList.contains(this.settings.activeClass)
      ? this.hideKordion(kordionInstance)
      : this.showKordion(kordionInstance);

    // ScrollTrigger Update by GSAP
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, this.settings.speed);
    }
  }

  // Replacing the accordion icon
  replaceIcon(kordionInstance, hidden = true) {
    if (!kordionInstance.kordionIcon) return;
    const useTag = kordionInstance.kordionIcon.querySelector("use");
    if (!useTag) {
      console.debug("No use tag found in the kordion icon");
      return;
    }

    const icon = hidden ? kordionInstance.iconHidden : kordionInstance.iconShow;
    useTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.settings.iconPath + icon);
  }

  // Hide all accordions in container
  hideAllKordions(closestObject) {
    closestObject.querySelectorAll(`${this.kordion}.${this.settings.activeClass}`).forEach((activeKordion) => {
      if (activeKordion !== event.target.closest(this.kordion)) {
        const kordionInstance = this.createKordionInstance(activeKordion);
        this.hideKordion(kordionInstance);
      }
    });
  }

  // Hide nested accordions
  hideNestedKordions(container) {
    container.querySelectorAll(this.kordion).forEach((element) => {
      const nestedKordion = this.createKordionInstance(element);
      this.hideKordion(nestedKordion);
    });
  }
}

export default Kordion;
