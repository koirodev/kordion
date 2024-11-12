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

    // Стандартные настройки аккордеона | Default accordion settings
    const defaultOptions = {
      speed: 350,
      autoClose: false,
      autoCloseNested: false,
      scrollTo: false,
      spritePath: "sprite.svg",
      container: ["[data-kordion-container]", ".section"],
      parent: "[kordion-parent]",
      current: "[data-kordion-current]",
      icon: "[data-kordion-icon]",
      hidden: "[data-kordion-hidden]",
      content: "[data-kordion-content]",
      activeClass: "js-kordion-active",
      openedClass: "js-kordion-opened",
      disabledClass: "js-kordion-disabled",

      // События аккордеона | Accordion events
      events: {
        before: {
          "init": (kordion) => { },
          "show": (kordion, instance) => { },
          "hide": (kordion, instance) => { }
        },
        on: {
          "init": (kordion) => { },
          "show": (kordion, instance) => { },
          "hide": (kordion, instance) => { }
        },
        after: {
          "init": (kordion) => { },
          "show": (kordion, instance) => { },
          "hide": (kordion, instance) => { }
        },
        click: (kordion, event) => { } // любое событие клика на аккордеон | any click event on the accordion
      }
    };

    this.settings = { ...defaultOptions, ...options };

    // Инициализация аккордеона | Initializing the accordion
    this.settings.events.before.init(this);
    this.init();
    this.settings.events.after.init(this);
  }

  // Инициализация аккордеона | Initializing the accordion
  init() {
    if (!this.$kordions.length) return;

    this.$kordions.forEach((element) => {
      const instance = this.createInstance(element);

      // Установка скорости анимации аккордеона
      if (this.settings.speed != 350) {
        element.style.setProperty("--kordion-speed", `${this.settings.speed / 1000}s`);
      }

      // Обработка события клика на аккордеон
      instance.kordion.addEventListener("click", (event) => {
        this.settings.events.click(this, event);
      });

      // Обработка события клика на заголовок аккордеона
      instance.current.addEventListener("click", () => {
        this.clickHandling(instance, element);
      });

      // Показ аккордеона при инициализации
      if (element.classList.contains(this.settings.activeClass)) {
        instance.show();
      }
    });

    this.settings.events.on.init(this);
  }

  // Создание экземпляра аккордеона | Creating an instance of the accordion
  createInstance(element) {
    const instance = {
      kordion: element,
      hidden: element.querySelector(this.settings.hidden),
      content: element.querySelector(this.settings.content),
      current: element.querySelector(this.settings.current),
      icon: null,
      iconHidden: null,
      iconShow: null,
      parent: null,

      // Переменные для таймаутов | Variables for timeouts
      replaceIconTO: null,
      afterToggleTO: null
    };

    // Установка иконки аккордеона | Setting the accordion icon
    if (instance.current.querySelector(this.settings.icon)) {
      instance.icon = instance.current.querySelector(this.settings.icon);
      let iconList = instance.icon.getAttribute(this.settings.icon.match(/\[([^\]]+)\]/)[1]);
      iconList = iconList.substring(1, iconList.length - 1);

      // Разделение иконок на скрытую и показываемую | Separating icons into hidden and shown
      const iconArray = iconList.split(",");
      if (iconArray.length === 2) {
        instance.iconHidden = iconArray[0].trim();
        instance.iconShow = iconArray[1].trim();
      } else {
        console.error("Invalid data-kordion-icon attribute");
      }

      // Отмена действия по умолчанию при нажатии на иконку | Canceling the default action when clicking on the icon
      instance.icon.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }

    // Проверка вложенности аккордеона | Checking the nesting of the accordion
    if (!instance.kordion.closest(this.settings.content)) {
      instance.kordion.setAttribute(this.settings.parent.match(/\[([^\]]+)\]/)[1], "");
    }

    // Поиск родительского элемента аккордеона | Finding the parent element of the accordion
    if (instance.kordion.closest(this.settings.parent)) {
      instance.parent = instance.kordion.closest(this.settings.parent);
    }

    return instance;
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
      this.settings.events.before.hide(this, instance);
      this.hide(instance)
    } else {
      this.settings.events.before.show(this, instance);
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
    instance.hidden.style.maxHeight = `${instance.content.clientHeight}px`;
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

    // Замена иконки аккордеона | Replacing the accordion icon
    clearTimeout(instance.replaceIconTO);
    instance.replaceIconTO = setTimeout(() => {
      this.settings.events.on.show(this, instance);
      this.replaceIcon(instance, false);
    }, this.settings.speed / 2);

    // Конец анимации аккордеона | End of accordion animation
    clearTimeout(instance.afterToggleTO);
    instance.afterToggleTO = setTimeout(() => {
      this.settings.events.after.show(this, instance);
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
    instance.hidden.style.maxHeight = `${instance.content.clientHeight}px`;
    instance.hidden.classList.remove(this.settings.openedClass);
    instance.content.classList.add(this.settings.disabledClass);

    // Основная работа с закрытие аккордеона | Main work with closing the accordion
    setTimeout(() => {
      instance.hidden.style.removeProperty("max-height");
      instance.kordion.classList.remove(this.settings.activeClass);

      // Замена иконки аккордеона | Replacing the accordion icon
      clearTimeout(instance.replaceIconTO);
      instance.replaceIconTO = setTimeout(() => {
        this.replaceIcon(instance, true);
        this.settings.events.on.hide(this, instance);
      }, this.settings.speed / 2);

      // Окончание закрытия аккордеона | End of closing the accordion
      clearTimeout(instance.afterToggleTO);
      instance.afterToggleTO = setTimeout(() => {
        this.settings.events.after.hide(this, instance);
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
    if (!instance.icon) return;

    const useTag = instance.icon.querySelector("use");

    if (!useTag) {
      console.debug("No use tag found in the kordion icon");
      return;
    }

    // Выбор иконки для замены | Selecting an icon to replace
    const icon = hidden ? instance.iconHidden : instance.iconShow;
    useTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `${this.settings.spritePath}#${icon}}`);
  }
}

export default Kordion;
