class Kardion {
  constructor(kardion, options = {}) {
    if (!kardion) {
      console.error("No kardion selector provided!");
      return;
    }

    // Default accordion settings
    const defaultOptions = {
      content: "[data-kardion-content]",
      hidden: "[data-kardion-hidden]",
      current: "[data-kardion-current]",
      icon: "[data-kardion-icon]",
      notClose: "[data-kardion-not-close]",
      container: ["[data-kardion-container]", ".section"],
      activeClass: "js-kardion-active",
      iconClass: ".icon",
      speed: 350,
      iconPath: "/assets/templates/img/sprite.svg#",
      scrollTo: false,
    };

    this.settings = { ...defaultOptions, ...options };
    this.kardion = kardion;

    // Initializing Accordions
    this.initKardions();
  }

  initKardions() {
    const kardions = document.querySelectorAll(this.kardion);
    if (!kardions.length) return;

    kardions.forEach((element) => {
      const kardionInstance = this.createKardionInstance(element);

      if (speed != 350) {
        element.style.setProperty("--kardion-speed", `${this.settings.speed / 1000}s`);
      }

      kardionInstance.current.addEventListener("click", () => {
        this.handleKardionClick(kardionInstance, element);
      });

      if (element.classList.contains(this.settings.activeClass)) {
        kardionInstance.show();
      }
    });
  }

  // Creating an Accordion Instance
  createKardionInstance(element) {
    const kardionInstance = {
      kardion: element,
      hidden: element.querySelector(this.settings.hidden),
      content: element.querySelector(this.settings.content),
      current: element.querySelector(this.settings.current),
      kardionIcon: null,
      iconHidden: null,
      iconShow: null
    };

    // Setting up the icon if present
    if (kardionInstance.current.querySelector(this.settings.icon)) {
      kardionInstance.kardionIcon = kardionInstance.current.querySelector(this.settings.icon);
      let iconList = kardionInstance.kardionIcon.getAttribute(this.settings.icon.match(/\[([^\]]+)\]/)[1]);
      iconList = iconList.substring(1, iconList.length - 1);
      const iconArray = iconList.split(",");
      if (iconArray.length === 2) {
        kardionInstance.iconHidden = iconArray[0].trim();
        kardionInstance.iconShow = iconArray[1].trim();
      } else {
        console.error("Invalid data-kardion-icon attribute");
      }

      // Cancel default action when clicking on icon
      kardionInstance.kardionIcon.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }
    return kardionInstance;
  }

  // Handling a click on an accordion
  handleKardionClick(kardionInstance, element) {
    if (kardionInstance.current.closest(this.settings.content)) {
      const parentContent = kardionInstance.current.closest(this.settings.hidden);
      if (element.classList.contains(this.settings.activeClass)) {
        this.hideKardion(kardionInstance);
        parentContent.style.height = `${parentContent.clientHeight - kardionInstance.content.clientHeight}px`;
      } else {
        this.showKardion(kardionInstance);
        parentContent.style.height = `${parentContent.clientHeight + kardionInstance.content.clientHeight}px`;
      }
      return;
    }

    // If the accordion does not close when clicking on certain elements
    if (kardionInstance.current.closest(this.settings.notClose)) {
      this.toggleKardion(kardionInstance);
      return;
    }

    // If the accordion is in a container that covers all accordions
    const containerElement = this.settings.container.find((selector) => kardionInstance.current.closest(selector));
    if (containerElement) {
      this.hideAllKardions(kardionInstance.current.closest(containerElement));
    }

    // Show or hide the accordion
    this.toggleKardion(kardionInstance);
    this.hideNestedKardions(element);
  }

  // Show accordion
  showKardion(kardionInstance) {
    kardionInstance.hidden.style.height = `${kardionInstance.content.clientHeight}px`;
    kardionInstance.kardion.classList.add(this.settings.activeClass);

    // Scroll to accordion
    if (this.settings.scrollTo) {
      kardionInstance.content.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }

    // Replacing the icon
    setTimeout(() => {
      this.replaceIcon(kardionInstance, false);
    }, this.settings.speed / 2);
  }

  // Hide accordion
  hideKardion(kardionInstance) {
    kardionInstance.hidden.style.removeProperty("height");
    kardionInstance.kardion.classList.remove(this.settings.activeClass);

    setTimeout(() => {
      this.replaceIcon(kardionInstance, true);
    }, this.settings.speed / 2);
  }

  // Toggle accordion
  toggleKardion(kardionInstance) {
    // Scroll to accordion
    if (!kardionInstance.kardion.classList.contains(this.settings.activeClass) && this.settings.scrollTo) {
      kardionInstance.content.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }

    kardionInstance.kardion.classList.contains(this.settings.activeClass)
      ? this.hideKardion(kardionInstance)
      : this.showKardion(kardionInstance);

    // ScrollTrigger Update by GSAP
    if (ScrollTrigger) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, this.settings.speed);
    }
  }

  // Replacing the accordion icon
  replaceIcon(kardionInstance, hidden = true) {
    if (!kardionInstance.kardionIcon) return;
    const useTag = kardionInstance.kardionIcon.querySelector("use");
    if (!useTag) {
      console.debug("No use tag found in the kardion icon");
      return;
    }

    const icon = hidden ? kardionInstance.iconHidden : kardionInstance.iconShow;
    useTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.settings.iconPath + icon);
  }

  // Hide all accordions in container
  hideAllKardions(closestObject) {
    closestObject.querySelectorAll(`${this.kardion}.${this.settings.activeClass}`).forEach((activeKardion) => {
      if (activeKardion !== event.target.closest(this.kardion)) {
        const kardionInstance = this.createKardionInstance(activeKardion);
        this.hideKardion(kardionInstance);
      }
    });
  }

  // Hide nested accordions
  hideNestedKardions(container) {
    container.querySelectorAll(this.kardion).forEach((element) => {
      const nestedKardion = this.createKardionInstance(element);
      this.hideKardion(nestedKardion);
    });
  }
}
