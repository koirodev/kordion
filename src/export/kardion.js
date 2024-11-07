
/*
 * Kardion 2.0.0
 * https://github.com/koirodev/kardion
 *
 * Copyright 2024 Vitaly Koiro
 *
 * Released under the MIT License
 *
 * Released on: November 08, 2024
*/
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImthcmRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLYXJkaW9uIHtcbiAgY29uc3RydWN0b3Ioa2FyZGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFrYXJkaW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm8ga2FyZGlvbiBzZWxlY3RvciBwcm92aWRlZCFcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBhY2NvcmRpb24gc2V0dGluZ3NcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGNvbnRlbnQ6IFwiW2RhdGEta2FyZGlvbi1jb250ZW50XVwiLFxuICAgICAgaGlkZGVuOiBcIltkYXRhLWthcmRpb24taGlkZGVuXVwiLFxuICAgICAgY3VycmVudDogXCJbZGF0YS1rYXJkaW9uLWN1cnJlbnRdXCIsXG4gICAgICBpY29uOiBcIltkYXRhLWthcmRpb24taWNvbl1cIixcbiAgICAgIG5vdENsb3NlOiBcIltkYXRhLWthcmRpb24tbm90LWNsb3NlXVwiLFxuICAgICAgY29udGFpbmVyOiBbXCJbZGF0YS1rYXJkaW9uLWNvbnRhaW5lcl1cIiwgXCIuc2VjdGlvblwiXSxcbiAgICAgIGFjdGl2ZUNsYXNzOiBcImpzLWthcmRpb24tYWN0aXZlXCIsXG4gICAgICBpY29uQ2xhc3M6IFwiLmljb25cIixcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBpY29uUGF0aDogXCIvYXNzZXRzL3RlbXBsYXRlcy9pbWcvc3ByaXRlLnN2ZyNcIixcbiAgICAgIHNjcm9sbFRvOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcbiAgICB0aGlzLmthcmRpb24gPSBrYXJkaW9uO1xuXG4gICAgLy8gSW5pdGlhbGl6aW5nIEFjY29yZGlvbnNcbiAgICB0aGlzLmluaXRLYXJkaW9ucygpO1xuICB9XG5cbiAgaW5pdEthcmRpb25zKCkge1xuICAgIGNvbnN0IGthcmRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmthcmRpb24pO1xuICAgIGlmICgha2FyZGlvbnMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBrYXJkaW9ucy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBrYXJkaW9uSW5zdGFuY2UgPSB0aGlzLmNyZWF0ZUthcmRpb25JbnN0YW5jZShlbGVtZW50KTtcblxuICAgICAgaWYgKHNwZWVkICE9IDM1MCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KFwiLS1rYXJkaW9uLXNwZWVkXCIsIGAke3RoaXMuc2V0dGluZ3Muc3BlZWQgLyAxMDAwfXNgKTtcbiAgICAgIH1cblxuICAgICAga2FyZGlvbkluc3RhbmNlLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVLYXJkaW9uQ2xpY2soa2FyZGlvbkluc3RhbmNlLCBlbGVtZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAga2FyZGlvbkluc3RhbmNlLnNob3coKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIENyZWF0aW5nIGFuIEFjY29yZGlvbiBJbnN0YW5jZVxuICBjcmVhdGVLYXJkaW9uSW5zdGFuY2UoZWxlbWVudCkge1xuICAgIGNvbnN0IGthcmRpb25JbnN0YW5jZSA9IHtcbiAgICAgIGthcmRpb246IGVsZW1lbnQsXG4gICAgICBoaWRkZW46IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmhpZGRlbiksXG4gICAgICBjb250ZW50OiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jb250ZW50KSxcbiAgICAgIGN1cnJlbnQ6IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmN1cnJlbnQpLFxuICAgICAga2FyZGlvbkljb246IG51bGwsXG4gICAgICBpY29uSGlkZGVuOiBudWxsLFxuICAgICAgaWNvblNob3c6IG51bGxcbiAgICB9O1xuXG4gICAgLy8gU2V0dGluZyB1cCB0aGUgaWNvbiBpZiBwcmVzZW50XG4gICAgaWYgKGthcmRpb25JbnN0YW5jZS5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5pY29uKSkge1xuICAgICAga2FyZGlvbkluc3RhbmNlLmthcmRpb25JY29uID0ga2FyZGlvbkluc3RhbmNlLmN1cnJlbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmljb24pO1xuICAgICAgbGV0IGljb25MaXN0ID0ga2FyZGlvbkluc3RhbmNlLmthcmRpb25JY29uLmdldEF0dHJpYnV0ZSh0aGlzLnNldHRpbmdzLmljb24ubWF0Y2goL1xcWyhbXlxcXV0rKVxcXS8pWzFdKTtcbiAgICAgIGljb25MaXN0ID0gaWNvbkxpc3Quc3Vic3RyaW5nKDEsIGljb25MaXN0Lmxlbmd0aCAtIDEpO1xuICAgICAgY29uc3QgaWNvbkFycmF5ID0gaWNvbkxpc3Quc3BsaXQoXCIsXCIpO1xuICAgICAgaWYgKGljb25BcnJheS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAga2FyZGlvbkluc3RhbmNlLmljb25IaWRkZW4gPSBpY29uQXJyYXlbMF0udHJpbSgpO1xuICAgICAgICBrYXJkaW9uSW5zdGFuY2UuaWNvblNob3cgPSBpY29uQXJyYXlbMV0udHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkludmFsaWQgZGF0YS1rYXJkaW9uLWljb24gYXR0cmlidXRlXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW5jZWwgZGVmYXVsdCBhY3Rpb24gd2hlbiBjbGlja2luZyBvbiBpY29uXG4gICAgICBrYXJkaW9uSW5zdGFuY2Uua2FyZGlvbkljb24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrYXJkaW9uSW5zdGFuY2U7XG4gIH1cblxuICAvLyBIYW5kbGluZyBhIGNsaWNrIG9uIGFuIGFjY29yZGlvblxuICBoYW5kbGVLYXJkaW9uQ2xpY2soa2FyZGlvbkluc3RhbmNlLCBlbGVtZW50KSB7XG4gICAgaWYgKGthcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5jb250ZW50KSkge1xuICAgICAgY29uc3QgcGFyZW50Q29udGVudCA9IGthcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5oaWRkZW4pO1xuICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgIHRoaXMuaGlkZUthcmRpb24oa2FyZGlvbkluc3RhbmNlKTtcbiAgICAgICAgcGFyZW50Q29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtwYXJlbnRDb250ZW50LmNsaWVudEhlaWdodCAtIGthcmRpb25JbnN0YW5jZS5jb250ZW50LmNsaWVudEhlaWdodH1weGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNob3dLYXJkaW9uKGthcmRpb25JbnN0YW5jZSk7XG4gICAgICAgIHBhcmVudENvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gYCR7cGFyZW50Q29udGVudC5jbGllbnRIZWlnaHQgKyBrYXJkaW9uSW5zdGFuY2UuY29udGVudC5jbGllbnRIZWlnaHR9cHhgO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBhY2NvcmRpb24gZG9lcyBub3QgY2xvc2Ugd2hlbiBjbGlja2luZyBvbiBjZXJ0YWluIGVsZW1lbnRzXG4gICAgaWYgKGthcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3QodGhpcy5zZXR0aW5ncy5ub3RDbG9zZSkpIHtcbiAgICAgIHRoaXMudG9nZ2xlS2FyZGlvbihrYXJkaW9uSW5zdGFuY2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBhY2NvcmRpb24gaXMgaW4gYSBjb250YWluZXIgdGhhdCBjb3ZlcnMgYWxsIGFjY29yZGlvbnNcbiAgICBjb25zdCBjb250YWluZXJFbGVtZW50ID0gdGhpcy5zZXR0aW5ncy5jb250YWluZXIuZmluZCgoc2VsZWN0b3IpID0+IGthcmRpb25JbnN0YW5jZS5jdXJyZW50LmNsb3Nlc3Qoc2VsZWN0b3IpKTtcbiAgICBpZiAoY29udGFpbmVyRWxlbWVudCkge1xuICAgICAgdGhpcy5oaWRlQWxsS2FyZGlvbnMoa2FyZGlvbkluc3RhbmNlLmN1cnJlbnQuY2xvc2VzdChjb250YWluZXJFbGVtZW50KSk7XG4gICAgfVxuXG4gICAgLy8gU2hvdyBvciBoaWRlIHRoZSBhY2NvcmRpb25cbiAgICB0aGlzLnRvZ2dsZUthcmRpb24oa2FyZGlvbkluc3RhbmNlKTtcbiAgICB0aGlzLmhpZGVOZXN0ZWRLYXJkaW9ucyhlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFNob3cgYWNjb3JkaW9uXG4gIHNob3dLYXJkaW9uKGthcmRpb25JbnN0YW5jZSkge1xuICAgIGthcmRpb25JbnN0YW5jZS5oaWRkZW4uc3R5bGUuaGVpZ2h0ID0gYCR7a2FyZGlvbkluc3RhbmNlLmNvbnRlbnQuY2xpZW50SGVpZ2h0fXB4YDtcbiAgICBrYXJkaW9uSW5zdGFuY2Uua2FyZGlvbi5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgLy8gU2Nyb2xsIHRvIGFjY29yZGlvblxuICAgIGlmICh0aGlzLnNldHRpbmdzLnNjcm9sbFRvKSB7XG4gICAgICBrYXJkaW9uSW5zdGFuY2UuY29udGVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiBcInNtb290aFwiLFxuICAgICAgICBibG9jazogXCJzdGFydFwiLFxuICAgICAgICBpbmxpbmU6IFwibmVhcmVzdFwiXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNpbmcgdGhlIGljb25cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVwbGFjZUljb24oa2FyZGlvbkluc3RhbmNlLCBmYWxzZSk7XG4gICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCAvIDIpO1xuICB9XG5cbiAgLy8gSGlkZSBhY2NvcmRpb25cbiAgaGlkZUthcmRpb24oa2FyZGlvbkluc3RhbmNlKSB7XG4gICAga2FyZGlvbkluc3RhbmNlLmhpZGRlbi5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcImhlaWdodFwiKTtcbiAgICBrYXJkaW9uSW5zdGFuY2Uua2FyZGlvbi5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnJlcGxhY2VJY29uKGthcmRpb25JbnN0YW5jZSwgdHJ1ZSk7XG4gICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCAvIDIpO1xuICB9XG5cbiAgLy8gVG9nZ2xlIGFjY29yZGlvblxuICB0b2dnbGVLYXJkaW9uKGthcmRpb25JbnN0YW5jZSkge1xuICAgIC8vIFNjcm9sbCB0byBhY2NvcmRpb25cbiAgICBpZiAoIWthcmRpb25JbnN0YW5jZS5rYXJkaW9uLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLnNldHRpbmdzLmFjdGl2ZUNsYXNzKSAmJiB0aGlzLnNldHRpbmdzLnNjcm9sbFRvKSB7XG4gICAgICBrYXJkaW9uSW5zdGFuY2UuY29udGVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiBcInNtb290aFwiLFxuICAgICAgICBibG9jazogXCJzdGFydFwiLFxuICAgICAgICBpbmxpbmU6IFwibmVhcmVzdFwiXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBrYXJkaW9uSW5zdGFuY2Uua2FyZGlvbi5jbGFzc0xpc3QuY29udGFpbnModGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzcylcbiAgICAgID8gdGhpcy5oaWRlS2FyZGlvbihrYXJkaW9uSW5zdGFuY2UpXG4gICAgICA6IHRoaXMuc2hvd0thcmRpb24oa2FyZGlvbkluc3RhbmNlKTtcblxuICAgIC8vIFNjcm9sbFRyaWdnZXIgVXBkYXRlIGJ5IEdTQVBcbiAgICBpZiAoU2Nyb2xsVHJpZ2dlcikge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIFNjcm9sbFRyaWdnZXIucmVmcmVzaCgpO1xuICAgICAgfSwgdGhpcy5zZXR0aW5ncy5zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVwbGFjaW5nIHRoZSBhY2NvcmRpb24gaWNvblxuICByZXBsYWNlSWNvbihrYXJkaW9uSW5zdGFuY2UsIGhpZGRlbiA9IHRydWUpIHtcbiAgICBpZiAoIWthcmRpb25JbnN0YW5jZS5rYXJkaW9uSWNvbikgcmV0dXJuO1xuICAgIGNvbnN0IHVzZVRhZyA9IGthcmRpb25JbnN0YW5jZS5rYXJkaW9uSWNvbi5xdWVyeVNlbGVjdG9yKFwidXNlXCIpO1xuICAgIGlmICghdXNlVGFnKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiTm8gdXNlIHRhZyBmb3VuZCBpbiB0aGUga2FyZGlvbiBpY29uXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGljb24gPSBoaWRkZW4gPyBrYXJkaW9uSW5zdGFuY2UuaWNvbkhpZGRlbiA6IGthcmRpb25JbnN0YW5jZS5pY29uU2hvdztcbiAgICB1c2VUYWcuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwieGxpbms6aHJlZlwiLCB0aGlzLnNldHRpbmdzLmljb25QYXRoICsgaWNvbik7XG4gIH1cblxuICAvLyBIaWRlIGFsbCBhY2NvcmRpb25zIGluIGNvbnRhaW5lclxuICBoaWRlQWxsS2FyZGlvbnMoY2xvc2VzdE9iamVjdCkge1xuICAgIGNsb3Nlc3RPYmplY3QucXVlcnlTZWxlY3RvckFsbChgJHt0aGlzLmthcmRpb259LiR7dGhpcy5zZXR0aW5ncy5hY3RpdmVDbGFzc31gKS5mb3JFYWNoKChhY3RpdmVLYXJkaW9uKSA9PiB7XG4gICAgICBpZiAoYWN0aXZlS2FyZGlvbiAhPT0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QodGhpcy5rYXJkaW9uKSkge1xuICAgICAgICBjb25zdCBrYXJkaW9uSW5zdGFuY2UgPSB0aGlzLmNyZWF0ZUthcmRpb25JbnN0YW5jZShhY3RpdmVLYXJkaW9uKTtcbiAgICAgICAgdGhpcy5oaWRlS2FyZGlvbihrYXJkaW9uSW5zdGFuY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gSGlkZSBuZXN0ZWQgYWNjb3JkaW9uc1xuICBoaWRlTmVzdGVkS2FyZGlvbnMoY29udGFpbmVyKSB7XG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5rYXJkaW9uKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXN0ZWRLYXJkaW9uID0gdGhpcy5jcmVhdGVLYXJkaW9uSW5zdGFuY2UoZWxlbWVudCk7XG4gICAgICB0aGlzLmhpZGVLYXJkaW9uKG5lc3RlZEthcmRpb24pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
