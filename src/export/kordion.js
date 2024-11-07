
/*
 * Kordion 2.0.2
 * https://github.com/koirodev/kordion
 *
 * Copyright 2024 Vitaly Koiro
 *
 * Released under the MIT License
 *
 * Released on: November 08, 2024
*/
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
      iconPath: "/assets/templates/img/sprite.svg#",
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
    if (ScrollTrigger) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImtvcmRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLb3JkaW9uIHtcbiAgY29uc3RydWN0b3Ioa29yZGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFrb3JkaW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm8ga29yZGlvbiBzZWxlY3RvciBwcm92aWRlZCFcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBhY2NvcmRpb24gc2V0dGluZ3NcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGNvbnRlbnQ6IFwiW2RhdGEta29yZGlvbi1jb250ZW50XVwiLFxuICAgICAgaGlkZGVuOiBcIltkYXRhLWtvcmRpb24taGlkZGVuXVwiLFxuICAgICAgY3VycmVudDogXCJbZGF0YS1rb3JkaW9uLWN1cnJlbnRdXCIsXG4gICAgICBpY29uOiBcIltkYXRhLWtvcmRpb24taWNvbl1cIixcbiAgICAgIG5vdENsb3NlOiBcIltkYXRhLWtvcmRpb24tbm90LWNsb3NlXVwiLFxuICAgICAgY29udGFpbmVyOiBbXCJbZGF0YS1rb3JkaW9uLWNvbnRhaW5lcl1cIiwgXCIuc2VjdGlvblwiXSxcbiAgICAgIGFjdGl2ZUNsYXNzOiBcImpzLWtvcmRpb24tYWN0aXZlXCIsXG4gICAgICBpY29uQ2xhc3M6IFwiLmljb25cIixcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBpY29uUGF0aDogXCIvYXNzZXRzL3RlbXBsYXRlcy9pbWcvc3ByaXRlLnN2ZyNcIixcbiAgICAgIHNjcm9sbFRvOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcbiAgICB0aGlzLmtvcmRpb24gPSBrb3JkaW9uO1xuXG4gICAgLy8gSW5pdGlhbGl6aW5nIEFjY29yZGlvbnNcbiAgICB0aGlzLmluaXRLb3JkaW9ucygpO1xuICB9XG5cbiAgaW5pdEtvcmRpb25zKCkge1xuICAgIGNvbnN0IGtvcmRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmtvcmRpb24pO1xuICAgIGlmICgha29yZGlvbnMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBrb3JkaW9ucy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBrb3JkaW9uSW5zdGFuY2UgPSB0aGlzLmNyZWF0ZUtvcmRpb25JbnN0YW5jZShlbGVtZW50KTtcblxuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc3BlZWQgIT0gMzUwKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLWtvcmRpb24tc3BlZWRcIiwgYCR7dGhpcy5zZXR0aW5ncy5zcGVlZCAvIDEwMDB9c2ApO1xuICAgICAgfVxuXG4gICAgICBrb3JkaW9uSW5zdGFuY2UuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmhhbmRsZUtvcmRpb25DbGljayhrb3JkaW9uSW5zdGFuY2UsIGVsZW1lbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICBrb3JkaW9uSW5zdGFuY2Uuc2hvdygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gQ3JlYXRpbmcgYW4gQWNjb3JkaW9uIEluc3RhbmNlXG4gIGNyZWF0ZUtvcmRpb25JbnN0YW5jZShlbGVtZW50KSB7XG4gICAgY29uc3Qga29yZGlvbkluc3RhbmNlID0ge1xuICAgICAga29yZGlvbjogZWxlbWVudCxcbiAgICAgIGhpZGRlbjogZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuaGlkZGVuKSxcbiAgICAgIGNvbnRlbnQ6IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNvbnRlbnQpLFxuICAgICAgY3VycmVudDogZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY3VycmVudCksXG4gICAgICBrb3JkaW9uSWNvbjogbnVsbCxcbiAgICAgIGljb25IaWRkZW46IG51bGwsXG4gICAgICBpY29uU2hvdzogbnVsbFxuICAgIH07XG5cbiAgICAvLyBTZXR0aW5nIHVwIHRoZSBpY29uIGlmIHByZXNlbnRcbiAgICBpZiAoa29yZGlvbkluc3RhbmNlLmN1cnJlbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmljb24pKSB7XG4gICAgICBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbkljb24gPSBrb3JkaW9uSW5zdGFuY2UuY3VycmVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuaWNvbik7XG4gICAgICBsZXQgaWNvbkxpc3QgPSBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbkljb24uZ2V0QXR0cmlidXRlKHRoaXMuc2V0dGluZ3MuaWNvbi5tYXRjaCgvXFxbKFteXFxdXSspXFxdLylbMV0pO1xuICAgICAgaWNvbkxpc3QgPSBpY29uTGlzdC5zdWJzdHJpbmcoMSwgaWNvbkxpc3QubGVuZ3RoIC0gMSk7XG4gICAgICBjb25zdCBpY29uQXJyYXkgPSBpY29uTGlzdC5zcGxpdChcIixcIik7XG4gICAgICBpZiAoaWNvbkFycmF5Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICBrb3JkaW9uSW5zdGFuY2UuaWNvbkhpZGRlbiA9IGljb25BcnJheVswXS50cmltKCk7XG4gICAgICAgIGtvcmRpb25JbnN0YW5jZS5pY29uU2hvdyA9IGljb25BcnJheVsxXS50cmltKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBkYXRhLWtvcmRpb24taWNvbiBhdHRyaWJ1dGVcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBkZWZhdWx0IGFjdGlvbiB3aGVuIGNsaWNraW5nIG9uIGljb25cbiAgICAgIGtvcmRpb25JbnN0YW5jZS5rb3JkaW9uSWNvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtvcmRpb25JbnN0YW5jZTtcbiAgfVxuXG4gIC8vIEhhbmRsaW5nIGEgY2xpY2sgb24gYW4gYWNjb3JkaW9uXG4gIGhhbmRsZUtvcmRpb25DbGljayhrb3JkaW9uSW5zdGFuY2UsIGVsZW1lbnQpIHtcbiAgICBpZiAoa29yZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdCh0aGlzLnNldHRpbmdzLmNvbnRlbnQpKSB7XG4gICAgICBjb25zdCBwYXJlbnRDb250ZW50ID0ga29yZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdCh0aGlzLnNldHRpbmdzLmhpZGRlbik7XG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgdGhpcy5oaWRlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpO1xuICAgICAgICBwYXJlbnRDb250ZW50LnN0eWxlLmhlaWdodCA9IGAke3BhcmVudENvbnRlbnQuY2xpZW50SGVpZ2h0IC0ga29yZGlvbkluc3RhbmNlLmNvbnRlbnQuY2xpZW50SGVpZ2h0fXB4YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2hvd0tvcmRpb24oa29yZGlvbkluc3RhbmNlKTtcbiAgICAgICAgcGFyZW50Q29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtwYXJlbnRDb250ZW50LmNsaWVudEhlaWdodCArIGtvcmRpb25JbnN0YW5jZS5jb250ZW50LmNsaWVudEhlaWdodH1weGA7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGFjY29yZGlvbiBkb2VzIG5vdCBjbG9zZSB3aGVuIGNsaWNraW5nIG9uIGNlcnRhaW4gZWxlbWVudHNcbiAgICBpZiAoa29yZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdCh0aGlzLnNldHRpbmdzLm5vdENsb3NlKSkge1xuICAgICAgdGhpcy50b2dnbGVLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGFjY29yZGlvbiBpcyBpbiBhIGNvbnRhaW5lciB0aGF0IGNvdmVycyBhbGwgYWNjb3JkaW9uc1xuICAgIGNvbnN0IGNvbnRhaW5lckVsZW1lbnQgPSB0aGlzLnNldHRpbmdzLmNvbnRhaW5lci5maW5kKChzZWxlY3RvcikgPT4ga29yZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdChzZWxlY3RvcikpO1xuICAgIGlmIChjb250YWluZXJFbGVtZW50KSB7XG4gICAgICB0aGlzLmhpZGVBbGxLb3JkaW9ucyhrb3JkaW9uSW5zdGFuY2UuY3VycmVudC5jbG9zZXN0KGNvbnRhaW5lckVsZW1lbnQpKTtcbiAgICB9XG5cbiAgICAvLyBTaG93IG9yIGhpZGUgdGhlIGFjY29yZGlvblxuICAgIHRoaXMudG9nZ2xlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpO1xuICAgIHRoaXMuaGlkZU5lc3RlZEtvcmRpb25zKGVsZW1lbnQpO1xuICB9XG5cbiAgLy8gU2hvdyBhY2NvcmRpb25cbiAgc2hvd0tvcmRpb24oa29yZGlvbkluc3RhbmNlKSB7XG4gICAga29yZGlvbkluc3RhbmNlLmhpZGRlbi5zdHlsZS5oZWlnaHQgPSBgJHtrb3JkaW9uSW5zdGFuY2UuY29udGVudC5jbGllbnRIZWlnaHR9cHhgO1xuICAgIGtvcmRpb25JbnN0YW5jZS5rb3JkaW9uLmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICAvLyBTY3JvbGwgdG8gYWNjb3JkaW9uXG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2Nyb2xsVG8pIHtcbiAgICAgIGtvcmRpb25JbnN0YW5jZS5jb250ZW50LnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgYmVoYXZpb3I6IFwic21vb3RoXCIsXG4gICAgICAgIGJsb2NrOiBcInN0YXJ0XCIsXG4gICAgICAgIGlubGluZTogXCJuZWFyZXN0XCJcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJlcGxhY2luZyB0aGUgaWNvblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5yZXBsYWNlSWNvbihrb3JkaW9uSW5zdGFuY2UsIGZhbHNlKTtcbiAgICB9LCB0aGlzLnNldHRpbmdzLnNwZWVkIC8gMik7XG4gIH1cblxuICAvLyBIaWRlIGFjY29yZGlvblxuICBoaWRlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpIHtcbiAgICBrb3JkaW9uSW5zdGFuY2UuaGlkZGVuLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiaGVpZ2h0XCIpO1xuICAgIGtvcmRpb25JbnN0YW5jZS5rb3JkaW9uLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVwbGFjZUljb24oa29yZGlvbkluc3RhbmNlLCB0cnVlKTtcbiAgICB9LCB0aGlzLnNldHRpbmdzLnNwZWVkIC8gMik7XG4gIH1cblxuICAvLyBUb2dnbGUgYWNjb3JkaW9uXG4gIHRvZ2dsZUtvcmRpb24oa29yZGlvbkluc3RhbmNlKSB7XG4gICAgLy8gU2Nyb2xsIHRvIGFjY29yZGlvblxuICAgIGlmICgha29yZGlvbkluc3RhbmNlLmtvcmRpb24uY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpICYmIHRoaXMuc2V0dGluZ3Muc2Nyb2xsVG8pIHtcbiAgICAgIGtvcmRpb25JbnN0YW5jZS5jb250ZW50LnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgYmVoYXZpb3I6IFwic21vb3RoXCIsXG4gICAgICAgIGJsb2NrOiBcInN0YXJ0XCIsXG4gICAgICAgIGlubGluZTogXCJuZWFyZXN0XCJcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGtvcmRpb25JbnN0YW5jZS5rb3JkaW9uLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKVxuICAgICAgPyB0aGlzLmhpZGVLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSlcbiAgICAgIDogdGhpcy5zaG93S29yZGlvbihrb3JkaW9uSW5zdGFuY2UpO1xuXG4gICAgLy8gU2Nyb2xsVHJpZ2dlciBVcGRhdGUgYnkgR1NBUFxuICAgIGlmIChTY3JvbGxUcmlnZ2VyKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgU2Nyb2xsVHJpZ2dlci5yZWZyZXNoKCk7XG4gICAgICB9LCB0aGlzLnNldHRpbmdzLnNwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXBsYWNpbmcgdGhlIGFjY29yZGlvbiBpY29uXG4gIHJlcGxhY2VJY29uKGtvcmRpb25JbnN0YW5jZSwgaGlkZGVuID0gdHJ1ZSkge1xuICAgIGlmICgha29yZGlvbkluc3RhbmNlLmtvcmRpb25JY29uKSByZXR1cm47XG4gICAgY29uc3QgdXNlVGFnID0ga29yZGlvbkluc3RhbmNlLmtvcmRpb25JY29uLnF1ZXJ5U2VsZWN0b3IoXCJ1c2VcIik7XG4gICAgaWYgKCF1c2VUYWcpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJObyB1c2UgdGFnIGZvdW5kIGluIHRoZSBrb3JkaW9uIGljb25cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaWNvbiA9IGhpZGRlbiA/IGtvcmRpb25JbnN0YW5jZS5pY29uSGlkZGVuIDoga29yZGlvbkluc3RhbmNlLmljb25TaG93O1xuICAgIHVzZVRhZy5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJ4bGluazpocmVmXCIsIHRoaXMuc2V0dGluZ3MuaWNvblBhdGggKyBpY29uKTtcbiAgfVxuXG4gIC8vIEhpZGUgYWxsIGFjY29yZGlvbnMgaW4gY29udGFpbmVyXG4gIGhpZGVBbGxLb3JkaW9ucyhjbG9zZXN0T2JqZWN0KSB7XG4gICAgY2xvc2VzdE9iamVjdC5xdWVyeVNlbGVjdG9yQWxsKGAke3RoaXMua29yZGlvbn0uJHt0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzfWApLmZvckVhY2goKGFjdGl2ZUtvcmRpb24pID0+IHtcbiAgICAgIGlmIChhY3RpdmVLb3JkaW9uICE9PSBldmVudC50YXJnZXQuY2xvc2VzdCh0aGlzLmtvcmRpb24pKSB7XG4gICAgICAgIGNvbnN0IGtvcmRpb25JbnN0YW5jZSA9IHRoaXMuY3JlYXRlS29yZGlvbkluc3RhbmNlKGFjdGl2ZUtvcmRpb24pO1xuICAgICAgICB0aGlzLmhpZGVLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBIaWRlIG5lc3RlZCBhY2NvcmRpb25zXG4gIGhpZGVOZXN0ZWRLb3JkaW9ucyhjb250YWluZXIpIHtcbiAgICBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCh0aGlzLmtvcmRpb24pLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGNvbnN0IG5lc3RlZEtvcmRpb24gPSB0aGlzLmNyZWF0ZUtvcmRpb25JbnN0YW5jZShlbGVtZW50KTtcbiAgICAgIHRoaXMuaGlkZUtvcmRpb24obmVzdGVkS29yZGlvbik7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
