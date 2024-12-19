class Kordion {
  constructor(kordion, options = {}) {
    if (!kordion) {
      console.error("No kordion selector provided!");
      return;
    }

    this.selector = kordion;
    this.$kordions = this.selector;

    if (typeof this.selector === "string") {
      this.$kordions = document.querySelectorAll(this.selector);
    } else {
      console.error("Kordion can only be a string.");
    }

    const lineByLineOptions = {
      speed: 350,
      easing: "cubic-bezier(.25,.1,.25,1)",
      delay: 30,
      scale: 0.95,
      y: 20,
      x: 0,
      opacity: 0.6,
      clearProps: ["transform", "opacity", "transition"]
    };

    // Стандартные настройки аккордеона | Default accordion settings
    const defaultOptions = {
      speed: 350,
      theme: "clear",
      autoClose: false,
      autoCloseNested: false,
      scrollTo: false,
      spritePath: "sprite.svg",
      getKordionHeight: false,
      container: ["[data-kordion-container]", ".section"],
      parent: "[kordion-parent]",
      current: "[data-kordion-current]",
      icon: "[data-kordion-icon]",
      hidden: "[data-kordion-hidden]",
      content: "[data-kordion-content]",
      activeClass: "js-kordion-active",
      openedClass: "js-kordion-opened",
      disabledClass: "js-kordion-disabled"
    };

    this.settings = { ...defaultOptions, ...options };
    this.settings.effectLineByLine = { ...lineByLineOptions, ...this.settings.effectLineByLine };

    // Инициализация аккордеона | Initializing the accordion
    if (this.settings.events.before.init) {
      this.settings.events.before.init(this);
    }

    this.init();

    if (this.settings.events.after.init) {
      this.settings.events.after.init(this);
    }
  }

  // Инициализация аккордеона | Initializing the accordion
  init() {
    if (!this.$kordions.length) return;

    this.$kordions.forEach((element) => {
      const instance = this.createInstance(element);

      // Установка скорости анимации аккордеона | Setting the accordion animation speed
      if (this.settings.speed != 350) {
        element.style.setProperty("--kordion-speed", `${this.settings.speed / 1000}s`);
      }

      // Установка темы аккордеона | Setting the accordion theme
      element.classList.add(`kordion_${this.settings.theme}`);

      // Обработка события клика на аккордеон
      if (this.settings.events.click) {
        instance.kordion.addEventListener("click", (event) => {
          this.settings.events.click(this, event);
        });
      }

      // Обработка события клика на заголовок аккордеона | Handling a click event on the accordion header
      instance.current.addEventListener("click", () => {
        this.clickHandling(instance, element);
      });

      // Показ аккордеона при инициализации | Showing the accordion when initializing
      if (element.classList.contains(this.settings.activeClass)) {
        this.show(instance);
      }
    });

    if (this.settings.events.on.init) {
      this.settings.events.on.init(this);
    }
  }

  // Создание экземпляра аккордеона | Creating an instance of the accordion
  createInstance(element) {
    const instance = {
      kordion: element,
      hidden: element.querySelector(this.settings.hidden),
      content: element.querySelector(this.settings.content),
      current: element.querySelector(this.settings.current),
      binding: null,
      icon: null,
      iconHidden: null,
      iconShow: null,
      parent: null,

      // Переменные для таймаутов | Variables for timeouts
      replaceIconTO: null,
      afterToggleTO: null
    };

    if (this.settings.getKordionHeight) {
      instance.binding = instance.kordion;
    } else {
      instance.binding = instance.content;
    }

    // Установка иконки аккордеона | Setting the accordion icon
    if (instance.current.querySelector(this.settings.icon)) {
      instance.icon = instance.current.querySelector(this.settings.icon);
      let iconList = instance.icon.getAttribute(this.settings.icon.replace(/^\[|\]$/g, ''));
      iconList = iconList.replace(/^\[|\]$/g, '');

      // Разделение иконок на скрытую и показываемую | Separating icons into hidden and shown
      const iconArray = iconList.split(",");

      if (iconArray.length === 2) {
        instance.iconHidden = iconArray[0].trim();
        instance.iconShow = iconArray[1].trim();
      }

      // Отмена действия по умолчанию при нажатии на иконку | Canceling the default action when clicking on the icon
      instance.icon.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }

    // Проверка необходимости очищения пропсов | Checking the need to clear the props
    if (this.settings.effect === "line-by-line" && this.settings.effectLineByLine.clearProps) {
      instance.clearPropsTO = null;
    }

    // Проверка вложенности аккордеона | Checking the nesting of the accordion
    if (!instance.kordion.closest(this.settings.content)) {
      instance.kordion.setAttribute(this.settings.parent.match(/\[([^\]]+)\]/)[1], "");
    }

    // Поиск родительского элемента аккордеона | Finding the parent element of the accordion
    if (instance.kordion.closest(this.settings.parent)) {
      instance.parent = instance.kordion.closest(this.settings.parent);
    }

    // Обработка аккордеона с темой | Handling an accordion with a theme
    if (!instance.kordion.classList.contains(`kordion_${this.settings.theme}`)) {
      this.setKordionClasses(instance);
    }

    return instance;
  }

  // Установка классов для ключевых объектов аккордеона | Setting classes for key accordion objects
  setKordionClasses(instance) {
    instance.kordion.classList.add("kordion");
    instance.current.classList.add("kordion__current");
    instance.hidden.classList.add("kordion__hidden");
    instance.content.classList.add("kordion__content");

    if (instance.icon) {
      instance.icon.classList.add("kordion__icon");
    }
  }

  // Обработка события клика на аккордеон
  clickHandling(instance, element) {
    // Автоматическое закрытие соседних вложенных аккордеонов | Automatically closing adjacent nested accordions
    if (this.settings.autoCloseNested) {
      const containerElement = instance.current.closest(`.${this.settings.activeClass}`);
      if (containerElement) {
        this.hideAll(containerElement);
      }
    }

    // Если аккордеон находится в контенте | If the accordion is in the content
    if (instance.current.closest(this.settings.content)) {
      element.classList.contains(this.settings.activeClass)
        ? this.hide(instance)
        : this.show(instance);

      return;
    }

    // Если аккордеон находится в контейнере | If the accordion is in a container
    if (this.settings.autoClose) {
      const containerElement = this.settings.container.find((selector) => instance.current.closest(selector));
      if (containerElement) {
        this.hideAll(instance.current.closest(containerElement));
      }
    }

    this.toggle(instance);
  }

  // Переключение аккордеона | Toggling the accordion
  toggle(instance) {
    if (instance.kordion.classList.contains(this.settings.activeClass)) {
      if (this.settings.events.before.hide) {
        this.settings.events.before.hide(this, instance);
      }

      this.hide(instance)
    } else {
      if (this.settings.events.before.show) {
        this.settings.events.before.show(this, instance);
      }

      this.show(instance);
    }

    // Обновление ScrollTrigger | Refreshing the ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, this.settings.speed);
    }
  }

  // Показ аккордеона | Showing the accordion
  show(instance) {
    instance.hidden.style.maxHeight = `${instance.binding.clientHeight}px`;
    instance.kordion.classList.add(this.settings.activeClass);
    instance.content.classList.add(this.settings.disabledClass);

    // Скролл к активному аккордеону | Scroll to the active accordion
    if (this.settings.scrollTo) {
      instance.content.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }

    // Запуск эффектов | Starting effects
    this.effects(instance, true);

    // Замена иконки аккордеона | Replacing the accordion icon
    clearTimeout(instance.replaceIconTO);
    instance.replaceIconTO = setTimeout(() => {
      if (this.settings.events.on.show) {
        this.settings.events.on.show(this, instance);
      }

      this.replaceIcon(instance, false);
    }, this.settings.speed / 2);

    // Конец анимации аккордеона | End of accordion animation
    clearTimeout(instance.afterToggleTO);
    instance.afterToggleTO = setTimeout(() => {
      if (this.settings.events.after.show) {
        this.settings.events.after.show(this, instance);
      }
      
      instance.content.classList.remove(this.settings.disabledClass);

      // Фикс бага с высотой контента | Fixing the content height bug
      instance.hidden.style.removeProperty("max-height");
      instance.hidden.classList.add(this.settings.openedClass);
    }, this.settings.speed);
  }

  // Показ все аккордеонов в контейнере | Showing all accordions in the container
  showAll(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    container.querySelectorAll(this.selector).forEach((element) => {
      this.show(this.createInstance(element));
    });
  }

  // Открытие всех аккордеонов на странице| Opening all accordions
  showEverything() {
    document.querySelectorAll(this.selector).forEach((element) => {
      this.show(this.createInstance(element));
    });
  }

  // Скрытие аккордеона | Hiding the accordion
  hide(instance) {
    // Фикс бага с высотой контента | Fixing the content height bug
    instance.hidden.style.maxHeight = `${instance.binding.clientHeight}px`;
    instance.hidden.classList.remove(this.settings.openedClass);
    instance.content.classList.add(this.settings.disabledClass);

    // Запуск эффектов | Starting effects
    this.effects(instance, false);

    // Основная работа с закрытие аккордеона | Main work with closing the accordion
    setTimeout(() => {
      instance.hidden.style.removeProperty("max-height");
      instance.kordion.classList.remove(this.settings.activeClass);

      // Замена иконки аккордеона | Replacing the accordion icon
      clearTimeout(instance.replaceIconTO);
      instance.replaceIconTO = setTimeout(() => {
        this.replaceIcon(instance, true);

        if (this.settings.events.on.hide) {
          this.settings.events.on.hide(this, instance);
        }
      }, this.settings.speed / 2);

      // Окончание закрытия аккордеона | End of closing the accordion
      clearTimeout(instance.afterToggleTO);
      instance.afterToggleTO = setTimeout(() => {
        if (this.settings.events.after.hide) {
          this.settings.events.after.hide(this, instance);
        }

        instance.content.classList.remove(this.settings.disabledClass);
      }, this.settings.speed);

      // Скрытие вложенных аккордеонов | Hiding nested accordions
      if (instance.kordion.querySelector(`.${this.settings.activeClass}`)) {
        this.hideNested(instance);
      }
    }, 0);
  }

  // Закрытие дочерних аккордеонов | Closing child accordions
  hideNested(instance) {
    instance.kordion.querySelectorAll(this.selector).forEach((nestedKordion) => {
      this.hide(this.createInstance(nestedKordion));
    });
  }

  // Скрытие всех аккордеонов в контейнере | Hiding all accordions
  hideAll(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    container.querySelectorAll(`.${this.settings.activeClass}`).forEach((activeKordion) => {
      if (activeKordion !== event.target.closest(this.selector)) {
        this.hide(this.createInstance(activeKordion));
      }
    });
  }

  // Скрытие всех аккордеонов на странице | Hiding all accordions
  hideEverything() {
    document.querySelectorAll(this.selector).forEach((element) => {
      this.hide(this.createInstance(element));
    });
  }

  // Замена иконки аккордеона | Replacing the accordion icon
  replaceIcon(instance, hidden = true) {
    if (!instance.icon || !instance.iconShow || !instance.iconHidden) return;

    const useTag = instance.icon.querySelector("use");

    if (!useTag) {
      console.debug("No use tag found in the kordion icon");
      return;
    }

    // Выбор иконки для замены | Selecting an icon to replace
    const icon = hidden ? instance.iconHidden : instance.iconShow;
    useTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `${this.settings.spritePath}#${icon}`);
  }

  // Инициализация эффектов | Initializing effects
  effects(instance, road) {
    // road - true - открытие аккордеона | opening the accordion
    // road - false - закрытие аккордеона | closing the accordion

    if (this.settings.effect) {
      if (this.settings.effect === "line-by-line") {
        this.effectLineByLine(instance, road);
      }
    }
  }

  // line-by-line эффект | line-by-line effect
  effectLineByLine(instance, road) {
    if (typeof this.settings.effectLineByLine === "object") {
      let { speed, easing, delay, scale, y, x, opacity, clearProps } = this.settings.effectLineByLine;

      if (typeof y === "number") {
        y = `${y}px`;
      } else if (typeof y === "string") {
        y = `${y}`;
      } else {
        console.error("Invalid line-by-line effect settings");
        y = "20px";
      }

      if (typeof x === "number") {
        x = `${x}px`;
      } else if (typeof x === "string") {
        x = `${x}`;
      } else {
        console.error("Invalid line-by-line effect settings");
        x = "0px";
      }

      const children = instance.content.children;

      function resetProps() {
        clearTimeout(instance.clearPropsTO);
        if (typeof instance.clearPropsTO !== "undefined") {
          if (typeof clearProps === "object") {
            instance.clearPropsTO = setTimeout(() => {
              for (let i = 0; i < children.length; i++) {
                clearProps.forEach((prop) => {
                  children[i].style.removeProperty(prop);
                });
              }
            }, speed + delay * children.length);
          } else if (typeof clearProps === "string") {
            instance.clearPropsTO = setTimeout(() => {
              for (let i = 0; i < children.length; i++) {
                children[i].style.removeProperty(clearProps);
              }
            }, speed + delay * children.length);
          } else if (typeof clearProps === "boolean") {
            instance.clearPropsTO = setTimeout(() => {
              for (let i = 0; i < children.length; i++) {
                children[i].style.removeProperty("transform");
                children[i].style.removeProperty("opacity");
                children[i].style.removeProperty("transition");
                children[i].style.removeProperty("transition-delay");
              }
            }, speed + delay * children.length);
          } else {
            console.error("Invalid line-by-line effect settings");
          }
        }
      }

      if (road) {
        for (let i = 0; i < children.length; i++) {
          children[i].style.transform = `translate(${x}, ${y}) scale(${scale})`;
          children[i].style.opacity = opacity;
        }

        setTimeout(() => {
          for (let i = 0; i < children.length; i++) {
            children[i].style.transition =
              `transform ${speed / 1000}s ${easing}, opacity ${speed / 1000}s ${easing}`;
            children[i].style.transitionDelay = `${delay * i}ms`;
            children[i].style.transform = `translate(0px, 0px) scale(1)`;
            children[i].style.opacity = 1;
          }

          // Очистка пропсов | Clearing props
          resetProps();
        }, 0);
      } else {
        for (let i = children.length - 1; i >= 0; i--) {
          children[i].style.transition = `transform ${speed / 1000}s, opacity ${speed / 1000}s`;
          children[i].style.transitionDelay = `0ms`;
          children[i].style.transform = `translate(${x}, ${y}) scale(${scale})`;
          children[i].style.opacity = opacity;
        }

        // Очистка пропсов | Clearing props
        resetProps();
      }
    } else {
      console.error("Invalid line-by-line effect settings");
    }
  }
}

export default Kordion;
