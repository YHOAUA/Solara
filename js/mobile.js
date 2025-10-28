(function () {
    if (!window.__SOLARA_IS_MOBILE) {
        return;
    }

    const bridge = window.SolaraMobileBridge || {};
    bridge.handlers = bridge.handlers || {};
    bridge.queue = Array.isArray(bridge.queue) ? bridge.queue : [];
    window.SolaraMobileBridge = bridge;

    const dom = window.SolaraDom || {};
    let initialized = false;

    function updateMobileToolbarTitleImpl() {
        if (!dom.mobileToolbarTitle) {
            return;
        }
        dom.mobileToolbarTitle.textContent = "Solara";
    }

    function updateMobileOverlayScrim() {
        if (!dom.mobileOverlayScrim || !document.body) {
            return;
        }
        const hasOverlay = document.body.classList.contains("mobile-search-open") ||
            document.body.classList.contains("mobile-panel-open");
        dom.mobileOverlayScrim.setAttribute("aria-hidden", hasOverlay ? "false" : "true");
    }

    function openMobileSearchImpl() {
        if (!document.body) {
            return;
        }
        document.body.classList.add("mobile-search-open");
        document.body.classList.remove("mobile-panel-open");
        if (dom.searchArea) {
            dom.searchArea.setAttribute("aria-hidden", "false");
        }
        updateMobileOverlayScrim();
        if (dom.searchInput) {
            window.requestAnimationFrame(() => {
                try {
                    dom.searchInput.focus({ preventScroll: true });
                } catch (error) {
                    dom.searchInput.focus();
                }
            });
        }
    }

    function closeMobileSearchImpl() {
        if (!document.body) {
            return;
        }
        document.body.classList.remove("mobile-search-open");
        if (dom.searchArea) {
            dom.searchArea.setAttribute("aria-hidden", "true");
        }
        if (dom.searchInput) {
            dom.searchInput.blur();
        }
        updateMobileOverlayScrim();
    }

    function toggleMobileSearchImpl() {
        if (!document.body) {
            return;
        }
        if (document.body.classList.contains("mobile-search-open")) {
            closeMobileSearchImpl();
        } else {
            openMobileSearchImpl();
        }
    }

    function normalizePanelView(view) {
        return view === "lyrics" ? "playlist" : (view || "playlist");
    }

    function openMobilePanelImpl(view = "playlist") {
        if (!document.body) {
            return;
        }
        const targetView = normalizePanelView(view);
        if (typeof window.switchMobileView === "function") {
            window.switchMobileView(targetView);
        }
        document.body.classList.add("mobile-panel-open");
        document.body.classList.remove("mobile-search-open");
        if (dom.searchArea) {
            dom.searchArea.setAttribute("aria-hidden", "true");
        }
        document.body.setAttribute("data-mobile-panel-view", targetView);
        updateMobileOverlayScrim();
    }

    function closeMobilePanelImpl() {
        if (!document.body) {
            return;
        }
        document.body.classList.remove("mobile-panel-open");
        document.body.classList.remove("mobile-panel-fullscreen");
        if (dom.mobilePanelExpand) {
            dom.mobilePanelExpand.setAttribute("aria-label", "展开全屏");
            dom.mobilePanelExpand.setAttribute("title", "展开全屏");
        }
        updateMobileOverlayScrim();
    }

    function toggleMobilePanelImpl(view = "playlist") {
        if (!document.body) {
            return;
        }
        const isOpen = document.body.classList.contains("mobile-panel-open");
        const currentView = document.body.getAttribute("data-mobile-panel-view") || "playlist";
        const targetView = normalizePanelView(view);
        if (isOpen && (!targetView || currentView === targetView)) {
            closeMobilePanelImpl();
        } else {
            openMobilePanelImpl(targetView || currentView || "playlist");
        }
    }

    function closeAllMobileOverlaysImpl() {
        closeMobileSearchImpl();
        closeMobilePanelImpl();
    }

    function toggleMobilePanelFullscreenImpl() {
        // Not needed anymore with new layout
    }

    function switchMobileContentTab(tabName) {
        const tabs = document.querySelectorAll('.mobile-tab-btn');
        const contents = document.querySelectorAll('.mobile-content-container > .playlist, .mobile-content-container > .lyrics');
        
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        contents.forEach(content => {
            if ((tabName === 'playlist' && content.classList.contains('playlist')) ||
                (tabName === 'lyrics' && content.classList.contains('lyrics'))) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    function initializeMobileUIImpl() {
        if (initialized || !document.body) {
            return;
        }
        initialized = true;

        document.body.classList.add("mobile-view");
        const initialView = "playlist";
        document.body.setAttribute("data-mobile-panel-view", initialView);
        if (dom.mobilePanelTitle) {
            dom.mobilePanelTitle.textContent = "播放列表";
        }
        if (dom.lyrics) {
            dom.lyrics.classList.remove("active");
        }
        if (dom.playlist) {
            dom.playlist.classList.add("active");
        }

        updateMobileToolbarTitleImpl();

        if (dom.mobileSearchToggle) {
            dom.mobileSearchToggle.addEventListener("click", toggleMobileSearchImpl);
        }
        if (dom.mobileSearchClose) {
            dom.mobileSearchClose.addEventListener("click", closeMobileSearchImpl);
        }
        if (dom.mobilePanelClose) {
            dom.mobilePanelClose.addEventListener("click", closeMobilePanelImpl);
        }
        if (dom.mobileQueueToggle) {
            dom.mobileQueueToggle.addEventListener("click", () => openMobilePanelImpl("playlist"));
        }
        if (dom.mobilePanelExpand) {
            dom.mobilePanelExpand.addEventListener("click", toggleMobilePanelFullscreenImpl);
        }

        // Setup mobile content tabs
        const tabButtons = document.querySelectorAll('.mobile-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                switchMobileContentTab(tabName);
            });
        });

        const handleGlobalPointerDown = (event) => {
            if (!document.body) {
                return;
            }
            const hasOverlay = document.body.classList.contains("mobile-search-open") ||
                document.body.classList.contains("mobile-panel-open");
            if (!hasOverlay) {
                return;
            }

            const target = event.target;
            if (dom.mobilePanel && (dom.mobilePanel === target || dom.mobilePanel.contains(target))) {
                return;
            }
            if (dom.searchArea && (dom.searchArea === target || dom.searchArea.contains(target))) {
                return;
            }
            if (dom.playerQualityMenu && dom.playerQualityMenu.contains(target)) {
                return;
            }
            if (target && typeof target.closest === "function" && target.closest(".quality-menu")) {
                return;
            }

            closeAllMobileOverlaysImpl();
        };

        document.addEventListener("pointerdown", handleGlobalPointerDown, true);
        if (dom.searchArea) {
            dom.searchArea.setAttribute("aria-hidden", "true");
        }
        if (dom.mobileOverlayScrim) {
            dom.mobileOverlayScrim.setAttribute("aria-hidden", "true");
        }

        updateMobileOverlayScrim();
    }

    bridge.handlers.updateToolbarTitle = updateMobileToolbarTitleImpl;
    bridge.handlers.openSearch = openMobileSearchImpl;
    bridge.handlers.closeSearch = closeMobileSearchImpl;
    bridge.handlers.toggleSearch = toggleMobileSearchImpl;
    bridge.handlers.openPanel = openMobilePanelImpl;
    bridge.handlers.closePanel = closeMobilePanelImpl;
    bridge.handlers.togglePanel = toggleMobilePanelImpl;
    bridge.handlers.closeAllOverlays = closeAllMobileOverlaysImpl;
    bridge.handlers.togglePanelFullscreen = toggleMobilePanelFullscreenImpl;
    bridge.handlers.switchContentTab = switchMobileContentTab;
    bridge.handlers.initialize = initializeMobileUIImpl;
    
    // Expose switchMobileContentTab globally for external use
    window.switchMobileContentTab = switchMobileContentTab;

    if (bridge.queue.length) {
        const pending = bridge.queue.splice(0, bridge.queue.length);
        for (const entry of pending) {
            const handler = bridge.handlers[entry.name];
            if (typeof handler === "function") {
                handler(...(entry.args || []));
            }
        }
    }
})();
