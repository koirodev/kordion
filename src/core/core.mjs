class Kordion {
  constructor(kordion, options = {}) {
    try {
      // Инициализация хранилища обработчиков событий в самом начале
      this._eventHandlers = {
        show: [],
        hide: [],
        beforeShow: [],
        beforeHide: [],
        afterShow: [],
        afterHide: []
      };

      if (!kordion) {
        throw new Error("No kordion selector provided!");
      }

      this.selector = kordion;
      this.$kordions = this.selector;

      if (typeof this.selector !== "string") {
        throw new Error("Kordion selector must be a string.");
      }

      this.$kordions = document.querySelectorAll(this.selector);

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
      if (this.settings.effect === "line-by-line") {
        this.settings.effectLineByLine = { ...lineByLineOptions, ...this.settings.effectLineByLine || {} };
      }

      this.validateSettings();
      this.safeInit();

    } catch (error) {
      console.error("Kordion initialization error:", error);
      throw error;
    }
  }

  // Новые методы для работы с событиями | New methods for working with events
  on(eventName, handler) {
    if (!this._eventHandlers[eventName]) {
      console.warn(`Event "${eventName}" is not supported`);
      return this;
    }

    this._eventHandlers[eventName].push(handler);
    return this;
  }

  // Метод для отписки от событий | Method for unsubscribing from events
  off(eventName, handler) {
    if (!this._eventHandlers[eventName]) {
      console.warn(`Event "${eventName}" is not supported`);
      return this;
    }

    const index = this._eventHandlers[eventName].indexOf(handler);
    if (index !== -1) {
      this._eventHandlers[eventName].splice(index, 1);
    }

    return this;
  }

  offAny(handler) {
    for (let eventName in this._eventHandlers) {
      if (this._eventHandlers[eventName].includes(handler)) {
        this.off(eventName, handler);
      }
    }

    return this;
  }

  _emit(eventName, ...args) {
    if (this._eventHandlers && this._eventHandlers[eventName]) {
      this._eventHandlers[eventName].forEach(handler => {
        try {
          handler.apply(this, args);
        } catch (e) {
          console.error(`Error in ${eventName} event handler:`, e);
        }
      });
    }
  }

  // Валидация настроек | Settings validation
  validateSettings() {
    if (typeof this.settings.speed !== "number" || this.settings.speed < 0) {
      throw new Error("Speed must be a positive number");
    }

    if (!this.settings.theme || typeof this.settings.theme !== "string") {
      throw new Error("Theme must be a non-empty string");
    }

    if (typeof this.settings.autoClose !== "boolean") {
      throw new Error("autoClose must be a boolean");
    }

    // Проверка существования необходимых селекторов | Checking the existence of required selectors
    const requiredSelectors = ["container", "parent", "current", "hidden", "content"];
    requiredSelectors.forEach(selector => {
      if (!this.settings[selector]) {
        throw new Error(`Missing required selector: ${selector}`);
      }
    });
  }

  // Безопасная инициализация с обработкой ошибок | Safe initialization with error handling
  safeInit() {
    try {
      if (this.settings.events && this.settings.events.before && typeof this.settings.events.before.init === "function") {
        this.settings.events.before.init(this);
      }

      this.init();

      if (this.settings.events && this.settings.events.after && typeof this.settings.events.after.init === "function") {
        this.settings.events.after.init(this);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      throw error;
    }
  }

  // Инициализация аккордеона | Initializing the accordion
  init() {
    if (!this.$kordions.length) return;

    this.$kordions.forEach((element) => {
      try {
        const instance = this.createInstance(element);
        this.setupInstance(instance, element);
      } catch (error) {
        console.error(`Error initializing accordion element:`, error);
      }
    });

    if (this.settings.events && this.settings.events.on && typeof this.settings.events.on.init === "function") {
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
      container: element.closest(this.settings.container.find((selector) => element.closest(selector))),
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
      let iconList = instance.icon.getAttribute(this.settings.icon.replace(/^\[|\]$/g, ""));
      iconList = iconList.replace(/^\[|\]$/g, "");

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

  // Обработка события клика на аккордеон | Handling a click event on the accordion
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
    if (this.settings.autoClose && instance.container) {
      this.hideAll(instance.container);
    }

    this.toggle(instance);
  }

  // Переключение аккордеона | Toggling the accordion
  toggle(instance) {
    if (instance.kordion.classList.contains(this.settings.activeClass)) {
      this.hide(instance);
    } else {
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
    this._emit("beforeShow", this, instance);
    if (this.settings.events && this.settings.events.before && typeof this.settings.events.before.show === "function") {
      this.settings.events.before.show(this, instance);
    }

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
      this._emit("show", this, instance);
      if (this.settings.events && this.settings.events.on && typeof this.settings.events.on.show === "function") {
        this.settings.events.on.show(this, instance);
      }

      this.replaceIcon(instance, false);
    }, this.settings.speed / 2);

    // Конец анимации аккордеона | End of accordion animation
    clearTimeout(instance.afterToggleTO);
    instance.afterToggleTO = setTimeout(() => {
      instance.content.classList.remove(this.settings.disabledClass);
      instance.hidden.style.removeProperty("max-height");

      if (instance.kordion.classList.contains(this.settings.activeClass)) {
        instance.hidden.classList.add(this.settings.openedClass);
      }

      this._emit("afterShow", this, instance);
      if (this.settings.events && this.settings.events.after && this.settings.events.after.show) {
        this.settings.events.after.show(this, instance);
      }
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
    this._emit("beforeHide", this, instance);
    if (this.settings.events && this.settings.events.before && this.settings.events.before.hide) {
      this.settings.events.before.hide(this, instance);
    }

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
        this._emit("hide", this, instance);
        if (this.settings.events && this.settings.events.on && this.settings.events.on.hide) {
          this.settings.events.on.hide(this, instance);
        }

        this.replaceIcon(instance, true);
      }, this.settings.speed / 2);

      // Окончание закрытия аккордеона | End of closing the accordion
      clearTimeout(instance.afterToggleTO);
      instance.afterToggleTO = setTimeout(() => {
        if (!instance.kordion.classList.contains(this.settings.activeClass)) {
          instance.content.classList.remove(this.settings.disabledClass);
        }

        this._emit("afterHide", this, instance);
        if (this.settings.events && this.settings.events.after && this.settings.events.after.hide) {
          this.settings.events.after.hide(this, instance);
        }
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
  hideEverything(thisSelector = true) {
    document.querySelectorAll(`${thisSelector ? this.selector : ""}.${this.settings.activeClass}`)
      .forEach((element) => {
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
    try {
      if (this.settings.effect === "line-by-line") {
        this.effectLineByLine(instance, road);
      }
    } catch (error) {
      console.error("Effect application error:", error);
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

  // Выделенный метод настройки экземпляра | Dedicated instance setup method
  setupInstance(instance, element) {
    if (this.settings.speed !== 350) {
      element.style.setProperty("--kordion-speed", `${this.settings.speed / 1000}s`);
    }

    element.classList.add(`kordion_${this.settings.theme}`);

    this.bindEvents(instance, element);

    if (element.classList.contains(this.settings.activeClass)) {
      this.show(instance);
    }
  }

  // Обработка событий | Event handling
  bindEvents(instance, element) {
    instance.current.addEventListener("click", (event) => {
      try {
        this.clickHandling(instance, element);
      } catch (error) {
        console.error("Click handling error:", error);
      }
    });
  }
}

export default Kordion;
