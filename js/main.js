(() => {
    document.documentElement.classList.add("has-js");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onReady = () => {
        requestAnimationFrame(() => {
            document.body.classList.add("is-ready");
        });

        const header = document.querySelector("header");
        const handleScroll = () => {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        setupNav();
        setupImages();
        setupReveal();
        setupTransitions();
    };

    const setupNav = () => {
        const menuToggle = document.querySelector(".menu-toggle");
        const nav = document.querySelector("nav");
        const navList = nav ? nav.querySelector("ul") : null;
        if (!menuToggle || !nav || !navList) {
            return;
        }

        if (menuToggle.tagName !== "BUTTON") {
            menuToggle.setAttribute("role", "button");
            menuToggle.setAttribute("tabindex", "0");
        }

        nav.setAttribute("aria-label", "Ana Menu");
        if (!navList.id) {
            navList.id = "primary-nav";
        }
        menuToggle.setAttribute("aria-controls", navList.id);
        menuToggle.setAttribute("aria-expanded", "false");
        if (!menuToggle.getAttribute("aria-label")) {
            menuToggle.setAttribute("aria-label", "Menu");
        }

        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        navList.querySelectorAll("a").forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("http")) {
                return;
            }
            const target = href.split("/").pop();
            if (target === currentPath && !link.classList.contains("active")) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });

        const dropdowns = Array.from(navList.querySelectorAll(".dropdown"));
        const updateDropdown = (dropdown, isOpen) => {
            dropdown.classList.toggle("is-open", isOpen);
            const trigger = dropdown.querySelector("a");
            if (trigger) {
                trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
            }
        };
        const closeDropdowns = (except) => {
            dropdowns.forEach((dropdown) => {
                if (dropdown !== except) {
                    updateDropdown(dropdown, false);
                }
            });
        };
        const shouldUseClickToggle = () =>
            window.matchMedia("(max-width: 900px)").matches || nav.classList.contains("is-open");

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector("a");
            if (!trigger) {
                return;
            }
            trigger.setAttribute("aria-haspopup", "true");
            trigger.setAttribute("aria-expanded", "false");
            trigger.addEventListener("click", (event) => {
                if (!shouldUseClickToggle()) {
                    return;
                }
                const isOpen = dropdown.classList.contains("is-open");
                if (!isOpen) {
                    event.preventDefault();
                    closeDropdowns(dropdown);
                    updateDropdown(dropdown, true);
                } else {
                    updateDropdown(dropdown, false);
                }
            });
        });

        let isOpen = false;
        let lastFocus = null;

        const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

        const getFocusable = () => Array.from(navList.querySelectorAll(focusableSelector));

        const openMenu = () => {
            if (isOpen) {
                return;
            }
            isOpen = true;
            lastFocus = document.activeElement;
            nav.classList.add("is-open");
            document.body.classList.add("nav-open");
            menuToggle.setAttribute("aria-expanded", "true");
            const focusables = getFocusable();
            if (focusables.length) {
                focusables[0].focus();
            }
            document.addEventListener("keydown", handleKeydown);
            document.addEventListener("click", handleClickOutside);
        };

        const closeMenu = () => {
            if (!isOpen) {
                return;
            }
            isOpen = false;
            nav.classList.remove("is-open");
            document.body.classList.remove("nav-open");
            menuToggle.setAttribute("aria-expanded", "false");
            closeDropdowns();
            if (lastFocus && typeof lastFocus.focus === "function") {
                lastFocus.focus();
            }
            document.removeEventListener("keydown", handleKeydown);
            document.removeEventListener("click", handleClickOutside);
        };

        const toggleMenu = () => {
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        const handleKeydown = (event) => {
            if (!isOpen) {
                return;
            }
            if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
                return;
            }
            if (event.key !== "Tab") {
                return;
            }
            const focusables = getFocusable();
            if (!focusables.length) {
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        const handleClickOutside = (event) => {
            if (!isOpen) {
                return;
            }
            const target = event.target;
            if (navList.contains(target) || menuToggle.contains(target)) {
                return;
            }
            closeMenu();
        };

        menuToggle.addEventListener("click", toggleMenu);
        menuToggle.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleMenu();
            }
        });

        navList.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                closeMenu();
            });
        });

        document.addEventListener("click", (event) => {
            if (!navList.contains(event.target)) {
                closeDropdowns();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                closeMenu();
                closeDropdowns();
            }
        });
    };

    const setupImages = () => {
        document.querySelectorAll("img").forEach((img) => {
            if (img.closest("header")) {
                return;
            }
            if (!img.hasAttribute("loading")) {
                img.setAttribute("loading", "lazy");
            }
            img.setAttribute("decoding", "async");
        });
    };

    const setupReveal = () => {
        const targets = Array.from(
            document.querySelectorAll(
                "section:not(.hero), .service-card, .blog-card, .footer-item, .blog-post, .service-detail, .contact-form"
            )
        );

        targets.forEach((el) => {
            el.classList.add("reveal");
            if (el.matches(".service-card, .blog-card")) {
                const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
                const index = siblings.indexOf(el);
                if (index > -1) {
                    el.style.setProperty("--delay", `${Math.min(index, 6) * 90}ms`);
                }
            }
        });

        if (prefersReducedMotion) {
            targets.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        if (!("IntersectionObserver" in window)) {
            targets.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
        );

        targets.forEach((el) => observer.observe(el));
    };

    const setupTransitions = () => {
        if (prefersReducedMotion) {
            return;
        }
        const isModifiedClick = (event) =>
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

        document.querySelectorAll("a[href]").forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#")) {
                return;
            }
            if (link.target === "_blank") {
                return;
            }
            if (href.startsWith("mailto:") || href.startsWith("tel:")) {
                return;
            }
            if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
                return;
            }

            link.addEventListener("click", (event) => {
                if (isModifiedClick(event)) {
                    return;
                }
                event.preventDefault();
                document.body.classList.add("is-exiting");
                window.setTimeout(() => {
                    window.location.href = href;
                }, 180);
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
})();
