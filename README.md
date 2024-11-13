# Kordion

**Kordion** is a library for quickly creating flexible accordions on a page using JavaScript. It allows you to create accordions with various settings and styles, as well as control them using JavaScript. **Kordion uses vanilla JavaScript** and does not depend on third-party libraries, which makes it lightweight and fast.

## 📋 Table of Contents

- [Getting Started with Kordion](#getting-started-with-kordion)
  - [Installation](#installation)
    - [Install from NPM](#install-from-npm)
    - [Use Kordion from CDN](#use-kordion-from-cdn)
    - [Download](#download)
  - [Kordion HTML Layout](#kordion-html-layout)
  - [Initialize Kordion](#initialize-kordion)
- [Parameters](#parameters)
- [Events](#events)
- [Methods](#methods)
- [Examples](#examples)
- [FAQ](#faq)

## Getting started with Kordion

### Installation

You have several possible options for installing the Kordion:

### Install from NPM

```bash
$ npm install kordion
```

```JavaScript
// Import Kordion JS
import Kordion from "kordion";
// Import Kordion styles
import "kordion/css";

const kordion = new Kordion(...);
```

### Use Kordion from CDN

If you don't want to include Kordion files in your project, you may use it from CDN:

```HTML
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kordion/dist/kordion.min.css">
<script src="https://cdn.jsdelivr.net/npm/kordion/dist/kordion.min.js"></script>
```

If you use ES modules in your browser, there is a CDN version for that:

```HTML
<script type="module">
  import Kordion from "https://cdn.jsdelivr.net/npm/kordion/dist/kordion.min.mjs"

  const kordion = new Kordion(...)
</script>
```

### Download

If you want to use Kordion locally, you can directly download them from: [jsdelivr.com](https://www.jsdelivr.com/package/npm/kordion).

## Kordion HTML Layout

Now, we need to add basic Kordion layout:

```HTML
<!-- The accordion itself -->
<div data-kordion>
  <!-- Accordion Open Button -->
  <button data-kordion-current>
    <span>I am a button!</span>
    <!-- Button icon -->
    <svg data-kordion-icon="[plus, minus]">
      <use xlink:href="sprite.svg#plus"></use>
    </svg>
  </button>
  <!-- Technical wrapping of content -->
  <div data-kordion-hidden>
    <!-- Main content wrapper -->
    <div data-kordion-content>
      <!-- Any of your content can be here, for example: -->
      <article class="article">
        <h2>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit dolorem optio quaerat assumenda cupiditate quasi incidunt totam expedita voluptatem. Tenetur, dolorum quisquam alias sit asperiores dolorem atque cupiditate numquam magnam?
        </p>
      </article>
    </div>
  </div>
</div>
```

## Initialize Kordion

Next we need to initialize Kordion in JavaScript:

```JavaScript
const kordion = new Kordion("[data-kordion]");
```

It's that easy to start working with the accordion. You can also customize its functionality more flexibly.

```JavaScript
const kordion = new Kordion("[data-kordion]", {
  // Options
  speed: 350,
  spritePath: "sprite.svg",
  autoClose: false,
  autoCloseNested: false,
  scrollTo: false,
});
```

These are not all the settings, below you can read about each of them in more detail or see examples of implementation.

### Parameters

<table>
  <table>
    <thead>
      <tr>
        <th>Option</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>speed</code></td>
        <td>Number</td>
        <td><code>350</code></td>
        <td>The speed of the animation when opening and closing the accordion.</td>
      </tr>
      <tr>
        <td><code>theme</code></td>
        <td>String</td>
        <td><code>"default"</code></td>
        <td>Theme setup. Requires connection of styles of the selected theme.</td>
      </tr>
      <tr>
        <td><code>autoClose</code></td>
        <td>Boolean</td>
        <td><code>false</code></td>
        <td>Automatically close accordions in one container when opening a new accordion. To do this, you must additionally add a container selector to the markup.</td>
      </tr>
      <tr>
        <td><code>autoCloseNested</code></td>
        <td>Boolean</td>
        <td><code>false</code></td>
        <td>Automatically close child accordions when opening a second child accordion in one parent accordion.</td>
      </tr>
      <tr>
        <td><code>spritePath</code></td>
        <td>String</td>
        <td><code>"sprite.svg"</code></td>
        <td>Path to sprite with icons, for automatic icon replacement when opening and closing accordion.</td>
      </tr>
      <tr>
        <td><code>container</code></td>
        <td>Object</td>
        <td><code>["[data-kordion-container]", ".section"]</code></td>
        <td>Container selectors, multiple selectors allowed. <br>Used when <code>autoClose: true</code>.</td>
      </tr>
      <tr>
        <td><code>parent</code></td>
        <td>String</td>
        <td><code>"[kordion-parent]"</code></td>
        <td>Added automatically to the parent accordion. Does not require prior specification in HTML markup. <br><b>Only data attribute is allowed.</b></td>
      </tr>
      <tr>
        <td><code>current</code></td>
        <td>String</td>
        <td><code>"[data-kordion-current]"</code></td>
        <td>Accordion opening button selector. Any type of selector is allowed.</td>
      </tr>
      <tr>
        <td><code>icon</code></td>
        <td>String</td>
        <td><code>"[data-kordion-icon]"</code></td>
        <td>Button icon selector. <br><b>Only data attribute is allowed.</b> <br>Accepts two icon names via <code>,</code>. <br>Example: <code>data-kordion-icon="[plus, minus]"</code>. <br>Works only with sprites.</td>
      </tr>
      <tr>
        <td><code>hidden</code></td>
        <td>String</td>
        <td><code>"[data-kordion-hidden]"</code></td>
        <td>Technical content wrapper selector. <br>Any type of selector can be used.</td>
      </tr>
      <tr>
        <td><code>content</code></td>
        <td>String</td>
        <td><code>"[data-kordion-content]"</code></td>
        <td>Primary content selector. <br>Any type of selector can be used.</td>
      </tr>
      <tr>
        <td><code>activeClass</code></td>
        <td>String</td>
        <td><code>"js-kordion-active"</code></td>
        <td>Active accordion class. Set on accordion after opening animation starts and removed when closing animation starts.</td>
      </tr>
      <tr>
        <td><code>openedClass</code></td>
        <td>String</td>
        <td><code>"js-kordion-opened"</code></td>
        <td>Class for a fully expanded accordion. Set to <code>hidden</code> after the opening animation ends, and unset when the closing animation starts.</td>
      </tr>
      <tr>
        <td><code>disabledClass</code></td>
        <td>String</td>
        <td><code>"js-kordion-disabled"</code></td>
        <td>Class for disabling interaction with accordion content when it is opened or closed. Set automatically to <code>content</code></td>
      </tr>
      <tr>
        <td><code>events</code></td>
        <td>Object</td>
        <td></td>
        <td>Register event handlers</td>
      </tr>
    </tbody>
  </table>

### Events

You can register event handlers for the basic accordion actions. Example:

```JavaScript
const kordion = new Kordion("[data-kordion]", {
  on: {
    init: function (kordion) {
      console.log("kordion initialized");
    },
  },
  click: (kordion, event) => {
    console.log("click event", kordion, event);
  },
});
```

The following events are available:

<table>
  <table>
    <thead>
      <tr>
        <th>Group</th>
        <th>Name</th>
        <th>Arguments</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="4"><code>before</code></td>
      </tr>
      <tr>
        <td><code>init</code></td>
        <td><code>(kordion)</code></td>
        <td>Event before accordion initialization</td>
      </tr>
      <tr>
        <td><code>show</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event before the opening of the accordion</td>
      </tr>
      <tr>
        <td><code>hide</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event before accordion closing</td>
      </tr>
      <tr>
        <td rowspan="4"><code>on</code></td>
      </tr>
      <tr>
        <td><code>init</code></td>
        <td><code>(kordion)</code></td>
        <td>Event immediately after accordions are initialized</td>
      </tr>
      <tr>
        <td><code>show</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event during the opening of the accordion</td>
      </tr>
      <tr>
        <td><code>hide</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event during the closing of the accordion</td>
      </tr>
      <tr>
        <td rowspan="4"><code>after</code></td>
      </tr>
      <tr>
        <td><code>init</code></td>
        <td><code>(kordion)</code></td>
        <td>Event after accordion initialization</td>
      </tr>
      <tr>
        <td><code>show</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event after the opening of the accordion</td>
      </tr>
      <tr>
        <td><code>hide</code></td>
        <td><code>(kordion, instance)</code></td>
        <td>Event after accordion closing</td>
      </tr>
      <tr>
        <td>Independent</td>
        <td><code>click</code></td>
        <td><code>(kordion, event)</code></td>
        <td>Any click event on the accordion</td>
      </tr>
    </tbody>
  </table>

### Methods

After initializing Kordion, you have an initialized instance of it in a variable (like the kordion variable in the example above) with useful methods and properties.

Example:

```JavaScript
const kordion = new Kordion("[data-kordion]");

// Open all accordions by clicking on `".show-all-in-container"`
// in the container with the class `.container`
const button = document.querySelector(".show-all-in-container")
button.addEventListener("click", () => {
  kordion.showAll(".container");
});
```

<table>
  <table>
    <thead>
      <tr>
        <th>Method</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>kordion.createInstance(element)</code></td>
        <td>Creates an accordion instance. Returns an accordion instance.</td>
      </tr>
      <tr>
        <td><code>kordion.toggle(instance)</code></td>
        <td>Toggle accordion. Accepts an accordion instance.</td>
      </tr>
      <tr>
        <td><code>kordion.show(instance)</code></td>
        <td>Accordion Opening Method.</td>
      </tr>
      <tr>
        <td><code>kordion.showAll(container)</code></td>
        <td>Method for opening all accordions in the specified container. Accepts a selector or DOM element of the container in which to search.</td>
      </tr>
      <tr>
        <td><code>kordion.showEverything()</code></td>
        <td>Method to open all accordions on a page.</td>
      </tr>
      <tr>
        <td><code>kordion.hide(instance)</code></td>
        <td>Accordion closing method.</td>
      </tr>
      <tr>
        <td><code>kordion.hideNested(instance)</code></td>
        <td>Method for closing child accordions.</td>
      </tr>
      <tr>
        <td><code>kordion.hideAll(container)</code></td>
        <td>Method for closing all accordions in the specified container. Accepts a selector or DOM element of the container in which to search.</td>
      </tr>
      <tr>
        <td><code>kordion.hideEverything()</code></td>
        <td>Method to close all accordions on a page.</td>
      </tr>
      <tr>
        <td><code>kordion.replaceIcon(instance, hidden = true)</code></td>
        <td>Method for replacing an icon. Accepts an accordion instance and a boolean icon value:<br>
        <code>true</code> = open accordion icon;
        <br>
        <code>false</code> = closed accordion icon.</td>
      </tr>
    </tbody>
  </table>

## Examples

Sorry, usage examples are in development.

## FAQ

### How to build ready files?

It's very simple. Make sure you are in the root of the repository and enter the commands in your terminal:

```bash
$ npm install
$ npm run build
```

Done. The collected files are in the `./dist` directory.
