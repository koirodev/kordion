
/*
 * Kordion 2.0.1
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

      if (speed != 350) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImtvcmRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLb3JkaW9uIHtcbiAgY29uc3RydWN0b3Ioa29yZGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFrb3JkaW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm8ga29yZGlvbiBzZWxlY3RvciBwcm92aWRlZCFcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBhY2NvcmRpb24gc2V0dGluZ3NcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGNvbnRlbnQ6IFwiW2RhdGEta29yZGlvbi1jb250ZW50XVwiLFxuICAgICAgaGlkZGVuOiBcIltkYXRhLWtvcmRpb24taGlkZGVuXVwiLFxuICAgICAgY3VycmVudDogXCJbZGF0YS1rb3JkaW9uLWN1cnJlbnRdXCIsXG4gICAgICBpY29uOiBcIltkYXRhLWtvcmRpb24taWNvbl1cIixcbiAgICAgIG5vdENsb3NlOiBcIltkYXRhLWtvcmRpb24tbm90LWNsb3NlXVwiLFxuICAgICAgY29udGFpbmVyOiBbXCJbZGF0YS1rb3JkaW9uLWNvbnRhaW5lcl1cIiwgXCIuc2VjdGlvblwiXSxcbiAgICAgIGFjdGl2ZUNsYXNzOiBcImpzLWtvcmRpb24tYWN0aXZlXCIsXG4gICAgICBpY29uQ2xhc3M6IFwiLmljb25cIixcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBpY29uUGF0aDogXCIvYXNzZXRzL3RlbXBsYXRlcy9pbWcvc3ByaXRlLnN2ZyNcIixcbiAgICAgIHNjcm9sbFRvOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcbiAgICB0aGlzLmtvcmRpb24gPSBrb3JkaW9uO1xuXG4gICAgLy8gSW5pdGlhbGl6aW5nIEFjY29yZGlvbnNcbiAgICB0aGlzLmluaXRLb3JkaW9ucygpO1xuICB9XG5cbiAgaW5pdEtvcmRpb25zKCkge1xuICAgIGNvbnN0IGtvcmRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmtvcmRpb24pO1xuICAgIGlmICgha29yZGlvbnMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBrb3JkaW9ucy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBrb3JkaW9uSW5zdGFuY2UgPSB0aGlzLmNyZWF0ZUtvcmRpb25JbnN0YW5jZShlbGVtZW50KTtcblxuICAgICAgaWYgKHNwZWVkICE9IDM1MCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1rb3JkaW9uLXNwZWVkXCIsIGAke3RoaXMuc2V0dGluZ3Muc3BlZWQgLyAxMDAwfXNgKTtcbiAgICAgIH1cblxuICAgICAga29yZGlvbkluc3RhbmNlLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVLb3JkaW9uQ2xpY2soa29yZGlvbkluc3RhbmNlLCBlbGVtZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAga29yZGlvbkluc3RhbmNlLnNob3coKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIGFuIEFjY29yZGlvbiBJbnN0YW5jZVxuICBjcmVhdGVLb3JkaW9uSW5zdGFuY2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGtvcmRpb25JbnN0YW5jZSA9IHtcbiAgICAgIGtvcmRpb246IGVsZW1lbnQsXG4gICAgICBoaWRkZW46IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmhpZGRlbiksXG4gICAgICBjb250ZW50OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jb250ZW50KSxcbiAgICAgIGN1cnJlbnQ6IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmN1cnJlbnQpLFxuICAgICAga29yZGlvbkljb246IG51bGwsXG4gICAgICBpY29uSGlkZGVuOiBudWxsLFxuICAgICAgaWNvblNob3c6IG51bGxcbiAgICB9O1xuXG4gICAgLy8gU2V0dGluZyB1cCB0aGUgaWNvbiBpZiBwcmVzZW50XG4gICAgaWYgKGtvcmRpb25JbnN0YW5jZS5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5pY29uKSkge1xuICAgICAga29yZGlvbkluc3RhbmNlLmtvcmRpb25JY29uID0ga29yZGlvbkluc3RhbmNlLmN1cnJlbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmljb24pO1xuICAgICAgbGV0IGljb25MaXN0ID0ga29yZGlvbkluc3RhbmNlLmtvcmRpb25JY29uLmdldEF0dHJpYnV0ZSh0aGlzLnNldHRpbmdzLmljb24ubWF0Y2goL1xcWyhbXlxcXV0rKVxcXS8pWzFdKTtcbiAgICAgIGljb25MaXN0ID0gaWNvbkxpc3Quc3Vic3RyaW5nKDEsIGljb25MaXN0Lmxlbmd0aCAtIDEpO1xuICAgICAgY29uc3QgaWNvbkFycmF5ID0gaWNvbkxpc3Quc3BsaXQoXCIsXCIpO1xuICAgICAgaWYgKGljb25BcnJheS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAga29yZGlvbkluc3RhbmNlLmljb25IaWRkZW4gPSBpY29uQXJyYXlbMF0udHJpbSgpO1xuICAgICAgICBrb3JkaW9uSW5zdGFuY2UuaWNvblNob3cgPSBpY29uQXJyYXlbMV0udHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkludmFsaWQgZGF0YS1rb3JkaW9uLWljb24gYXR0cmlidXRlXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW5jZWwgZGVmYXVsdCBhY3Rpb24gd2hlbiBjbGlja2luZyBvbiBpY29uXG4gICAgICBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbkljb24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrb3JkaW9uSW5zdGFuY2U7XG4gIH1cblxuICAvLyBIYW5kbGluZyBhIGNsaWNrIG9uIGFuIGFjY29yZGlvblxuICBoYW5kbGVLb3JkaW9uQ2xpY2soa29yZGlvbkluc3RhbmNlLCBlbGVtZW50KSB7XG4gICAgaWYgKGtvcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5jb250ZW50KSkge1xuICAgICAgY29uc3QgcGFyZW50Q29udGVudCA9IGtvcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5oaWRkZW4pO1xuICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHRoaXMuaGlkZUtvcmRpb24oa29yZGlvbkluc3RhbmNlKTtcbiAgICAgICAgcGFyZW50Q29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtwYXJlbnRDb250ZW50LmNsaWVudEhlaWdodCAtIGtvcmRpb25JbnN0YW5jZS5jb250ZW50LmNsaWVudEhlaWdodH1weGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNob3dLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSk7XG4gICAgICAgIHBhcmVudENvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gYCR7cGFyZW50Q29udGVudC5jbGllbnRIZWlnaHQgKyBrb3JkaW9uSW5zdGFuY2UuY29udGVudC5jbGllbnRIZWlnaHR9cHhgO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBhY2NvcmRpb24gZG9lcyBub3QgY2xvc2Ugd2hlbiBjbGlja2luZyBvbiBjZXJ0YWluIGVsZW1lbnRzXG4gICAgaWYgKGtvcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5ub3RDbG9zZSkpIHtcbiAgICAgIHRoaXMudG9nZ2xlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBhY2NvcmRpb24gaXMgaW4gYSBjb250YWluZXIgdGhhdCBjb3ZlcnMgYWxsIGFjY29yZGlvbnNcbiAgICBjb25zdCBjb250YWluZXJFbGVtZW50ID0gdGhpcy5zZXR0aW5ncy5jb250YWluZXIuZmluZCgoc2VsZWN0b3IpID0+IGtvcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3Qoc2VsZWN0b3IpKTtcbiAgICBpZiAoY29udGFpbmVyRWxlbWVudCkge1xuICAgICAgdGhpcy5oaWRlQWxsS29yZGlvbnMoa29yZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdChjb250YWluZXJFbGVtZW50KSk7XG4gICAgfVxuXG4gICAgLy8gU2hvdyBvciBoaWRlIHRoZSBhY2NvcmRpb25cbiAgICB0aGlzLnRvZ2dsZUtvcmRpb24oa29yZGlvbkluc3RhbmNlKTtcbiAgICB0aGlzLmhpZGVOZXN0ZWRLb3JkaW9ucyhlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFNob3cgYWNjb3JkaW9uXG4gIHNob3dLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSkge1xuICAgIGtvcmRpb25JbnN0YW5jZS5oaWRkZW4uc3R5bGUuaGVpZ2h0ID0gYCR7a29yZGlvbkluc3RhbmNlLmNvbnRlbnQuY2xpZW50SGVpZ2h0fXB4YDtcbiAgICBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbi5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgLy8gU2Nyb2xsIHRvIGFjY29yZGlvblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnNjcm9sbFRvKSB7XG4gICAgICBrb3JkaW9uSW5zdGFuY2UuY29udGVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiBcInNtb290aFwiLFxuICAgICAgICBibG9jazogXCJzdGFydFwiLFxuICAgICAgICBpbmxpbmU6IFwibmVhcmVzdFwiXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNpbmcgdGhlIGljb25cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVwbGFjZUljb24oa29yZGlvbkluc3RhbmNlLCBmYWxzZSk7XG4gICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCAvIDIpO1xuICB9XG5cbiAgLy8gSGlkZSBhY2NvcmRpb25cbiAgaGlkZUtvcmRpb24oa29yZGlvbkluc3RhbmNlKSB7XG4gICAga29yZGlvbkluc3RhbmNlLmhpZGRlbi5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcImhlaWdodFwiKTtcbiAgICBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbi5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcGxhY2VJY29uKGtvcmRpb25JbnN0YW5jZSwgdHJ1ZSk7XG4gICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCAvIDIpO1xuICB9XG5cbiAgLy8gVG9nZ2xlIGFjY29yZGlvblxuICB0b2dnbGVLb3JkaW9uKGtvcmRpb25JbnN0YW5jZSkge1xuICAgIC8vIFNjcm9sbCB0byBhY2NvcmRpb25cbiAgICBpZiAoIWtvcmRpb25JbnN0YW5jZS5rb3JkaW9uLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSAmJiB0aGlzLnNldHRpbmdzLnNjcm9sbFRvKSB7XG4gICAgICBrb3JkaW9uSW5zdGFuY2UuY29udGVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiBcInNtb290aFwiLFxuICAgICAgICBibG9jazogXCJzdGFydFwiLFxuICAgICAgICBpbmxpbmU6IFwibmVhcmVzdFwiXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBrb3JkaW9uSW5zdGFuY2Uua29yZGlvbi5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcylcbiAgICAgID8gdGhpcy5oaWRlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpXG4gICAgICA6IHRoaXMuc2hvd0tvcmRpb24oa29yZGlvbkluc3RhbmNlKTtcblxuICAgIC8vIFNjcm9sbFRyaWdnZXIgVXBkYXRlIGJ5IEdTQVBcbiAgICBpZiAoU2Nyb2xsVHJpZ2dlcikge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIFNjcm9sbFRyaWdnZXIucmVmcmVzaCgpO1xuICAgICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVwbGFjaW5nIHRoZSBhY2NvcmRpb24gaWNvblxuICByZXBsYWNlSWNvbihrb3JkaW9uSW5zdGFuY2UsIGhpZGRlbiA9IHRydWUpIHtcbiAgICBpZiAoIWtvcmRpb25JbnN0YW5jZS5rb3JkaW9uSWNvbikgcmV0dXJuO1xuICAgIGNvbnN0IHVzZVRhZyA9IGtvcmRpb25JbnN0YW5jZS5rb3JkaW9uSWNvbi5xdWVyeVNlbGVjdG9yKFwidXNlXCIpO1xuICAgIGlmICghdXNlVGFnKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiTm8gdXNlIHRhZyBmb3VuZCBpbiB0aGUga29yZGlvbiBpY29uXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGljb24gPSBoaWRkZW4gPyBrb3JkaW9uSW5zdGFuY2UuaWNvbkhpZGRlbiA6IGtvcmRpb25JbnN0YW5jZS5pY29uU2hvdztcbiAgICB1c2VUYWcuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwieGxpbms6aHJlZlwiLCB0aGlzLnNldHRpbmdzLmljb25QYXRoICsgaWNvbik7XG4gIH1cblxuICAvLyBIaWRlIGFsbCBhY2NvcmRpb25zIGluIGNvbnRhaW5lclxuICBoaWRlQWxsS29yZGlvbnMoY2xvc2VzdE9iamVjdCkge1xuICAgIGNsb3Nlc3RPYmplY3QucXVlcnlTZWxlY3RvckFsbChgJHt0aGlzLmtvcmRpb259LiR7dGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzc31gKS5mb3JFYWNoKChhY3RpdmVLb3JkaW9uKSA9PiB7XG4gICAgICBpZiAoYWN0aXZlS29yZGlvbiAhPT0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QodGhpcy5rb3JkaW9uKSkge1xuICAgICAgICBjb25zdCBrb3JkaW9uSW5zdGFuY2UgPSB0aGlzLmNyZWF0ZUtvcmRpb25JbnN0YW5jZShhY3RpdmVLb3JkaW9uKTtcbiAgICAgICAgdGhpcy5oaWRlS29yZGlvbihrb3JkaW9uSW5zdGFuY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gSGlkZSBuZXN0ZWQgYWNjb3JkaW9uc1xuICBoaWRlTmVzdGVkS29yZGlvbnMoY29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5rb3JkaW9uKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXN0ZWRLb3JkaW9uID0gdGhpcy5jcmVhdGVLb3JkaW9uSW5zdGFuY2UoZWxlbWVudCk7XG4gICAgICB0aGlzLmhpZGVLb3JkaW9uKG5lc3RlZEtvcmRpb24pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
