class Header extends HTMLElement {
    constructor() {
        super();
    };

    connectedCallback() {
        this.innerHTML = `
        <div class="header">
        <h1 class="title" id="title">SavourAI</h1>
        <div class="logocontainer"><img src = "graphics/chef-hat-chef-svgrepo-com.svg" alt="Chef Hat Graphic"/></div>
        </div>
        `;
    }
}

class Footer extends HTMLElement {
    constructor() {
        super();
    };

    connectedCallback() {
        this.innerHTML = `
        <div class="footer">
            <p>2024</p>
        </div>
        `;
    }
}

customElements.define('header-component', Header);
customElements.define('footer-component', Footer);
